const express = require('express')

const app = express()
const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')
const puppeteer = require('puppeteer')

function launchChromeAndRunLighthouse(url, opts, config = null) {
  return chromeLauncher
    .launch({ chromeFlags: opts.chromeFlags })
    .then(chrome => {
      opts.port = chrome.port
      return lighthouse(url, opts, config)
        .then(results => {
          return chrome.kill().then(() => results.lhr)
        })
        .catch(err => {
          console.log(err, 'this is the error from lighthouse')
          return chrome.kill().then(() => err)
        })
    })
}

const opts = {
  chromeFlags: ['--headless'],
}

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

app.get('/', async function(req, res) {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
    })
    console.log(browser, 'browser')
    const URL = 'https://www.chromestatus.com/features'
    try {
      const { report } = await lighthouse(URL, {
        opts,
      })
      console.log(report, 'lighthouse report')
    } catch (error) {
      console.log('lighthose error', error)
    }

    await browser.disconnect()
    try {
      const opts = {
        chromeFlags: ['--headless'],
        logLevel: 'info',
        output: 'json',
      }
      const chrome = await chromeLauncher.launch(opts)
      console.log(chrome, 'chrome')

      await chrome.kill()
    } catch (error) {
      console.log(error, 'error')
    }

    res.send(browser.toString() + 'hi')
  } catch (error) {
    console.log(error)
    res.send(error + 'error')
  }
})

app.get('/lighthouse', function(req, res) {
  const urls = req.query.urls
  Promise.all(
    urls.map(url =>
      launchChromeAndRunLighthouse(url, opts)
        .then(results => results)
        .catch(err => {
          console.log(err, 'this is the error from promise.all')
        })
    )
  ).then(results => res.send(results))
})

const server = app.listen(process.env.PORT || 8080, err => {
  if (err) return console.error(err)
  const port = server.address().port
  console.info(`App listening on port ${port}`)
})
