const base64 = require('base-64')

const lighthouse = require('lighthouse')
const puppeteer = require('puppeteer')

const dotenv = require('dotenv')
const { db } = require('./firebase')

dotenv.config()

async function launchPuppeteerRunLighthouse(url) {
  try {
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--incognito',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-zygote',
      ],
    })
    const port = browser._connection._url.slice(15, 20)
    //set timeout here for lighthouse that takes too long
    const { lhr, report } = await lighthouse(url, {
      port,
      output: 'html',
      onlyCategories: ['performance'],
    })
    browser.close()

    if (
      (lhr && lhr.runtimeError && lhr.runtimeError.code === 'NO_ERROR') ||
      (lhr && !lhr.runtimeError)
    ) {
      console.log(lhr.requestedUrl, lhr.categories.performance.score)

      return { report, lhr }
    }
    //Is this handling the error correctly and just moving on to the next url?
    //or should I return an error and then throw from another function?
    throw 'No Lighthouse Report Generated'
  } catch (error) {
    console.log(error)
    throw error
  }
}

//belongs in utils
//all functions file and routes file
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
  const { lhr, report } = lighthouse
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
  } = audits

  const auditData = {
    fcp: {
      val: parseFloat(firstContentfulPaint.rawValue.toFixed(2)),
      score: firstContentfulPaint.score * 100,
    },
    fmp: {
      val: parseFloat(firstMeaningfulPaint.rawValue.toFixed(2)),
      score: firstMeaningfulPaint.score * 100,
    },
    i: {
      val: parseFloat(interactive.rawValue.toFixed(2)),
      score: interactive.score * 100,
    },
    fci: {
      val: parseFloat(firstCpuIdle.rawValue.toFixed(2)),
      score: firstCpuIdle.score * 100,
    },
    eil: {
      val: parseFloat(estimatedInputLatency.rawValue.toFixed(2)),
      score: estimatedInputLatency.score * 100,
    },
    si: {
      val: parseFloat(speedIndex.rawValue.toFixed(2)),
      score: speedIndex.score * 100,
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

async function runLighthouseSetDBData(
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

async function getSetLHData(uid) {
  const ref = await db.ref(`${uid}/urls`)
  const urlsSnapshot = await ref.once('value')
  const urls = Object.values(urlsSnapshot.val())

  // Trying to account for cold starts
  for (const url of urls) {
    await launchPuppeteerRunLighthouse(url)
  }

  //The real deal
  for (const url of urls) {
    await runLighthouseSetDBData(url, uid)
  }
  return urls
}

//Utility function to set data
async function setShowcaseURLData() {
  const Ref = db
    .ref()
    .child('showcase')
    .child('urls')

  const urls = [
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
  ]
  const urlObj = urls.reduce((obj, item) => {
    obj[base64.encode(item.domain)] = { cat: item.cat }
    return obj
  }, {})

  Ref.set(urlObj)
}

async function getUsers() {
  const userRef = db.ref().child('users')
  const userSnapshot = await userRef.once('value')
  const users = Object.keys(userSnapshot.val())
  console.log(users)
  return users
}

//Utility function to delete data
async function deleteData() {
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
  //return
}

async function deleteShowcaseData() {
  const showcaseUrls = await getShowcaseUrls()
  for (const [url, val] of showcaseUrls) {
    const urlRef = db
      .ref()
      .child('showcase')
      .child(url)
    urlRef.remove()
  }
  return
}

async function getShowcaseUrls() {
  const showcaseRef = db
    .ref()
    .child('showcase')
    .child('urls')
  const showcaseSnapshot = await showcaseRef.once('value')
  const showcaseUrls = Object.entries(showcaseSnapshot.val())

  return showcaseUrls
}

async function runLHSetDataForAllUsersUrls() {
  const users = await getUsers()
  for (const user of users) {
    await getSetLHData(user)
  }
}

async function getShowcaseUrlsRunLighthouseSetDbData() {
  const showcaseUrls = await getShowcaseUrls()
  //Account for cold start
  for (const [url, val] of showcaseUrls) {
    const decodedUrl = base64.decode(url)
    await launchPuppeteerRunLighthouse(decodedUrl)
  }

  //Real Deal
  for (const [url, val] of showcaseUrls) {
    const decodedUrl = base64.decode(url)
    const lighthouse = await launchPuppeteerRunLighthouse(decodedUrl)
    const { finalUrl, date, dbData, performance } = transformData(lighthouse)

    if (dbData) {
      const urlRef = db.ref(`showcase/${url}`)
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
  }
  console.log('showcases are set')
  return
}

async function setShowcaseCategories() {
  const showcaseUrls = await getShowcaseUrls()
  for (const [url, val] of showcaseUrls) {
    const categoriesRef = db.ref().child('categories')
    const categoryNode = await categoriesRef.child(val.cat).once('value')

    if (!categoryNode.exists()) {
      categoriesRef.update({ [val.cat]: { urls: { [url]: url } } })
    } else {
      //check if url exists here maybe?
      const urlRef = categoriesRef.child(val.cat).child('urls')

      urlRef.update({ [url]: url })
    }
  }
}

async function averageShowcaseScores() {
  const showcaseUrls = await getShowcaseUrls()
  console.log(showcaseUrls)
  for (const [url, val] of showcaseUrls) {
    try {
      const showcaseRef = db
        .ref()
        .child('showcase')
        .child(url)
        .child('lhr')

      if (!showcaseRef) {
        continue
      }

      const showcaseSnapshot = await showcaseRef.once('value')
      const showcaseLHRReportsByDate = Object.values(
        await showcaseSnapshot.val()
      )
      const avg = averageAll(showcaseLHRReportsByDate)
      const { cat } = val

      console.log(avg, base64.decode(url), cat)
      db.ref()
        .child('showcase')
        .child(url)
        .update({ avg, cat })
    } catch (error) {
      console.log(error)
    }
  }
  return
}

function archiveAverages() {
  //get urls
  //loop through urls
  //get avg snapshot
  //set avg in archivedAvg with a new Date timestamp
  //remove lhr node possibly as the very last thing.
  // make this a firebase function which runs once a month. Or every 15days.
}

function averageAll(reports) {
  let avg = {}
  const metrics = ['i', 'perf', 'fci', 'fmp', 'fcp', 'eil', 'si']
  for (const metric of metrics) {
    avg = {
      ...avg,
      [metric]: average(
        reports,
        (accumlator, nextReport) => accumlator + nextReport[metric].val
      ),
    }
  }
  return avg
}

function average(arr, callback) {
  const average = arr.reduce(callback, 0) / arr.length
  return parseFloat(average.toFixed(2))
}

(async function onStartup() {
  try {
    // await runLHSetDataForAllUsersUrls()
    // await getShowcaseUrlsRunLighthouseSetDbData()

    //Maintenance Functions
    //await deleteShowcaseData()
    //await setShowcaseURLData()
    //await averageShowcaseScores()
    //setShowcaseCategories()
  } catch (error) {
    console.log(error)
  }
})()
