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
  //Some of this state could be global. Use Graphql
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
          const dataArr = Object.entries(data)
          this.preCalc(dataArr);

          this.setState(state => ({
            urlLHRData: {
              ...state.urlLHRData,
              [url]: dataArr,
            },
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

  calc = (data, range) => {
    const sliced = data.slice(range[0], range[1])
    const sorted = sliced
      .sort((a, b) => a[1].perf.score - b[1].perf.score)
      .map(item => item[1].perf.score)
    console.log(sorted.length)
    const mean = sorted.reduce((acc, item) => acc + item) / sorted.length
    const half = Math.floor(sorted.length / 2)
    const median =
      sorted.length % 2 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2.0
    const min = sorted[0];
    const max = sorted[sorted.length - 1]
    return { median, mean, min, max, sorted }
  }

  preCalc = (data) => {
    const dataSortedByDate =  data.sort((a, b) => new Date(a.ft) - new Date(b.ft))
    console.log(dataSortedByDate)
    const len = dataSortedByDate.length;
    const thirtyDays = {
      title: '30 days',
      range: [len - 30 * 2, len ],
    }
    const sevenDays = {
      title: '7 days',
      range: [len - 7 * 2, len ],
    };

    // these are off by 7 because I don't want the release date I want 7 days after
     // What should be done is I slice the datasortedbydate into seperate arrays here and filter by date ranges to include
     // and passs that to the calc function instead of ranges to slice.  Will be more future proof that way
    const nov6 = {
      title: 'nov6',
      range: [len - 14 * 2, len -  7 * 2],
    };
    const oct23 = {
      title: 'oct23',
      range: [len - 21 * 2, len -  14 * 2],
    };
    const oct9 = {
      title: 'oct9',
      range: [len - 49 * 2, len -  21 * 2],
    };
    const sept25 = {
      title: 'sept25',
      range: [len - 63 * 2, len -  49 * 2],
    };
    [thirtyDays, sevenDays, nov6, oct23, oct9, sept25].forEach(({ title, range }) =>
      console.log({ [title]: this.calc(dataSortedByDate, range) })
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
          user.urls.map((url, index) => {
            const lhrsAndDatesForURL = urlLHRData[url[0]]
            const justLHRsForURL =
              lhrsAndDatesForURL && urlLHRData[url[0]].map(item => item[1])
            return (
              <URLGraphSection
                key={url[0]}
                url={url}
                retrieveDbReport={this.retrieveDbReport}
                fetchURLData={this.fetchURLData}
                urlLHRData={justLHRsForURL}
                color={colors[index]}
                metrics={metrics}
                metricsDisplayNames={metricsDisplayNames}
              />
            )
          })}
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
