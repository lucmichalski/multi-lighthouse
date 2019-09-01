const base64 = require('base-64')

const lighthouse = require('lighthouse')
const puppeteer = require('puppeteer')

const dotenv = require('dotenv')
const { db } = require('./firebase')

// const { topsites } = require('./.response.js')

const { PubSub } = require('@google-cloud/pubsub')

async function triggerPubSub() {
  // Creates a client
  const pubsub = new PubSub()
  const topicName = 'stop-instance-event'
  const data = JSON.stringify({ zone: 'us-east1-b', label: 'env=dev' })
  // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
  const dataBuffer = Buffer.from(data)
  const messageId = await pubsub.topic(topicName).publish(dataBuffer)
  console.log(`Message ${messageId} published.`)
}

dotenv.config()
;(async function onStartup() {
  // await runLHSetDataForAllUsersUrls()
  await getShowcaseUrlsRunLighthouseSetData()
  // await triggerPubSub()

  ///UTILITY///
  // These next two have to be run together. Put them in a function. Probably should rename alot of this too.
  // await setShowcaseUrls()
  // await setTopSites()
  // await setShowcaseCategories()
  // await setUserUrls()
  //await launchPuppeteerRunLighthouse('https://www.coldwellbanker.com/d')
  return
})()

async function launchPuppeteerRunLighthouse(url) {
  try {
    const args = [
      '--no-sandbox',
      '--incognito',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-zygote',
    ]
    const browser = await puppeteer.launch({
      args,
    })
    const config = {
      extends: 'lighthouse:default',
      settings: {
        maxWaitForFcp: 30 * 1000,
        onlyCategories: ['performance'],
      },
    }

    const port = browser._connection._url.slice(15, 20)
    const { lhr, report } = await lighthouse(
      url,
      {
        port,
      },
      config
    )
    browser.close()

    if (
      (lhr && lhr.runtimeError && lhr.runtimeError.code === 'NO_ERROR') ||
      (lhr && !lhr.runtimeError)
    ) {
      console.log(lhr.requestedUrl, lhr.categories.performance.score)
      if (lhr && lhr.finalUrl !== lhr.requestedUrl) {
        const err = `Requested url does not match final url. Requested Url: ${
          lhr.requestedUrl
        } Final Url: ${lhr.finalUrl}`
        console.log(err)
        return { report, lhr, err }
      }
      return { report, lhr, err: 0 }
    }

    throw new Error()
  } catch (error) {
    console.log(error)
  }
}

function getDefinedData(data) {
  let lighthouseReports = {}

  Object.entries(data).forEach(([key, value]) => {
    lighthouseReports =
      value !== undefined
        ? {
            ...lighthouseReports,
            ...{ [key]: value },
          }
        : { ...lighthouseReports }
  })
  return lighthouseReports
}

function transformData(lighthouse) {
  if (!lighthouse || !lighthouse.lhr) {
    return {}
  }
  const { lhr, report, err } = lighthouse

  const { fetchTime, audits, categories, runtimeError, finalUrl } = lhr
  const { performance } = categories
  const date = base64.encode(fetchTime)
  const {
    interactive,
    'first-contentful-paint': firstContentfulPaint,
    'first-meaningful-paint': firstMeaningfulPaint,
    'estimated-input-latency': estimatedInputLatency,
    'first-cpu-idle': firstCpuIdle,
    'speed-index': speedIndex,
    'total-blocking-time': totalBlockingTime,
    'max-potential-fid': maxPotentialFid,
    'time-to-first-byte': timeToFirstByte,
  } = audits

  const auditData = {
    fcp: {
      val: parseFloat(firstContentfulPaint.numericValue.toFixed(2)),
      score: Math.round(firstContentfulPaint.score * 100),
    },
    fmp: {
      val: parseFloat(firstMeaningfulPaint.numericValue.toFixed(2)),
      score: Math.round(firstMeaningfulPaint.score * 100),
    },
    i: {
      val: parseFloat(interactive.numericValue.toFixed(2)),
      score: Math.round(interactive.score * 100),
    },
    fci: {
      val: parseFloat(firstCpuIdle.numericValue.toFixed(2)),
      score: Math.round(firstCpuIdle.score * 100),
    },
    eil: {
      val: parseFloat(estimatedInputLatency.numericValue.toFixed(2)),
      score: Math.round(estimatedInputLatency.score * 100),
    },
    si: {
      val: parseFloat(speedIndex.numericValue.toFixed(2)),
      score: Math.round(speedIndex.score * 100),
    },
    tbt: {
      val: parseFloat(totalBlockingTime.numericValue.toFixed(2)),
      score: Math.round(totalBlockingTime.score * 100),
    },
    mpfid: {
      val: parseFloat(maxPotentialFid.numericValue.toFixed(2)),
      score: Math.round(maxPotentialFid.score * 100),
    },
    ttfb: {
      val: parseFloat(timeToFirstByte.numericValue.toFixed(2)),
      score: Math.round(timeToFirstByte.score * 100),
    },
    perf: {
      val: Math.round(performance.score * 100),
      score: Math.round(performance.score * 100),
    },
  }

  const dbData = {
    fu: finalUrl,
    ft: fetchTime,
    re: runtimeError ? runtimeError.code : 'Runtime Error is Undefined',
    err,
    ...auditData,
  }

  return {
    fetchTime,
    dbData,
    date,
    finalUrl,
    report,
    performance,
  }
}

