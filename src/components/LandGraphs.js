import React, { Component } from 'react'
import firebase from 'firebase/app'
import Loading from './Loading'
import Guage from './Guage'
import URLGraphSection from './URLGraphSection'
import Error from './Error'
import 'firebase/database'

import {
  Modal,
  ModalContent,
  ModalTitle,
  ModalMetric,
  CloseModal,
  MainWrapper,
} from './MainStyles'

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
  user: { uid: 'ChqBqCMRh1R2g8cAMjIezSabGMl2', urls: [] },
  detailedLHRByDate: null,
  metrics: ['perf', 'fcp', 'fmp', 'si', 'fci', 'i', 'eil'],
  //Some of this state could be global. Use Graphql
  metricsDisplayNames: Object.freeze({
    perf: 'Overall Performance',
    fcp: 'First Contentful Paint',
    fmp: 'First Meaningful Paint',
    si: 'Speed Index',
    fci: 'First CPU Idle',
    i: 'Time to Interactive',
    eil: 'Estimated Input Latency',
  }),
  errorUrl: '',
  error: false,
  errorMessage: '',
  fetching: false,
  urlLHRData: [],
}

class LandGraphs extends Component {
  state = { ...initialState }

  async componentDidMount() {
    this.fetchUserURLs()
  }

  reset = () =>
    this.setState(state => ({
      ...initialState,
    }))

  fetchUserURLs = async () => {
    const { uid } = this.state.user
    const db = firebase.database()
    const ref = await db.ref(`${uid}/urls`)
    const urlsSnapshot = await ref.once('value')
    const urls = await urlsSnapshot.val()
    const user = { uid, urls: Object.entries(urls) }

    this.setState({ user })
  }

  fetchURLData = url => {
    const { user, urlLHRData } = this.state
    if (urlLHRData[url]) {
      return
    }

    const db = firebase.database()
    const ref = db.ref(`${user.uid}/lhr/${url}`)
    ref.once(
      'value',
      snapshot => {
        const exists = snapshot.exists()
        if (exists) {
          const data = snapshot.val()

          this.setState(state => ({
            urlLHRData: { ...state.urlLHRData, [url]: Object.entries(data) },
            error: false,
            fetching: false,
          }))
        } else {
          this.setState(() => ({
            error: true,
            fetching: false,
            errorMessage: 'Sorry, no data for this URL',
          }))
        }
      },
      errorObject => {
        console.log('The read failed: ' + errorObject.code)
      }
    )
  }

  retrieveDbReport = (URL, date) => {
    //This could be easier now. I should just encode the date to get the exact data from lhrs
    const { urlLHRData } = this.state
    const encodedURL = URL[0]
    const userURLData = urlLHRData[encodedURL].map(item => item[1])
    const lhr = userURLData.filter(({ ft }) => ft === date)[0]

    for (const prop of Object.keys(lhr)) {
      if (lhr[prop].val) {
        if (prop === 'eil') {
          lhr[prop].displayVal = `${lhr[prop].val}ms`
        } else if (prop === 'perf') {
          lhr[prop].displayVal = `${lhr[prop].val.toFixed()}/100`
        } else {
          lhr[prop].displayVal = `${this.msToSeconds(lhr[prop].val).toFixed(
            2
          )}s`
        }
      }
    }
    const detailedLHRByDate = lhr

    this.setState(() => ({ detailedLHRByDate }))
  }

  msToSeconds(num) {
    return num / 1000
  }

  render() {
    const {
      user,
      detailedLHRByDate,
      error,
      errorMessage,
      errorUrl,
      fetching,
      metrics,
      metricsDisplayNames,
      urlLHRData,
    } = this.state

    const colors = [
      '#448aff',
      '#ffde03',
      `#6200ee`,
      `#03dac5`,
      '#e30425',
      '#448aff',
      '#ffde03',
      `#6200ee`,
      `#03dac5`,
      '#e30425',
      '#448aff',
      '#ffde03',
      `#6200ee`,
      '#448aff',
      '#ffde03',
      `#6200ee`,
      `#03dac5`,
      '#e30425',
      '#448aff',
      '#ffde03',
      `#6200ee`,
      `#03dac5`,
      '#e30425',
      '#448aff',
      '#ffde03',
      `#6200ee`,
    ]

    const bodyLock =
      typeof window !== 'undefined' && window.innerWidth <= 1366
        ? `body{position:fixed} html{position:fixed}`
        : `body{overflow: hidden} html{overflow: hidden}`

    return (
      <MainWrapper style={{ overflow: detailedLHRByDate ? 'hidden' : 'auto' }}>
        {!error &&
          !fetching &&
          user.urls.map((url, index) => (
            <URLGraphSection
              key={url[0]}
              url={url}
              retrieveDbReport={this.retrieveDbReport}
              fetchURLData={this.fetchURLData}
              urlLHRData={urlLHRData}
              color={colors[index]}
              metrics={metrics}
              metricsDisplayNames={metricsDisplayNames}
            />
          ))}
        {detailedLHRByDate && (
          <Modal
            onClick={() => this.setState(() => ({ detailedLHRByDate: null }))}
          >
            {/* {modal scroll styles} */}
            <div
              style={{
                width: '100%',
                height: '100%',
                overflowScrolling: 'touch',
                WebkitOverflowScrolling: 'touch',
                overflow: 'scroll',
              }}
            >
              <ModalContent>
                <CloseModal>Close</CloseModal>
                {metrics.map(metric => (
                  <ModalMetric key={metric}>
                    <ModalTitle>{metricsDisplayNames[metric]}</ModalTitle>
                    <Guage value={detailedLHRByDate[metric].score} />
                    <h6>{detailedLHRByDate[metric].displayVal}</h6>
                  </ModalMetric>
                ))}
              </ModalContent>
            </div>
            <style
              dangerouslySetInnerHTML={{
                __html: bodyLock,
              }}
            />
          </Modal>
        )}
        {!error && fetching === true && (
          <Loading
            showLoading={!error && fetching === true}
            loadingMessage="Getting Data"
          />
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

export default LandGraphs
