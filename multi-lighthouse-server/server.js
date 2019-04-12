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

    if (lhr.runtimeError) {
      console.log(
        lhr.runtimeError.code,
        lhr.requestedUrl,
        lhr.categories.performance.score
      )
    }
    return { report, lhr }
  } catch (error) {
    console.log(error)
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
    runtimeError,
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
    runtimeError,
    finalUrl,
    date,
    dbData,
    report,
    performance,
  } = transformData(lighthouse)

  const lhrRef = db.ref(`${uid}/lhr/${encodedQuery}/${date}`)
  const reportRef = db.ref(`${uid}/report/${encodedQuery}/${date}`)

  console.log(
    runtimeError,
    `Setting DB Data for ${finalUrl}. The total score is ${performance.score}`
  )
  reportRef.set(report, error => error && console.log(error))
  lhrRef.set(dbData, error => error && console.log(error))

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
  const usersRef = db
    .ref()
    .child('UTpDxze52nQZsp2dBlux8eSQ8oJ2')
    .child('urls')
  const trulia = 'https://www.trulia.com/'

  usersRef.update({
    [base64.encode(trulia)]: trulia,
  })
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
    await getSetLHData(user)
  }
}

// (async function onStartup() {
//   for (let i = 0; i <= 4; i++) {
//     try {
//       await runLHSetDataForAllUsersUrls()
//     } catch (error) {
//       console.log(error)
//     }
//   }
// })()

const server = app.listen(process.env.PORT || 8080, err => {
  if (err) return console.error(err)
  const port = server.address().port
  console.info(`App listening on port ${port}`)
})