/////////////////////////////////
/////////////////////////////////
/////Users

async function runLighthouseSetUserData(
  url,
  uid = 'ChqBqCMRh1R2g8cAMjIezSabGMl2'
) {
  const formatURL = url[url.length - 1] === '/' ? url.slice(0, -1) : url
  const encodedQuery = base64.encode(formatURL)
  const lighthouse = await launchPuppeteerRunLighthouse(formatURL)
  const { fetchTime, finalUrl, date, dbData, performance } = transformData(
    lighthouse
  )

  if (dbData) {
    const lhrRef = db.ref(`${uid}/lhr/${encodedQuery}/${date}`)
    lhrRef.set(dbData, error => error && console.log(error))
    console.log(
      `Setting DB Data for ${finalUrl}. The total score is ${performance.score}`
    )
  }

  return { message: `${formatURL} ${fetchTime} OK` }
}

async function getSetLHDataForUser(uid) {
  const ref = await db.ref(`${uid}/urls`)
  const urlsSnapshot = await ref.once('value')
  const urls = Object.values(urlsSnapshot.val())

  // Trying to account for cold starts
  for (const url of urls) {
    try {
      await launchPuppeteerRunLighthouse(url)
    } catch (error) {
      console.log(error, 'Error while accounting for cold starts')
    }
  }

  //The real deal
  for (const url of urls) {
    try {
      await runLighthouseSetUserData(url, uid)
    } catch (error) {
      console.log(error, 'Errow while running lighthouse and setting for users')
    }
  }
  return urls
}

async function getUsers() {
  const userRef = db.ref().child('users')
  const userSnapshot = await userRef.once('value')
  const users = Object.keys(userSnapshot.val())
  console.log(users)
  return users
}

async function runLHSetDataForAllUsersUrls() {
  const users = await getUsers()
  for (const user of users) {
    await getSetLHDataForUser(user)
  }
  console.log('All User Data is Set')
}

/////////////////////////////////
////////////////////////////////
/////Showcases

async function getShowcaseUrls() {
  const showcaseRef = db.ref().child('showcaseUrls')
  const showcaseSnapshot = await showcaseRef.once('value')
  const showcaseUrls = Object.entries(showcaseSnapshot.val())

  return showcaseUrls
}

