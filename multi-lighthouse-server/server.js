const express = require('express')

const app = express()
const lighthouse = require('lighthouse')
const puppeteer = require('puppeteer')
const fetch = require('node-fetch')
const dotenv = require('dotenv')
const admin = require('firebase-admin')

const serviceAccount =
  './multi-lighthouse-firebase-adminsdk-3yznr-744b1662ca.json'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://multi-lighthouse.firebaseio.com/',
})
const db = admin.database()

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
app.get('/setLighthouseReport', async function(req, res) {
  const lighthouse = launchPuppeteerRunLighthouse(
    'https://www-dev.landsofamerica.com'
  )
  const ref = db.ref('lighthouseReports')
  try {
    ref.set({ hello: 'hi' })
  } catch (error) {
    console.log(error)
  }

  res.send(await lighthouse)
})

const server = app.listen(process.env.PORT || 8080, err => {
  if (err) return console.error(err)
  const port = server.address().port
  console.info(`App listening on port ${port}`)
})
