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
      val: firstContentfulPaint.rawValue.toFixed(2),
      score: firstContentfulPaint.score * 100,
    },
    fmp: {
      val: firstMeaningfulPaint.rawValue.toFixed(2),
      score: firstMeaningfulPaint.score * 100,
    },
    i: { val: interactive.rawValue.toFixed(2), score: interactive.score * 100 },
    fci: {
      val: firstCpuIdle.rawValue.toFixed(2),
      score: firstCpuIdle.score * 100,
    },
    eil: {
      val: estimatedInputLatency.rawValue.toFixed(2),
      score: estimatedInputLatency.score * 100,
    },
    si: { val: speedIndex.rawValue.toFixed(2), score: speedIndex.score * 100 },
    perf: { val: performance.score * 100, score: performance.score * 100 },
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
    { domain: 'https://www.bing.com/', cat: 'Search Engines' },
    { domain: 'https://www.google.com/', cat: 'Search Engines' },
    { domain: 'https://www.amazon.com/', cat: 'Shopping' },
    { domain: 'https://www.netflix.com/', cat: 'Streaming Video' },
    { domain: 'https://www.airbnb.com/', cat: 'Travel' },
    { domain: 'https://www.youtube.com/', cat: 'Streaming Video' },
    { domain: 'https://www.wikipedia.org/', cat: 'Information' },
    { domain: 'https://www.kayak.com/', cat: 'Travel' },
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

async function averageShowcaseOverallScores() {
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
      const averagePerformanceScores = average(
        showcaseLHRReportsByDate,
        (accumlator, nextReport) => accumlator + nextReport.perf.val
      )
      console.log(averagePerformanceScores, base64.decode(url), val.cat)
      db.ref()
        .child('showcase')
        .child(url)
        .update({ avg: averagePerformanceScores, cat: val.cat })
    } catch (error) {
      console.log(error)
    }
  }
  return
}

function average(arr, callback) {
  const average = arr.reduce(callback, 0) / arr.length
  return average
}

(async function onStartup() {
  try {
    // await runLHSetDataForAllUsersUrls()
    await getShowcaseUrlsRunLighthouseSetDbData()
    // await averageShowcaseOverallScores()
    // setShowcaseCategories()
  } catch (error) {
    console.log(error)
  }
})()
