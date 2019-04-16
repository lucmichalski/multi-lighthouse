import React, { Component } from 'react'
import base64 from 'base-64'
import firebase from 'firebase/app'
import 'firebase/database'
import URLGraphSection from './URLGraphSection'
import RadioGroup from './RadioGroup'
import Error from './Error'
import Loading from './Loading'

import {
  MainWrapper,
  RadioGroupWrapper,
  RadioGroupStyles,
  H2,
  AuthContainer,
  IFrameContainer,
  CloseIFrame,
  InnerWrapper,
  SignOut,
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
  reportHtml: null,
  databaseData: null,
  metrics: [
    'first-contentful-paint',
    'first-meaningful-paint',
    'speed-index',
    'first-cpu-idle',
    'interactive',
    'estimated-input-latency',
  ],
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
    //Can this averaging calculation be done on the server to save time? YES
    const db = firebase.database()
    const ref = db.ref(`showcase/urls`)
    const urlsSnapshot = await ref.once('value')
    const urls = Object.keys(await urlsSnapshot.val())
    const showcaseDataPromises = urls.map(async url => {
      const ref = db
        .ref('showcase')
        .child(url)
        .child('lhr')
      const urlReportSnapshot = await ref.once('value')
      const urlReports = await urlReportSnapshot.val()

      return { urlReports, url }
    })
    const showcaseData = await Promise.all(showcaseDataPromises)
    //should only return the encoded url, average scores for all metrics and overall. I can get the whole report on button click if I need it
    return showcaseData
  }

  reset = () => this.setState(() => initialState)

  retrieveDbReport = (URL, date) => {
    const { user } = this.state
    const db = firebase.database()
    const encodedDate = base64.encode(date)
    const ref = db.ref(`${user.uid}/report/${URL}/${encodedDate}`)
    ref.once(
      'value',
      snapshot => {
        const reportHtml = snapshot.val()
        this.setState(() => ({ reportHtml }))
      },
      errorObject => {
        console.log('The read failed: ' + errorObject.code)
      }
    )
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
            console.log(user)
            this.setState(() => ({ user }))
          })
        } else {
          console.log('not signed in')
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

  render() {
    const {
      metrics,
      error,
      errorMessage,
      errorUrl,
      fetching,
      timelineResults,
      radioIds,
      databaseData,
      reportHtml,
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
      <MainWrapper style={{ overflow: reportHtml ? 'hidden' : 'auto' }}>
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
        {reportHtml && (
          <IFrameContainer
            onClick={() => this.setState(() => ({ reportHtml: null }))}
          >
            <CloseIFrame>Close</CloseIFrame>

            <iframe
              style={{
                width: '100%',
                height: '100%',
                overflowScrolling: 'touch',
                WebkitOverflowScrolling: 'touch',
                overflow: 'scroll',
              }}
              title="Lighthouse Report"
              srcDoc={reportHtml}
            />
            <style
              dangerouslySetInnerHTML={{
                __html: bodyLock,
              }}
            />
          </IFrameContainer>
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
