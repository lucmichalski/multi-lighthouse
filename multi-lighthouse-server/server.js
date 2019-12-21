const base64 = require('base-64')
const lighthouse = require('lighthouse')
const puppeteer = require('puppeteer')

const { db } = require('./firebase')

const { PubSub } = require('@google-cloud/pubsub')

;(async function onStartup() {
  console.time('execution')
  await runLHSetDataForAllUsersUrls()
  await getShowcaseUrlsRunLighthouseSetData()
  await triggerPubSub()
  console.timeEnd('execution')
  ///UTILITY///
  // await testLH()
  return
})()

async function testLH() {
  const lh = await launchPuppeteerRunLighthouse('https://www.zillow.com')
  const { dbData } = transformData(lh)
  console.log(dbData)
}
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
      plugins: ['lighthouse-plugin-has-captcha-on-page-load'],
      settings: {
        maxWaitForFcp: 30 * 1000,
        onlyCategories: [
          'performance',
          'lighthouse-plugin-has-captcha-on-page-load',
        ],
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
      if (lhr && lhr.finalUrl !== lhr.requestedUrl) {
        const err = `Requested url does not match final url.\nRequested Url: ${
          lhr.requestedUrl
        }\nFinal Url: ${lhr.finalUrl}`
        return { report, lhr, err }
      }
      console.log(
        'Successful LHR',
        lhr.requestedUrl,
        lhr.categories.performance.score
      )
      return { report, lhr, err: 0 }
    }
    const runtimeError = lhr && lhr.runtimeError
    const errObj = JSON.stringify({ ...runtimeError, url })
    throw new Error(errObj)
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
    'has-captcha-on-page-load': hasCaptcha,
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
    captcha: {
      val: parseFloat(hasCaptcha.score * 100),
      score: Math.round(hasCaptcha.score * 100),
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
  // for (const url of urls) {
  //   try {
  //     await launchPuppeteerRunLighthouse(url)
  //   } catch (error) {
  //     console.log(error, 'Error while accounting for cold starts')
  //   }
  // }

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

module.exports = { getShowcaseUrls, getUsers }
