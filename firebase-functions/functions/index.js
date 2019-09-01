/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()

// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.averageLHRsAndDelete = functions.pubsub
  .schedule('every monday 01:00')
  .timeZone('America/Chicago')
  .onRun(async context => {
    const db = admin.database()
    await averageShowcaseScores()
    await deleteShowcaseData()

    async function getShowcaseUrls() {
      const showcaseRef = db.ref().child('showcaseUrls')
      const showcaseSnapshot = await showcaseRef.once('value')
      const showcaseUrls = Object.entries(showcaseSnapshot.val())

      return showcaseUrls
    }
    async function deleteShowcaseData() {
      const showcaseUrls = await getShowcaseUrls()
      for (const [url, val] of showcaseUrls) {
        const ref = db
          .ref()
          .child('showcaseReports')
          .child(url)
          .child('lhr')
        ref.remove()
      }

      console.log('LHRs have been deleted for all showcase urls')
      return
    }

    async function averageShowcaseScores() {
      const showcaseUrls = await getShowcaseUrls()

      for (const [url, val] of showcaseUrls) {
        try {
          const showcaseRef = db
            .ref()
            .child('showcaseReports')
            .child(url)
            .child('lhr')

          if (!showcaseRef) {
            return
          }

          const showcaseSnapshot = await showcaseRef.once('value')
          const showcaseSnapshotVal = await showcaseSnapshot.val()
          const showcaseLHRReportsByDate =
            showcaseSnapshotVal && Object.values(showcaseSnapshotVal)

          const avg =
            showcaseLHRReportsByDate && averageAll(showcaseLHRReportsByDate)
          const { cat } = val
          const monthYear = getMonthYear()
          console.log('Here are the averages for this url', avg, url)
          if (avg) {
            db.ref()
              .child('showcaseReports')
              .child(url)
              .update({ avg, cat })
            db.ref()
              .child('showcaseReports')
              .child(url)
              .child('pastAvg')
              .child(monthYear)
              .set(avg)
          }
        } catch (error) {
          console.log(error)
        }
      }
      console.log('average showcase scores complete')
      return null
    }

    ///////////////////////////
    /////////////////////////////
    ///////Averages Helpers

    function averageAll(reports) {
      let avg = {}
      const metrics = [
        'i',
        'perf',
        'fci',
        'fmp',
        'fcp',
        'eil',
        'si',
        'ttfb',
        'mpfid',
        'tbt',
      ]
      for (const metric of metrics) {
        avg = {
          ...avg,
          [metric]: average(
            reports,
            (accumlator, nextReport) => accumlator + nextReport[metric].val
          ),
        }
      }
      return avg
    }

    function average(arr, callback) {
      const average = arr.reduce(callback, 0) / arr.length
      return parseFloat(average.toFixed(2))
    }

    function getMonthYear() {
      const date = new Date()
      const year = date.getFullYear()
      const month = date.getMonth()
      return `${month}${year}`
    }
  })
