import React, { Component, Fragment } from 'react'
import axios from 'axios'
import isUrl from 'is-url'
import BarGraph from './BarGraph'
import Search from './Search'
import RadioGroup from './RadioGroup'
import Error from './Error'
import Loading from './Loading'
import closeImg from '../images/baseline_close_black_18dp.png'

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
} from './MainStyles'

const initialState = {
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

  onChangeRadio = (id, onClick) => {
    console.log(id)
    this.setState(
      state => ({
        UrlSearch: id === state.radioIds.UrlSearch ? true : false,
        topFiveSearch: id === state.radioIds.topFiveSearch ? true : false,
        timelineResults: id === state.radioIds.timelineResults ? true : false,
        query: [],
      }),
      () => onClick()
    )
  }

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
    } = this.state
    const radioIdentifiers = [
      {
        value: 'URL Search',
        id: radioIds.UrlSearch,
        checked: UrlSearch,
        onClick: () => console.log('hi'),
      },
      {
        value: 'Top Five Search',
        id: radioIds.topFiveSearch,
        checked: topFiveSearch,
        onClick: () => console.log('hi'),
      },
      {
        value: 'Timeline Results',
        id: radioIds.timelineResults,
        checked: timelineResults,
        onClick: () => console.log('hi'),
      },
    ]
    return (
      <MainWrapper>
        {searchEnabled && (
          <div>
            <H2>Compare performance scores for multiple sites</H2>
            <RadioGroupWrapper>
              <RadioGroup
                onChange={this.onChangeRadio}
                identifiers={radioIdentifiers}
                groupName="searchType"
                className="radio-group"
                styles={RadioGroupStyles}
              />
            </RadioGroupWrapper>

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
          </div>
        )}
        {!searchEnabled && !fetching && (
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
            loadingMessage="Headless Chrome is running!"
          />
        )}
        {!error && !searchEnabled && <BarGraph metrics={metrics} data={data} />}
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
