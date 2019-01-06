var express = require('express');
var app = express();
const port = 3000;
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

function launchChromeAndRunLighthouse(url, opts, config = null) {
  return chromeLauncher
    .launch({ chromeFlags: opts.chromeFlags })
    .then(chrome => {
      opts.port = chrome.port;
      return lighthouse(url, opts, config).then(results => {
        // use results.lhr for the JS-consumeable output
        // https://github.com/GoogleChrome/lighthouse/blob/master/types/lhr.d.ts
        // use results.report for the HTML/JSON/CSV output as a string
        // use results.artifacts for the trace/screenshots/other specific case you need (rarer)
        return chrome.kill().then(() => results.lhr);
      });
    });
}

const opts = {
  chromeFlags: ['--show-paint-rects']
};

const urls = ['https://cnn.com', 'https://www.walmart.com/'];

app.get('/', function(req, res) {
  Promise.all(
    urls.map(url =>
      launchChromeAndRunLighthouse(url, opts)
        .then(results => results)
        .catch(err => {
          console.log(err);
        })
    )
  ).then(results => res.send(results));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
