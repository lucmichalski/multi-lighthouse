import React, { Component } from 'react'
import base64 from 'base-64'
import firebase from 'firebase/app'
import 'firebase/database'
import URLGraphSection from './URLGraphSection'
import RadioGroup from './RadioGroup'
import Error from './Error'
import Loading from './Loading'
import Guage from './Guage'

import {
  MainWrapper,
  RadioGroupWrapper,
  RadioGroupStyles,
  H2,
  AuthContainer,
  Modal,
  ModalContent,
  ModalTitle,
  ModalMetric,
  CloseModal,
  InnerWrapper,
  SignOut,
  ShowcaseContainer,
  Showcase,
} from './MainStyles'

const config = {
  apiKey: process.env.GATSBY_FIREBASE_API_KEY,
  authDomain: process.env.GATSBY_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.GATSBY_FIREBASE_DATABASE_URL,
  projectId: process.env.GATSBY_FIREBASE_PROJECT_ID,
  storageBucket: process.env.GATSBY_FIREBASE_GOOGLE_STORAGE_BUCKET,
  messagingSenderId: process.env.GATSBY_FIREBASE_MESSAGING_SENDER_ID,
}

firebase.initializeApp(config)
function setGlobals() {
  if (typeof window !== `undefined`) {
    const firebaseui = require('firebaseui')
    const auth = firebase.auth()
    const ui = new firebaseui.auth.AuthUI(auth)

    return { auth, ui }
  }
}
const globals = setGlobals()

const initialState = {
  user: {},
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
  timelineResults: false,
  radioIds: {
    timelineResults: 'timeline',
  },
  showcaseData: null,
}
class Main extends Component {
  state = { ...initialState }

  async componentDidMount() {
    this.initAuth()
    this.setState({ showcaseData: await this.getShowcaseData() })
  }

  async getShowcaseData() {
    const db = firebase.database()
    const ref = db.ref(`showcase/urls`)
    const URLsSnapshot = await ref.once('value')
    const URLs = Object.entries(await URLsSnapshot.val())
    const showcaseDataPromises = URLs.map(async ([key, value]) => {
      const ref = db
        .ref('showcase')
        .child(key)
        .child('avg')
      const URLAveragesSnapshot = await ref.once('value')
      const URLAverageScore = await URLAveragesSnapshot.val()

      return {
        URLAverageScore,
        encodedURL: key,
        decodedURL: base64.decode(key),
        category: value.cat,
      }
    })
    const showcaseData = await Promise.all(showcaseDataPromises)
    return showcaseData
  }

  reset = () =>
    this.setState(state => ({
      ...initialState,
      showcaseData: state.showcaseData,
    }))

  retrieveDbReport = (URL, date) => {
    const { databaseData } = this.state
    const userURLData = [...databaseData[URL]]
    const lhr = userURLData.filter(({ ft }) => ft === date)[0]

    for (const prop of Object.keys(lhr)) {
      if (lhr[prop].val) {
        if (prop === 'eil') {
          lhr[prop].displayVal = `${lhr[prop].val.toFixed()}ms`
        } else if (prop === 'perf') {
          lhr[prop].displayVal = `${lhr[prop].val.toString()}/100`
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

  retrieveDbLHR = () => {
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

  onChangeRadio = (id, onClick) =>
    this.setState(
      state => ({
        timelineResults: id === state.radioIds.timelineResults ? true : false,
      }),
      () => onClick()
    )

  signOut = () => {
    const { auth } = globals
    auth.signOut()
    this.reset()
  }

  initAuth = () => {
    const { auth, ui } = globals
    auth.onAuthStateChanged(
      user => {
        if (user) {
          const displayName = user.displayName
          const email = user.email
          const emailVerified = user.emailVerified
          const photoURL = user.photoURL
          const uid = user.uid
          const phoneNumber = user.phoneNumber
          const providerData = user.providerData
          user.getIdToken().then(accessToken => {
            const user = {
              displayName: displayName,
              email: email,
              emailVerified: emailVerified,
              phoneNumber: phoneNumber,
              photoURL: photoURL,
              uid: uid,
              accessToken: accessToken,
              providerData: providerData,
            }
            this.setState(() => ({ user }))
          })
        } else {
          const uiConfig = {
            callbacks: {
              signInSuccessWithAuthResult: function(authResult, redirectUrl) {
                return false
              },
            },
            signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
          }
          ui.start('#firebaseui-auth-container', uiConfig)
        }
      },
      function(error) {
        console.log(error)
      }
    )
  }

  msToSeconds(num) {
    return num / 1000
  }

  render() {
    const {
      metrics,
      metricsDisplayNames,
      error,
      errorMessage,
      errorUrl,
      fetching,
      timelineResults,
      radioIds,
      databaseData,
      detailedLHRByDate,
      user,
      showcaseData,
    } = this.state

    const radioIdentifiers = [
      {
        value: 'Timeline Results',
        id: radioIds.timelineResults,
        checked: timelineResults,
        onClick: () => this.retrieveDbLHR(),
      },
    ]
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
        {!error && !timelineResults && (
          <InnerWrapper>
            <H2>Track Performance of Your Site</H2>
            {showcaseData && !user.uid && (
              <ShowcaseContainer>
                {showcaseData.map(({ URLAverageScore, decodedURL }) => (
                  <Showcase key={decodedURL}>
                    <h3>{decodedURL}</h3>
                    <Guage value={URLAverageScore} />
                  </Showcase>
                ))}
              </ShowcaseContainer>
            )}
            {user && user.uid && (
              <RadioGroupWrapper>
                <RadioGroup
                  onChange={this.onChangeRadio}
                  identifiers={radioIdentifiers}
                  groupName="searchType"
                  className="radio-group"
                  styles={RadioGroupStyles}
                />
              </RadioGroupWrapper>
            )}
          </InnerWrapper>
        )}

        {!error && fetching === true && (
          <Loading
            showLoading={!error && fetching === true}
            loadingMessage="Getting Data"
          />
        )}

        {!error &&
          !fetching &&
          timelineResults &&
          databaseData &&
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
            <CloseModal>Close</CloseModal>
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
