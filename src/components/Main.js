import React, { Component } from 'react'
import axios from 'axios'
import isUrl from 'is-url'
import styled from 'styled-components'
import BarGraph from './BarGraph'
import Search from './Search'

import './Main.css'

const RunLighthouseButton = styled.button`
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.302),
    0 1px 3px 1px rgba(60, 64, 67, 0.149);
  align-items: center;
  background:  #448aff;
  opacity: ${props => (props.disabled ? '.7' : '1.0')}
  border: 1px solid transparent;
  border-radius: 24px;
  color: #ffffff;
  display: inline-flex;
  font-family: 'Google Sans', Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
  font-weight: 500;
  font-size: 14px;
  height: 48px;
  letter-spacing: 0.15px;
  line-height: 22px;
  margin: 0;
  min-width: 120px;
  padding: 0;
  text-transform: none;
  width: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')}
`

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
    this.setState(() => ({ fetching: true }))
    const { query } = this.state
    const Url = process.env.SERVER
    console.log(Url)
    return axios
      .get(Url, {
        params: {
          query,
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

  onClickAddSearchTerm = () =>
    this.setState(state => ({
      query: [state.input],
      input: ``,
    }))

  topFiveSearch = () => {
    const { query } = this.state
    axios
      .get(
        `https://www.googleapis.com/customsearch/v1?key=${
          process.env.API_KEY
        }&cx=${process.env.SEARCH_ENGINE}&num=5&start=1`,
        {
          params: {
            q: query[0],
          },
        }
      )
      .then(response => {
        console.log(response)
        this.setState(() => ({ fetching: true }))
        const query = response.data.items.map(({ link }) => link)
        const Url = process.env.SERVER
        return axios
          .get(Url, {
            params: {
              query,
            },
          })
          .then(response => {
            this.setState(() => this.handleResponse(response.data))
          })
          .catch(error => {
            console.log(error)
          })
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

    return (
      <div className="main">
        {searchEnabled && (
          <div>
            <input
              type="radio"
              id="UrlSearch"
              name="searchType"
              value="Url Search"
              checked={UrlSearch}
              onChange={() =>
                this.setState(state => ({
                  UrlSearch: !state.UrlSearch,
                  query: [],
                }))
              }
            />
            <label htmlFor="Url">Url Search</label>

            <input
              type="radio"
              id="topFive"
              name="searchType"
              value="Top Five Search"
              checked={!UrlSearch}
              onChange={() =>
                this.setState(state => ({
                  UrlSearch: !state.UrlSearch,
                  query: [],
                }))
              }
            />
            <label htmlFor="topFive">Top Five Search</label>
            <Search
              placeholder={
                UrlSearch
                  ? 'Enter URL to test with Lighthouse'
                  : 'Enter search term'
              }
              input={input}
              onSubmit={
                UrlSearch ? this.onClickAddUrl : this.onClickAddSearchTerm
              }
              onChange={this.onChangeInput}
            />
            <RunLighthouseButton
              type="button"
              disabled={query.length === 0}
              onClick={
                query.length >= 1
                  ? UrlSearch
                    ? () =>
                        this.setState(
                          () => ({ searchEnabled: false }),
                          () => this.UrlSearch()
                        )
                    : () =>
                        this.setState(
                          () => ({ searchEnabled: false }),
                          () => this.topFiveSearch()
                        )
                  : null
              }
            >
              Run Lighthouse
            </RunLighthouseButton>
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
      </div>
    )
  }
}

export default Main
