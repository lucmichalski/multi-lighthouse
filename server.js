const express = require('express')

const app = express()
const port = 8001
const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')

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
  chromeFlags: ['--show-paint-rects'],
}

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
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

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
