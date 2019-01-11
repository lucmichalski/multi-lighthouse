const express = require('express')

const app = express()
const lighthouse = require('lighthouse')
const puppeteer = require('puppeteer')

async function launchPuppeteerRunLighthouse(url) {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
    })
    //await browser.newPage()
    const port = browser._connection._url.slice(15, 20)
    console.log(port, 'port')
    process.on('unhandledRejection', async (reason, p) => {
      console.error('Unhandled Rejection at: Promise', p, 'reason: ', reason)
      browser.close()
    })
    //await page.goto(url)
    const { lhr } = await lighthouse(url, {
      port,
      output: 'json',
      onlyCategories: ['performance'],
    })
    browser.close()
    return lhr
  } catch (error) {
    console.log(error)
  }
}

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

app.get('/', function(req, res) {
  const urls = req.query.urls

  Promise.all(urls.map(url => launchPuppeteerRunLighthouse(url)))
    .then(results => res.send(results))
    .catch(error => console.log(error))
})

const server = app.listen(process.env.PORT || 8080, err => {
  if (err) return console.error(err)
  const port = server.address().port
  console.info(`App listening on port ${port}`)
})
