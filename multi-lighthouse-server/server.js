const express = require('express')

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

    const { lhr } = await lighthouse(url, {
      port,
      output: 'json',
      onlyCategories: ['performance'],
      logLevel: 'debug',
    })
    browser.close()

    if (lhr.runtimeError) {
      console.log(lhr.runtimeError.code, lhr.requestedUrl)
    }

    return lhr
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
    res.send(await concurrentPuppeteerandLighthouses(urls))
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
    res.send(await concurrentPuppeteerandLighthouses(query))
  } catch (error) {
    console.log(error)
  }
})

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

app.get('/setLighthouseReport', async function(req, res) {
  const lighthouse = await launchPuppeteerRunLighthouse(
    'https://www-dev.landsofamerica.com'
  )
  const { fetchTime, audits, categories, runtimeError } = lighthouse
  const { performance } = categories
  const {
    interactive,
    'first-contentful-paint': firstContentfulPaint,
    'first-meaningful-paint': firstMeaningfulPaint,
    'estimated-input-latency': estimatedInputLatency,
    'first-cpu-idle': firstCpuIdle,
    'speed-index': speedIndex,
  } = audits
  const date = fetchTime.split(':')[0]
  const ref = db.ref(`lighthouseReports/Home/${date}`)
  const data = {
    'first-contentful-paint': getDefinedData(firstContentfulPaint),
    'first-meaningful-paint': getDefinedData(firstMeaningfulPaint),
    'time-to-interactive': getDefinedData(interactive),
    'first-cpu-idle': getDefinedData(firstCpuIdle),
    'estimated-input-latency': getDefinedData(estimatedInputLatency),
    'speed-index': getDefinedData(speedIndex),
  }

  ref.set({
    runtimeError,
    audits: data,
    categories: { performance: { score: performance.score } },
  })
  res.send(lighthouse)
})

const server = app.listen(process.env.PORT || 8080, err => {
  if (err) return console.error(err)
  const port = server.address().port
  console.info(`App listening on port ${port}`)
})
