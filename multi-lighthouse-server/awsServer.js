const chrome = require('chrome-aws-lambda')
const puppeteer = require('puppeteer-core')
const lighthouse = require('lighthouse')

async function launchPuppeteerRunLighthouse(url) {
  try {
    const browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
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

launchPuppeteerRunLighthouse('https://www-dev.landsofamerica.com')
