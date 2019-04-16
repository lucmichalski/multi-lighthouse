const express = require('express')
const base64 = require('base-64')

const app = express()
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

  const data = {
    'first-contentful-paint': getDefinedData(firstContentfulPaint),
    'first-meaningful-paint': getDefinedData(firstMeaningfulPaint),
    interactive: getDefinedData(interactive),
    'first-cpu-idle': getDefinedData(firstCpuIdle),
    'estimated-input-latency': getDefinedData(estimatedInputLatency),
    'speed-index': getDefinedData(speedIndex),
  }

  const dbData = {
    finalUrl,
    fetchTime,
    audits: data,
    runtimeError: runtimeError || 'Runtime Error is Undefined',
    categories: { performance: { score: performance.score } },
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
  const {
    fetchTime,
    finalUrl,
    date,
    dbData,
    report,
    performance,
  } = transformData(lighthouse)

  const lhrRef = db.ref(`${uid}/lhr/${encodedQuery}/${date}`)
  const reportRef = db.ref(`${uid}/report/${encodedQuery}/${date}`)

  console.log(
    `Setting DB Data for ${finalUrl}. The total score is ${performance.score}`
  )
  if (report) {
    reportRef.set(report, error => error && console.log(error))
  }
  if (dbData) {
    lhrRef.set(dbData, error => error && console.log(error))
  }

  return { message: `${formatURL} ${fetchTime} OK` }
}

app.get('/', async function(req, res) {
  res.send('hello world')
})

app.get('/db/set/', async function(req, res) {
  const { url } = req.query
  const { message } = await runLighthouseSetDBData(url)
  res.send(message)
})
app.get('/db/get/set', async function(req, res) {
  const urls = await getSetLHData()
  res.send(urls)
})

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

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
async function setData() {
  const Ref = db
    .ref()
    .child('showcase')
    .child('urls')
  const google = 'https://www.google.com/'
  const amazon = 'https://www.amazon.com/'
  const netflix = 'https://www.netflix.com/'
  const airbnb = 'https://www.airbnb.com/'
  const youtube = 'https://www.youtube.com/'
  const wikipedia = 'https://www.wikipedia.org/'

  Ref.set({
    [base64.encode(google)]: google,
    [base64.encode(amazon)]: amazon,
    [base64.encode(netflix)]: netflix,
    [base64.encode(airbnb)]: airbnb,
    [base64.encode(youtube)]: youtube,
    [base64.encode(wikipedia)]: wikipedia,
  })
}

async function getUsers() {
  const userRef = db.ref().child('users')
  const userSnapshot = await userRef.once('value')
  const users = Object.keys(userSnapshot.val())
  console.log(users)
  return users
}

async function getShowcaseUrls() {
  const showcaseRef = db
    .ref()
    .child('showcase')
    .child('urls')
  const showcaseSnapshot = await showcaseRef.once('value')
  const showcaseUrls = Object.keys(showcaseSnapshot.val())
  console.log(showcaseUrls)
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
  for (const url of showcaseUrls) {
    const decodedUrl = base64.decode(url)
    await launchPuppeteerRunLighthouse(decodedUrl)
  }

  //Real Deal
  for (const url of showcaseUrls) {
    const decodedUrl = base64.decode(url)
    const lighthouse = await launchPuppeteerRunLighthouse(decodedUrl)
    const { finalUrl, date, dbData, report, performance } = transformData(
      lighthouse
    )
    const lhrRef = db.ref(`showcase/${url}/lhr/${date}`)
    const reportRef = db.ref(`showcase/${url}/report/${date}`)

    console.log(
      `Setting DB Data for ${finalUrl}. The total score is ${performance.score}`
    )
    if (report) {
      reportRef.set(report, error => error && console.log(error))
    }
    if (dbData) {
      lhrRef.set(dbData, error => error && console.log(error))
    }
  }
  console.log('showcases are set')
  return
}

(async function onStartup() {
  for (let i = 0; i <= 4; i++) {
    try {
      await runLHSetDataForAllUsersUrls()
      await getShowcaseUrlsRunLighthouseSetDbData()
    } catch (error) {
      console.log(error)
    }
  }
})()

const server = app.listen(process.env.PORT || 8080, err => {
  if (err) return console.error(err)
  const port = server.address().port
  console.info(`App listening on port ${port}`)
})
