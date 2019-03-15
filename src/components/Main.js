import React, { Component, Fragment } from 'react'
import axios from 'axios'
import base64 from 'base-64'
import firebase from 'firebase/app'
import 'firebase/database'
import isUrl from 'is-url'
import BarGraph from './BarGraph'
import Legend from './Legend'
import Search from './Search'
import RadioGroup from './RadioGroup'
import Error from './Error'
import Loading from './Loading'
import closeImg from '../images/baseline_close_black_18dp.png'
import BarGraphTimeline from './BarGraphTimeline'
import {
  MainWrapper,
  RunLighthouseButton,
  RadioGroupWrapper,
  RadioGroupStyles,
  RunAnotherAuditButton,
  UL,
  LI,
  IMG,
  H2,
  SearchTermDescription,
  SearchTerm,
  BarGraphTimelineContainer,
  IFrameContainer,
  CloseIFrame,
  InnerWrapper,
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

const initialState = {
  reportHtml: null,
  databaseData: null,
  data: [],
  input: '',
  query: [],
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
  UrlSearch: true,
  topFiveSearch: false,
  timelineResults: false,
  searchEnabled: true,
  googleSearchTerm: '',
  radioIds: {
    topFiveSearch: 'topFive',
    UrlSearch: 'UrlSearch',
    timelineResults: 'timeline',
  },
}
class Main extends Component {
  state = initialState

  reset = () => this.setState(() => initialState)

  UrlSearch = () => {
    const { query } = this.state
    this.setState(() => ({ fetching: true, searchEnabled: false }))
    this.runLighthouse(query)
  }

  runLighthouse = query => {
    const Url = `${process.env.GATSBY_SERVER}urlsearch`

    return axios
      .get(Url, {
        params: {
          q: query,
        },
      })
      .then(response => {
        console.log(response.data)
        this.setState(() => this.handleResponse(response.data))
      })
      .catch(error => {
        console.log(error)
      })
  }

  handleResponse = response => {
    for (let i = 0; i < response.length; i++) {
      if (response[i].runtimeError.code !== 'NO_ERROR') {
        return {
          error: true,
          errorMessage: response[i].runtimeError.message,
          errorUrl: response[i].finalUrl,
          fetching: false,
          query: [],
          searchEnabled: false,
        }
      }
    }
    return { data: response, fetching: false, query: [], searchEnabled: false }
  }

  onChangeSearchInput = event => {
    event.persist()
    this.setState(() => ({
      input: `${event.target.value}`,
    }))
  }

  onClickAddUrl = e => {
    if (e) {
      e.preventDefault()
    }
    this.setState(state => {
      if (isUrl(state.input)) {
        if (!state.query.includes(state.input)) {
          return { query: [...state.query, state.input], input: `` }
        } else {
          alert('You have already entered this URL')
        }
      } else {
        alert('URL is not valid. Please enter a valid URL.')
      }
    })
  }

  addSearchTermRunTopFiveSearch = e => {
    if (e) {
      e.preventDefault()
    }
    this.setState(
      state => ({
        query: [state.input],
        googleSearchTerm: state.input,
        input: ``,
        fetching: true,
        searchEnabled: false,
      }),
      () => this.topFiveSearch()
    )
  }

  topFiveSearch = () => {
    const { query } = this.state
    const Url = `${process.env.GATSBY_SERVER}topfivesearch`

    return axios
      .get(Url, {
        params: {
          q: query,
        },
      })
      .then(response => {
        this.setState(() => this.handleResponse(response.data))
      })
      .catch(error => console.log(error))
  }

  removeQueryItem = item =>
    this.setState(state => ({ query: state.query.filter(url => url !== item) }))

  retrieveDbReport = (URL, date) => {
    const db = firebase.database()
    const encodedDate = base64.encode(date)
    const ref = db.ref(`report/${URL}/${encodedDate}`)
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
    this.setState(() => ({
      fetching: true,
      searchEnabled: false,
    }))
    const db = firebase.database()
    const ref = db.ref(`lhr`)
    ref.once(
      'value',
      snapshot => {
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
          query: [],
          searchEnabled: false,
        }))
      },
      errorObject => {
        console.log('The read failed: ' + errorObject.code)
      }
    )
  }

  onChangeRadio = (id, onClick) =>
    this.setState(
      state => ({
        UrlSearch: id === state.radioIds.UrlSearch ? true : false,
        topFiveSearch: id === state.radioIds.topFiveSearch ? true : false,
        timelineResults: id === state.radioIds.timelineResults ? true : false,
        query: [],
      }),
      () => onClick()
    )

  render() {
    const {
      input,
      query,
      data,
      metrics,
      error,
      errorMessage,
      errorUrl,
      fetching,
      UrlSearch,
      searchEnabled,
      googleSearchTerm,
      topFiveSearch,
      timelineResults,
      radioIds,
      databaseData,
      reportHtml,
    } = this.state

    const radioIdentifiers = [
      // {
      //   value: 'URL Search',
      //   id: radioIds.UrlSearch,
      //   checked: UrlSearch,
      //   onClick: () => null,
      // },
      // {
      //   value: 'Top Five Search',
      //   id: radioIds.topFiveSearch,
      //   checked: topFiveSearch,
      //   onClick: () => null,
      // },
      {
        value: 'Timeline Results',
        id: radioIds.timelineResults,
        checked: timelineResults,
        onClick: () => this.retrieveDbLHR(),
      },
    ]
    const colors = ['#448aff', '#ffde03', `#6200ee`, `#03dac5`, '#e30425']
    const legendItems = data.map(({ finalUrl, categories }) => (
      <span key={finalUrl}>
        <span>{finalUrl}</span> 
        {' '}
        <span> | </span>
        <span>Performance Score</span>
        <span>{` ${categories.performance.score.toString().slice(2)}`}</span>
      </span>
    ))
    const bodyLock =
      typeof window !== 'undefined' && window.innerWidth <= 1366
        ? `body{position:fixed} html{position:fixed}`
        : `body{overflow: hidden} html{overflow: hidden}`

    return (
      <MainWrapper style={{ overflow: reportHtml ? 'hidden' : 'auto' }}>
        {searchEnabled && (
          <InnerWrapper>
            <H2>Track Performance of Your Site</H2>
            <RadioGroupWrapper>
              <RadioGroup
                onChange={this.onChangeRadio}
                identifiers={radioIdentifiers}
                groupName="searchType"
                className="radio-group"
                styles={RadioGroupStyles}
              />
            </RadioGroupWrapper>

            {false && (
              <Search
                placeholder={UrlSearch ? 'Enter URL(s)' : 'Enter a Search Term'}
                input={input}
                onSubmit={
                  UrlSearch
                    ? this.onClickAddUrl
                    : this.addSearchTermRunTopFiveSearch
                }
                UrlSearch={UrlSearch}
                onChange={this.onChangeSearchInput}
              />
            )}
            <UL>
              {data.length === 0 &&
                query.length >= 1 &&
                query.map(item => {
                  return (
                    <LI key={item}>
                      {item}
                      {' '}
                      <IMG
                        onClick={() => this.removeQueryItem(item)}
                        alt="Delete List Item"
                        src={closeImg}
                      />
                    </LI>
                  )
                })}
            </UL>
            {UrlSearch && query.length >= 1 && (
              <RunLighthouseButton
                type="button"
                disabled={query.length === 0}
                onClick={
                  query.length >= 1
                    ? UrlSearch
                      ? () => this.UrlSearch()
                      : () => this.topFiveSearch()
                    : null
                }
              >
                Run Lighthouse
              </RunLighthouseButton>
            )}
          </InnerWrapper>
        )}
        {!searchEnabled && !fetching && !timelineResults && (
          <Fragment>
            <RunAnotherAuditButton onClick={() => this.reset()} type="button">
              Perform Another Audit
            </RunAnotherAuditButton>
            {topFiveSearch && (
              <SearchTermDescription>
                <div>
                  Performance comparison for the top 5 search results returned
                  by Google
                </div>
                <SearchTerm>
"
                  {googleSearchTerm}
"
                </SearchTerm>
              </SearchTermDescription>
            )}
          </Fragment>
        )}
        {!error && data.length === 0 && fetching === true && (
          <Loading
            showLoading={!error && data.length === 0 && fetching === true}
            loadingMessage={
              timelineResults ? 'Getting Data' : 'Headless Chrome is running!'
            }
          />
        )}
        {!error &&
          !searchEnabled &&
          !fetching &&
          !timelineResults &&
          data.length > 0 && (
            <Fragment>
              <Legend legendItems={legendItems} colors={colors} />
              <BarGraph colors={colors} metrics={metrics} data={data} />
            </Fragment>
          )}
        {!error &&
          !searchEnabled &&
          !fetching &&
          timelineResults &&
          databaseData &&
          Object.entries(databaseData).map(([key, value], index) => (
            <Fragment key={key}>
              <H2>{base64.decode(key)}</H2>
              <BarGraphTimelineContainer>
                {metrics.map(metric => (
                  <BarGraphTimeline
                    onClick={this.retrieveDbReport}
                    color={colors[index]}
                    dbKey={key}
                    key={metric}
                    data={value}
                    metric={metric}
                  />
                ))}
              </BarGraphTimelineContainer>
            </Fragment>
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

        {error && !searchEnabled && (
          <Error
            showError={error && !searchEnabled}
            errorUrl={errorUrl}
            errorMessage={errorMessage}
          />
        )}
      </MainWrapper>
    )
  }
}

export default Main