async function getShowcaseUrlsRunLighthouseSetData() {
  const showcaseUrls = await getShowcaseUrls()
  //Account for cold start
  // for (const [url, val] of showcaseUrls) {
  //   try {
  //     const decodedUrl = base64.decode(url)
  //     await launchPuppeteerRunLighthouse(decodedUrl)
  //   } catch (error) {
  //     console.log(
  //       error,
  //       'error accounting for cold starts running lighthouse for showcase data'
  //     )
  //   }
  // }

  //Real Deal
  for (const [url, val] of showcaseUrls) {
    try {
      const decodedUrl = base64.decode(url)
      const lighthouse = await launchPuppeteerRunLighthouse(decodedUrl)
      const { finalUrl, date, dbData, performance } = transformData(lighthouse)

      if (dbData) {
        const urlRef = db.ref(`showcaseReports/${url}`)
        const currentRef = urlRef.child(`current`)
        const lhrRef = urlRef.child(`/lhr/${date}`)
        lhrRef.set(dbData, error => error && console.log(error))
        currentRef.set(dbData, error => error && console.log(error))
        console.log(
          `Setting DB Data for ${finalUrl}. The total score is ${
            performance.score
          }`
        )
      }
    } catch (error) {
      console.log(
        error,
        'Error while running lighthouse and setting data for showcases'
      )
    }
  }
  console.log('showcases are set')
  return
}

//////////////////////////////////////
/////////////////////////////////////
//Helpers
// async function deleteUserData() {
// const users = await getUsers()
// for (const user of users) {
//   const lhrRef = db
//     .ref()
//     .child(user)
//     .child('lhr')
//   lhrRef.remove()
//   const reportRef = db
//     .ref()
//     .child(user)
//     .child('report')
//   reportRef.remove()
// }
// return
// }

function setUserUrls() {
  const urls = [
    'https://www-dev.landsofamerica.com',
    'https://www-dev.landsofamerica.com/United-States/all-land',
    'https://www-dev.landsofamerica.com/Texas/all-land',
    'https://www-dev.landsofamerica.com/property/3015-acres-in-Dimmit-County-Texas/4398158',
    'https://www-dev.landsofamerica.com/property/36-acres-in-Apache-County-Arizona/2876090',
    'https://www.landsofamerica.com',
    'https://www.landsofamerica.com/United-States/all-land',
    'https://www.landsofamerica.com/Texas/all-land',
    'https://www.landsofamerica.com/property/3015-acres-in-Dimmit-County-Texas/4398158',
    'https://www.landsofamerica.com/property/36-acres-in-Apache-County-Arizona/2876090',
    `https://www.landsoftexas.com`,
    'https://www.landsoftexas.com/texas/all-land',
    'https://www.landsoftexas.com/property/Hope-Drive-Cleveland-Texas-77327/7019079',
    `https://www.landwatch.com`,
    'https://www.landwatch.com/Texas_land_for_sale',
    'https://www.landwatch.com/Land_For_Sale',
    'https://www.landwatch.com/Arizona-Farms-and-Ranches-for-sale/pid/25009743',
    'https://www.landwatch.com/Park-County-Colorado-House-for-sale/pid/334699603',
    'https://www.landandfarm.com',
    'https://www.landandfarm.com/search/all-land',
    'https://www.landandfarm.com/search/Texas-land-for-sale',
    'https://www.landandfarm.com/property/Final_Release_of_Prime_Waterfront_Acreage-9598883',
    'https://www.landandfarm.com/property/_6_Acres_Sonoita_AZ-9633103',
  ]
  // 'https://beta.landsofamerica.com',
  // 'https://beta.landsofamerica.com/United-States/all-land',
  // 'https://beta.landsofamerica.com/Texas/all-land',
  // 'https://beta.landsofamerica.com/property/3015-acres-in-Dimmit-County-Texas/4398158',
  // 'https://beta.landsofamerica.com/property/36-acres-in-Apache-County-Arizona/2876090',

  const urlObj = urls.reduce((obj, item) => {
    obj[base64.encode(item)] = item
    return obj
  }, {})

  db.ref()
    .child('ChqBqCMRh1R2g8cAMjIezSabGMl2')
    .child('urls')
    .set(urlObj)
}

async function setShowcaseCategories() {
  const showcaseUrls = await getShowcaseUrls()
  for (const [url, val] of showcaseUrls) {
    const categoriesRef = db.ref().child('showcaseCategories')
    const categoryNode = await categoriesRef.child(val.cat).once('value')

    if (!categoryNode.exists()) {
      categoriesRef.update({ [val.cat]: { urls: { [url]: url } } })
    } else {
      //check if url exists here maybe?
      const urlRef = categoriesRef.child(val.cat).child('urls')

      urlRef.update({ [url]: base64.decode(url) })
    }
  }
}
async function testErrors() {
  const urls = ['https://www-dev.landsofamerica.com']
  for (const url of urls) {
    try {
      const lhr = await launchPuppeteerRunLighthouse(url)
      await transformData(lhr)
    } catch (error) {
      console.log(error)
    }
  }
}

