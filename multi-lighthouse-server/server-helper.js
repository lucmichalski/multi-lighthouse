const base64 = require('base-64')

const { db } = require('./firebase')
const { getShowcaseUrls, getUsers } = require('./server.js')
const { topsites } = require('./.response.js')

;(async function onStartup() {
  ///UTILITY///
  // These next two have to be run together. Put them in a function. Probably should rename alot of this too.
  // await setShowcaseUrls()
  // await setTopSites()
  // await setShowcaseCategories()
  // await setUserUrls()

  return
})()

function setUserUrls() {
  const urls = [
    'https://www-dev.landsofamerica.com',
    'https://www-dev.landsofamerica.com/United-States/all-land',
    'https://www-dev.landsofamerica.com/Texas/all-land',
    'https://www-dev.landsofamerica.com/property/3015-acres-in-Dimmit-County-Texas/4398158',
    'https://www-dev.landsofamerica.com/property/36-acres-in-Apache-County-Arizona/2876090',
    'https://www.landsofamerica.com',
    'https://www.landsofamerica.com/United-States/all-land',
    'https://www.landsofamerica.com/Texas/all-land',
    'https://www.landsofamerica.com/property/3015-acres-in-Dimmit-County-Texas/4398158',
    'https://www.landsofamerica.com/property/36-acres-in-Apache-County-Arizona/2876090',
    `https://www.landsoftexas.com`,
    'https://www.landsoftexas.com/texas/all-land',
    'https://www.landsoftexas.com/property/Hope-Drive-Cleveland-Texas-77327/7019079',
    `https://www.landwatch.com`,
    'https://www.landwatch.com/Texas_land_for_sale',
    'https://www.landwatch.com/Land_For_Sale',
    'https://www.landwatch.com/Arizona-Farms-and-Ranches-for-sale/pid/25009743',
    'https://www.landwatch.com/Park-County-Colorado-House-for-sale/pid/334699603',
    'https://www.landandfarm.com',
    'https://www.landandfarm.com/search/all-land',
    'https://www.landandfarm.com/search/Texas-land-for-sale',
    'https://www.landandfarm.com/property/Final_Release_of_Prime_Waterfront_Acreage-9598883',
    'https://www.landandfarm.com/property/_6_Acres_Sonoita_AZ-9633103',
  ]
  // 'https://beta.landsofamerica.com',
  // 'https://beta.landsofamerica.com/United-States/all-land',
  // 'https://beta.landsofamerica.com/Texas/all-land',
  // 'https://beta.landsofamerica.com/property/3015-acres-in-Dimmit-County-Texas/4398158',
  // 'https://beta.landsofamerica.com/property/36-acres-in-Apache-County-Arizona/2876090',

  const urlObj = urls.reduce((obj, item) => {
    obj[base64.encode(item)] = item
    return obj
  }, {})

  db.ref()
    .child('ChqBqCMRh1R2g8cAMjIezSabGMl2')
    .child('urls')
    .set(urlObj)
}

async function setShowcaseCategories() {
  const showcaseUrls = await getShowcaseUrls()
  for (const [url, val] of showcaseUrls) {
    const categoriesRef = db.ref().child('showcaseCategories')
    const categoryNode = await categoriesRef.child(val.cat).once('value')

    if (!categoryNode.exists()) {
      categoriesRef.update({ [val.cat]: { urls: { [url]: url } } })
    } else {
      //check if url exists here maybe?
      const urlRef = categoriesRef.child(val.cat).child('urls')

      urlRef.update({ [url]: base64.decode(url) })
    }
  }
}

