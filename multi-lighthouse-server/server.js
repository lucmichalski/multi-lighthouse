const express = require('express')
const base64 = require('base-64')

const app = express()
const lighthouse = require('lighthouse')
const puppeteer = require('puppeteer')
const fetch = require('node-fetch')
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
    console.log(port, 'port')

    const { lhr, report } = await lighthouse(url, {
      port,
      output: 'html',
      onlyCategories: ['performance'],
      logLevel: 'debug',
    })
    browser.close()

    if (lhr.runtimeError) {
      console.log(lhr.runtimeError.code, lhr.requestedUrl)
    }
    // send report and lhr
    return { report, lhr }
  } catch (error) {
    console.log(error)
  }
}

function concurrentPuppeteerandLighthouses(urls) {
  return Promise.all(urls.map(url => launchPuppeteerRunLighthouse(url)))
    .then(results => results)
    .catch(error => console.log(error))
}

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

app.get('/urlsearch', async function(req, res) {
  const urls = req.query.q
  try {
    // only send lhr
    const lighthouses = await concurrentPuppeteerandLighthouses(urls)
    const lhrs = lighthouses.map(lighthouse => lighthouse.lhr)
    res.send(lhrs)
  } catch (error) {
    console.log(error)
  }
})

app.get('/topfivesearch', async function(req, res) {
  const googleSearchResults = await fetch(
    `https://www.googleapis.com/customsearch/v1?key=${process.env.API_KEY}&cx=${
      process.env.SEARCH_ENGINE
    }&start=1&num=5&q=${req.query.q}`
  )
    .then(res => res.json())
    .catch(error => console.log(error))
  const query = googleSearchResults.items.map(({ link }) => link)
  try {
    // only send lhr
    const lighthouses = await concurrentPuppeteerandLighthouses(query)
    const lhrs = lighthouses.map(lighthouse => lighthouse.lhr)
    res.send(lhrs)
  } catch (error) {
    console.log(error)
  }
})
//belongs in utils
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

app.get('/db/set/', async function(req, res) {
  const { url } = req.query
  const encodedQuery = base64.encode(url)
  const lighthouse = await launchPuppeteerRunLighthouse(url)
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
    runtimeError,
    audits: data,
    categories: { performance: { score: performance.score } },
  }

  if (runtimeError && runtimeError.code === 'NO_ERROR') {
    const lhrRef = db.ref(`lhr/${encodedQuery}/${date}`)
    const reportRef = db.ref(`report/${encodedQuery}/${date}`)
    reportRef.set(report)
    lhrRef.set(dbData)
    res.send(`${url} ${fetchTime} OK`)
  } else {
    res.send(`${url} ${fetchTime} Not OK`)
  }
})

const server = app.listen(process.env.PORT || 8080, err => {
  if (err) return console.error(err)
  const port = server.address().port
  console.info(`App listening on port ${port}`)
})