//Utility function to set data
async function setShowcaseUrls() {
  const Ref = db.ref().child('showcaseUrls')

  const urls = [
    { domain: 'https://www.redfin.com', cat: 'Real Estate' },
    { domain: 'https://www.trulia.com', cat: 'Real Estate' },
    { domain: 'https://www.landandfarm.com', cat: 'Real Estate' },
    { domain: 'https://www.land.com', cat: 'Real Estate' },
    { domain: 'https://www.landsofamerica.com', cat: 'Real Estate' },
    { domain: 'https://www.zillow.com', cat: 'Real Estate' },
    { domain: 'https://www.realtor.com', cat: 'Real Estate' },
    { domain: 'https://www.loopnet.com', cat: 'Real Estate' },
    { domain: 'https://www.remax.com', cat: 'Real Estate' },
    { domain: 'https://www.movoto.com', cat: 'Real Estate' },
    { domain: 'https://www.sothebysrealty.com/eng', cat: 'Real Estate' },
    { domain: 'https://www.costar.com', cat: 'Real Estate' },
    { domain: 'https://www.century21.com', cat: 'Real Estate' },
    { domain: 'https://www.coldwellbanker.com', cat: 'Real Estate' },
    { domain: 'https://www.landwatch.com', cat: 'Real Estate' },
    { domain: 'https://www.wsj.com', cat: 'Newspapers' },
    { domain: 'https://economictimes.indiatimes.com', cat: 'Newspapers' },
    { domain: 'https://www.ft.com/', cat: 'Newspapers' },
    { domain: 'https://www.economist.com', cat: 'Newspapers' },
    { domain: 'https://www.bizjournals.com', cat: 'Newspapers' },
    { domain: 'https://www.globes.co.il', cat: 'Newspapers' },
    { domain: 'https://www.ibtimes.com', cat: 'Newspapers' },
    { domain: 'https://www.brecorder.com', cat: 'Newspapers' },
    { domain: 'http://labusinessjournal.com', cat: 'Newspapers' },
    { domain: 'https://www.businessnews.com.au', cat: 'Newspapers' },
    { domain: 'https://www.texastribune.org', cat: 'Newspapers' },
    { domain: 'https://www.dallasnews.com', cat: 'Newspapers' },
    { domain: 'https://www.foxnews.com', cat: 'Newspapers' },
    { domain: 'https://www.nytimes.com', cat: 'Newspapers' },
    { domain: 'https://www.telegraph.co.uk', cat: 'Newspapers' },
    { domain: 'https://www.cnn.com', cat: 'Newspapers' },
    { domain: 'https://www.amazon.com', cat: 'Shopping' },
    { domain: 'https://www.bestbuy.com', cat: 'Shopping' },
    { domain: 'https://www.nike.com', cat: 'Shopping' },
    { domain: 'https://www.zappos.com', cat: 'Shopping' },
    { domain: 'https://www.wholefoodsmarket.com', cat: 'Shopping' },
  ]
  const urlObj = urls.reduce((obj, item) => {
    obj[base64.encode(item.domain)] = { cat: item.cat }
    return obj
  }, {})

  Ref.set(urlObj)
  console.log('Showcase Urls have been put in firebase')
  return
}

function setTopSites() {
  const topsitesArr = JSON.parse(topsites).Ats.Results.Result.Alexa.TopSites
    .Country.Sites.Site
  const Ref = db.ref().child('showcaseUrls')

  const topsSitesObj = topsitesArr.reduce((acc, item) => {
    const url = `https://www.${item.DataUrl}`
    acc[base64.encode(url)] = {
      url,
      cat: 'Top',
      rank: item.Global.Rank,
      views: item.Country.PageViews,
    }
    return acc
  }, {})
  console.log(topsSitesObj)

  Ref.update(topsSitesObj)
}
