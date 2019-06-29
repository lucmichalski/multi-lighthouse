import React, { Component } from 'react'
import firebase from 'firebase/app'
import Loading from './Loading'
import Guage from './Guage'
import URLGraphSection from './URLGraphSection'
import Error from './Error'
import 'firebase/database'

import {
  AuthContainer,
  Modal,
  ModalContent,
  ModalTitle,
  ModalMetric,
  CloseModal,
  SignOut,
  MainWrapper,
} from './MainStyles'

const initialState = {
  user: { uid: 'ChqBqCMRh1R2g8cAMjIezSabGMl2' },
  detailedLHRByDate: null,
  databaseData: null,
  metrics: ['perf', 'fcp', 'fmp', 'si', 'fci', 'i', 'eil'],
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
  timelineResults: true,
}

class AuthPage extends Component {
  state = { ...initialState }

  async componentDidMount() {
    this.fetchAllURLData()
  }

  reset = () =>
    this.setState(state => ({
      ...initialState,
    }))

  fetchAllURLData = () => {
    const { user } = this.state
    this.setState(() => ({
      fetching: true,
    }))
    const db = firebase.database()
    const ref = db.ref(`${user.uid}/lhr`)
    ref.once(
      'value',
      snapshot => {
        const exists = snapshot.exists()
        if (exists) {
          const data = snapshot.val()
          const routes = Object.keys(data)
          const databaseData = {}

          routes.forEach(route => {
            const values = Object.entries(data[route]).map(
              ([key, value]) => value
            )

            databaseData[route] = values
          })
          this.setState(() => ({
            databaseData,
            fetching: false,
          }))
        } else {
          this.setState(() => ({
            error: true,
            fetching: false,
            errorMessage: 'Sorry, no data for this user',
          }))
        }
      },
      errorObject => {
        console.log('The read failed: ' + errorObject.code)
      }
    )
  }

  retrieveDbReport = (URL, date) => {
    const { databaseData } = this.state
    const userURLData = [...databaseData[URL]]
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
      timelineResults,
      detailedLHRByDate,
      error,
      errorMessage,
      errorUrl,
      fetching,
      metrics,
      databaseData,
      metricsDisplayNames,
    } = this.state

    const colors = ['#448aff', '#ffde03', `#6200ee`, `#03dac5`, '#e30425']

    const bodyLock =
      typeof window !== 'undefined' && window.innerWidth <= 1366
        ? `body{position:fixed} html{position:fixed}`
        : `body{overflow: hidden} html{overflow: hidden}`
    return (
      <MainWrapper style={{ overflow: detailedLHRByDate ? 'hidden' : 'auto' }}>
        <AuthContainer>
          {user.accessToken ? (
            <SignOut type="button" onClick={this.signOut}>
              Sign Out
            </SignOut>
          ) : (
            <div id="firebaseui-auth-container" />
          )}
        </AuthContainer>

        {!error &&
          !fetching &&
          timelineResults &&
          databaseData &&
          !detailedLHRByDate &&
          Object.entries(databaseData)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([key, value], index) => (
              <URLGraphSection
                key={key}
                onClick={this.retrieveDbReport}
                colors={colors}
                metrics={metrics}
                url={key}
                data={value}
                index={index}
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

export default AuthPage
