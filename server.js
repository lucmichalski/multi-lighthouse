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
      return lighthouse(url, opts, config).then(results => {
        // use results.lhr for the JS-consumeable output
        // https://github.com/GoogleChrome/lighthouse/blob/master/types/lhr.d.ts
        // use results.report for the HTML/JSON/CSV output as a string
        // use results.artifacts for the trace/screenshots/other specific case you need (rarer)
        return chrome.kill().then(() => results.lhr)
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
          console.log(err, 'this is the error')
          res.send(err)
        })
    )
  ).then(results => res.send(results))
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