//Utility function to set data
async function setShowcaseUrls() {
  const Ref = db.ref().child('showcaseUrls')

  const urls = [
    { domain: 'https://www.redfin.com', cat: 'Real Estate' },
    { domain: 'https://www.trulia.com', cat: 'Real Estate' },
    { domain: 'https://www.landandfarm.com', cat: 'Real Estate' },
    { domain: 'https://www.land.com', cat: 'Real Estate' },
    { domain: 'https://www.landsofamerica.com', cat: 'Real Estate' },
    { domain: 'https://www.zillow.com', cat: 'Real Estate' },
    { domain: 'https://www.realtor.com', cat: 'Real Estate' },
    { domain: 'https://www.loopnet.com', cat: 'Real Estate' },
    { domain: 'https://www.remax.com', cat: 'Real Estate' },
    { domain: 'https://www.movoto.com', cat: 'Real Estate' },
    { domain: 'https://www.sothebysrealty.com/eng', cat: 'Real Estate' },
    { domain: 'https://www.costar.com', cat: 'Real Estate' },
    { domain: 'https://www.century21.com', cat: 'Real Estate' },
    { domain: 'https://www.coldwellbanker.com', cat: 'Real Estate' },
    { domain: 'https://www.landwatch.com', cat: 'Real Estate' },
    { domain: 'https://www.wsj.com', cat: 'News' },
    { domain: 'https://economictimes.indiatimes.com', cat: 'News' },
    { domain: 'https://www.ft.com/', cat: 'News' },
    { domain: 'https://www.economist.com', cat: 'News' },
    { domain: 'https://www.bizjournals.com', cat: 'News' },
    { domain: 'https://www.globes.co.il', cat: 'News' },
    { domain: 'https://www.ibtimes.com', cat: 'News' },
    { domain: 'https://www.brecorder.com', cat: 'News' },
    { domain: 'http://labusinessjournal.com', cat: 'News' },
    { domain: 'https://www.businessnews.com.au', cat: 'News' },
    { domain: 'https://www.texastribune.org', cat: 'News' },
    { domain: 'https://www.dallasnews.com', cat: 'News' },
    { domain: 'https://www.foxnews.com', cat: 'News' },
    { domain: 'https://www.nytimes.com', cat: 'News' },
    { domain: 'https://www.telegraph.co.uk', cat: 'News' },
    { domain: 'https://www.cnn.com', cat: 'News' },
    { domain: 'https://www.amazon.com', cat: 'Shopping' },
    { domain: 'https://www.bestbuy.com', cat: 'Shopping' },
    { domain: 'https://www.nike.com', cat: 'Shopping' },
    { domain: 'https://www.zappos.com', cat: 'Shopping' },
    { domain: 'https://www.wholefoodsmarket.com', cat: 'Shopping' },
    { domain: 'https://www.walmart.com', cat: 'Shopping' },
    { domain: 'https://www.target.com', cat: 'Shopping' },
    { domain: 'https://www.ikea.com', cat: 'Shopping' },
    { domain: 'https://www.homedepot.com', cat: 'Shopping' },
    { domain: 'https://www.macys.com', cat: 'Shopping' },
    { domain: 'https://www.costco.com', cat: 'Shopping' },
    { domain: 'https://www.ebay.com', cat: 'Shopping' },
    { domain: 'https://www.apple.com', cat: 'Tech' },
    { domain: 'https://www.google.com', cat: 'Tech' },
    { domain: 'https://www.facebook.com', cat: 'Tech' },
    { domain: 'https://www.linkedin.com', cat: 'Tech' },
    { domain: 'https://www.github.com', cat: 'Tech' },
    { domain: 'https://www.salesforce.com', cat: 'Tech' },
    { domain: 'https://www.paypal.com', cat: 'Tech' },
    { domain: 'https://www.msn.com', cat: 'Tech' },
    { domain: 'https://www.dropbox.com', cat: 'Tech' },
    { domain: 'https://www.stackoverflow.com', cat: 'Tech' },
    { domain: 'https://www.twitter.com', cat: 'Tech' },
    { domain: 'https://www.pinterest.com', cat: 'Tech' },
    { domain: 'https://www.instagram.com', cat: 'Tech' },
    { domain: 'https://www.yahoo.com', cat: 'Tech' },
    { domain: 'https://www.youtube.com', cat: 'Entertainment' },
    { domain: 'https://www.netflix.com', cat: 'Entertainment' },
    { domain: 'https://www.spotify.com', cat: 'Entertainment' },
    { domain: 'https://www.reddit.com', cat: 'Entertainment' },
    { domain: 'https://www.digg.com', cat: 'Entertainment' },
    { domain: 'https://www.kayak.com', cat: 'Travel' },
    { domain: 'https://www.wego.com', cat: 'Travel' },
    { domain: 'https://www.travelocity.com', cat: 'Travel' },
    { domain: 'https://www.expedia.com', cat: 'Travel' },
    { domain: 'https://www.tripadvisor.com', cat: 'Travel' },
    { domain: 'https://www.booking.com', cat: 'Travel' },
    { domain: 'https://www.priceline.com', cat: 'Travel' },
    { domain: 'https://www.orbitz.com', cat: 'Travel' },
    { domain: 'https://www.hotwire.com', cat: 'Travel' },
    { domain: 'https://www.orbitz.com', cat: 'Travel' },
    { domain: 'https://www.agoda.com', cat: 'Travel' },
    { domain: 'https://www.uber.com', cat: 'Travel' },
    { domain: 'https://www.lyft.com', cat: 'Travel' },
    { domain: 'https://www.marriott.com', cat: 'Travel' },
    { domain: 'https://www.hilton.com', cat: 'Travel' },
    { domain: 'https://www.southwest.com', cat: 'Travel' },
    { domain: 'https://www.united.com', cat: 'Travel' },
    { domain: 'https://www.delta.com', cat: 'Travel' },
  ]
  const urlObj = urls.reduce((obj, item) => {
    obj[base64.encode(item.domain)] = { cat: item.cat }
    return obj
  }, {})

  Ref.set(urlObj)
  console.log('Showcase Urls have been put in firebase')
  return
}

function setTopSites() {
  const topsitesArr = JSON.parse(topsites).Ats.Results.Result.Alexa.TopSites
    .Country.Sites.Site
  const Ref = db.ref().child('showcaseUrls')

  const topsSitesObj = topsitesArr.reduce((acc, item) => {
    const url = `https://www.${item.DataUrl}`
    acc[base64.encode(url)] = {
      url,
      cat: 'Top',
      rank: item.Global.Rank,
      views: item.Country.PageViews,
    }
    return acc
  }, {})
  console.log(topsSitesObj)

  Ref.update(topsSitesObj)
}

//////////////////////////////////////
/////////////////////////////////////
//Helpers
async function deleteUserData() {
  const users = await getUsers()
  for (const user of users) {
    const lhrRef = db
      .ref()
      .child(user)
      .child('lhr')
    lhrRef.remove()
    const reportRef = db
      .ref()
      .child(user)
      .child('report')
    reportRef.remove()
  }
  return
}
