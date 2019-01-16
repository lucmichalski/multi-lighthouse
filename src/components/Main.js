import React, { Component } from 'react'
import axios from 'axios'
import isUrl from 'is-url'
import BarGraph from './BarGraph'
import Search from './Search'
import RadioGroup from './RadioGroup'

import {
  MainWrapper,
  RunLighthouseButton,
  RadioGroupWrapper,
} from './MainStyles'

class Main extends Component {
  state = {
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
    searchEnabled: true,
  }

  UrlSearch = () => {
    const { query } = this.state
    this.runLighthouse(query)
  }

  runLighthouse = query => {
    this.setState(() => ({ fetching: true, searchEnabled: false }))
    const Url = process.env.GATSBY_SERVER

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

  onChangeInput = event => {
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
          alert('already in your query')
        }
      } else {
        alert('not valid')
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
        input: ``,
      }),
      () => this.topFiveSearch()
    )
  }

  topFiveSearch = () => {
    const { query } = this.state
    console.log(query)
    axios
      .get(
        `https://www.googleapis.com/customsearch/v1?key=${
          process.env.GATSBY_API_KEY
        }&cx=${process.env.GATSBY_SEARCH_ENGINE}&num=5&start=1`,
        {
          params: {
            q: query[0],
          },
        }
      )
      .then(response => {
        console.log(response)
        const query = response.data.items.map(({ link }) => link)
        this.runLighthouse(query)
      })
      .catch(error => console.log(error))
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
    } = this.state
    const radioIdentifiers = [
      { value: 'Url Search', id: 'UrlSearch', checked: UrlSearch },
      { value: 'Top Five Search', id: 'topFive', checked: !UrlSearch },
    ]
    return (
      <MainWrapper>
        {searchEnabled && (
          <div>
            <RadioGroupWrapper>
              <RadioGroup
                onChange={() =>
                  this.setState(state => ({
                    UrlSearch: !state.UrlSearch,
                    query: [],
                  }))
                }
                identifiers={radioIdentifiers}
                groupName="searchType"
                className="radio-group"
              />
            </RadioGroupWrapper>

            <Search
              placeholder={UrlSearch ? 'Enter URL(s)' : 'Enter Search Term'}
              input={input}
              onSubmit={
                UrlSearch
                  ? this.onClickAddUrl
                  : this.addSearchTermRunTopFiveSearch
              }
              UrlSearch={UrlSearch}
              onChange={this.onChangeInput}
            />
            {UrlSearch && (
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

            <ul>
              {data.length === 0 &&
                query.length >= 1 &&
                query.map(item => {
                  return <li key={item}>{item}</li>
                })}
            </ul>
          </div>
        )}
        {!searchEnabled && !fetching && (
          <button
            onClick={() =>
              this.setState(() => ({
                searchEnabled: true,
                data: [],
                query: [],
                input: '',
              }))
            }
            type="button"
          >
            Another Search?
          </button>
        )}

        {!error && data.length === 0 && fetching === true && (
          <div>Headless Chrome is running!</div>
        )}
        {!error && !searchEnabled ? (
          <BarGraph metrics={metrics} data={data} />
        ) : (
          <div>
            <div>{errorUrl}</div>
            <div>{errorMessage}</div>
          </div>
        )}
      </MainWrapper>
    )
  }
}

export default Main
