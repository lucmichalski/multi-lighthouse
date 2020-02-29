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
// Must match order of "scores" array in showcase section.
const defaultMetrics = Object.freeze({
  perf: { score: 0, value: 0 },
  i: { score: 0, value: 0 },
  si: { score: 0, value: 0 },
  fcp: { score: 0, value: 0 },
  fci: { score: 0, value: 0 },
  fmp: { score: 0, value: 0 },
  eil: { score: 0, value: 0 },
  ttfb: { score: 0, value: 0 },
  tbt: { score: 0, value: 0 },
  mpfid: { score: 0, value: 0 },
  captcha: { score: 0, value: 0 },
  'field-fcp': { score: 0, value: 0, items: [] },
  'field-fid': { score: 0, value: 0, items: [] },
  'field-fcp-origin': { score: 0, value: 0, items: [] },
  'field-fid-origin': { score: 0, value: 0, items: [] },
})

const initialState = {
  metrics: Object.keys(defaultMetrics),
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
    captcha: 'Has Captcha on Page Load',
    'field-fcp': 'Field First Contentful Paint',
    'field-fid': 'Field First Input Delay',
    'field-fcp-origin': 'Field First Contentful Paint Origin',
    'field-fid-origin': 'Field First Input Delay Origin',
  }),
  errorUrl: '',
  error: false,
  errorMessage: '',
  showcaseData: {
    pastAverageScores: defaultMetrics,
    currentScores: defaultMetrics,
    averageScores: defaultMetrics,
    encodedURL: '',
    decodedURL: '',
  },
  categories: [
    'Top',
    'Real Estate',
    'News',
    'Shopping',
    'Tech',
    'Entertainment',
    'Travel',
    'Health',
  ],
  loading: false,
}
export type GlobalState = typeof initialState

class Main extends Component<{}, GlobalState> {
  state = { ...initialState }

  getShowcaseData = async (category: GlobalState['categories'][0]) => {
    const { showcaseData } = this.state

    if (
      (showcaseData as { [key: string]: typeof defaultMetrics | string })[
        category
      ]
    ) {
      return null
    } else {
      this.setState({ loading: true })
      const URLs = await this.getCategoryURLs(category)
      if (!URLs) {
        this.setState({ loading: false })
        return null
      }

      const db = firebase.database()
      const showcaseDataPromises = URLs.map(async URL => {
        const showCaseRef = db.ref('showcaseReports').child(URL)
        const URLAveragesSnapshot = await showCaseRef.child('avg').once('value')
        const currentSnapshot = await showCaseRef.child('current').once('value')
        const URLPastAverageSnapshot = await showCaseRef
          .child('pastAvg')
          .once('value')
        const averageScores = await URLAveragesSnapshot.val()
        const pastAverageScores = await URLPastAverageSnapshot.val()
        const currentScores = await currentSnapshot.val()
        const { showcaseData } = this.state
        return {
          pastAverageScores:
            pastAverageScores || showcaseData.pastAverageScores,
          currentScores: currentScores || showcaseData.currentScores,
          averageScores: averageScores || showcaseData.averageScores,
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
        loading: false,
        showcaseData: { ...state.showcaseData, [category]: showcaseData },
      }))
      return showcaseData
    }
  }

  async getCategoryURLs(category: string): Promise<string[] | null> {
    const db = firebase.database()
    const ref = db
      .ref(`showcaseCategories`)
      .child(category)
      .child('urls')
    const URLsSnapshot = await ref.once('value')
    const urlsVal = URLsSnapshot.val()
    if (urlsVal) {
      const URLs = Object.keys(await urlsVal)
      return URLs
    }
    return null
  }

  render(): JSX.Element {
    const {
      metrics,
      metricsDisplayNames,
      error,
      errorMessage,
      errorUrl,
      showcaseData,
      categories,
      loading,
    } = this.state

    return (
      <MainWrapper>
        {!error && (
          <Fragment>
            <InnerWrapper>
              {categories.map(category => (
                <ShowCaseSection
                  key={category}
                  loading={loading}
                  metrics={metrics.filter(metric => metric !== 'captcha')}
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
