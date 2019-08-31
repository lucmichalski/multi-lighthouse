import React, { Component, Fragment } from 'react'
import base64 from 'base-64'
import firebase from 'firebase/app'
import 'firebase/database'

import Error from './Error'

import ShowCaseSection from './ShowcaseSection'

import { MainWrapper, InnerWrapper } from './MainStyles'

const config = {
  apiKey: process.env.GATSBY_FIREBASE_API_KEY,
  authDomain: process.env.GATSBY_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.GATSBY_FIREBASE_DATABASE_URL,
  projectId: process.env.GATSBY_FIREBASE_PROJECT_ID,
  storageBucket: process.env.GATSBY_FIREBASE_GOOGLE_STORAGE_BUCKET,
  messagingSenderId: process.env.GATSBY_FIREBASE_MESSAGING_SENDER_ID,
}

if (!firebase.apps.length) {
  firebase.initializeApp(config)
}

const initialState = {
  metrics: [
    'perf',
    'fcp',
    'fmp',
    'si',
    'fci',
    'i',
    'eil',
    'ttfb',
    'tbt',
    'mpfid',
  ],
  metricsDisplayNames: Object.freeze({
    perf: 'Overall Performance',
    fcp: 'First Contentful Paint',
    fmp: 'First Meaningful Paint',
    si: 'Speed Index',
    fci: 'First CPU Idle',
    i: 'Time to Interactive',
    eil: 'Estimated Input Latency',
    ttfb: 'Time To First Byte',
    tbt: 'Total Blocking Time',
    mpfid: 'Max Potential First Input Delay',
  }),
  errorUrl: '',
  error: false,
  errorMessage: '',
  showcaseData: {},
  categories: ['top', 'Real Estate', 'Newspapers', 'Shopping'],
}
class Main extends Component {
  state = { ...initialState }

  getShowcaseData = async category => {
    const { showcaseData } = this.state
    if (showcaseData[category]) {
      return
    } else {
      const URLs = await this.getCategoryURLs(category)
      const db = firebase.database()
      const showcaseDataPromises = URLs.map(async URL => {
        const showCaseRef = db.ref('showcase').child(URL)
        const URLAveragesSnapshot = await showCaseRef.child('avg').once('value')
        const currentSnapshot = await showCaseRef.child('current').once('value')
        const URLPastAverageSnapshot = await showCaseRef
          .child('pastAvg')
          .once('value')
        const averageScores = await URLAveragesSnapshot.val()
        const pastAverageScores = await URLPastAverageSnapshot.val()
        const currentScores = await currentSnapshot.val()

        return {
          pastAverageScores,
          currentScores,
          averageScores,
          encodedURL: URL,
          decodedURL: base64.decode(URL),
        }
      })
      const rawData = await Promise.all(showcaseDataPromises)
      const definedData = rawData.filter(
        item => item && item.currentScores && item.currentScores.perf
      )

      const showcaseData = definedData.sort(
        (a, b) => b.currentScores.perf.score - a.currentScores.perf.score
      )
      this.setState(state => ({
        showcaseData: { ...state.showcaseData, [category]: showcaseData },
      }))
      return showcaseData
    }
  }

  async getCategoryURLs(category) {
    const db = firebase.database()
    const ref = db
      .ref(`categories`)
      .child(category)
      .child('urls')
    const URLsSnapshot = await ref.once('value')
    const URLs = Object.keys(await URLsSnapshot.val())
    return URLs
  }

  render() {
    const {
      metrics,
      metricsDisplayNames,
      error,
      errorMessage,
      errorUrl,
      showcaseData,
      categories,
    } = this.state

    return (
      <MainWrapper>
        {!error && (
          <Fragment>
            <InnerWrapper>
              {categories.map(category => (
                <ShowCaseSection
                  key={category}
                  metrics={metrics}
                  getShowcaseData={this.getShowcaseData}
                  showcaseData={showcaseData}
                  category={category}
                  metricsDisplayNames={metricsDisplayNames}
                />
              ))}
            </InnerWrapper>
          </Fragment>
        )}

        {error && (
          <Error
            showError={error}
            errorUrl={errorUrl}
            errorMessage={errorMessage}
          />
        )}
      </MainWrapper>
    )
  }
}

export default Main
