const admin = require('firebase-admin')

const serviceAccount =
  './multi-lighthouse-firebase-adminsdk-3yznr-744b1662ca.json'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://multi-lighthouse.firebaseio.com/',
  storageBucket: 'multi-lighthouse.appspot.com',
})

const db = admin.database()

module.exports = { db }
