import React, { Component } from 'react'
import axios from 'axios'
import isUrl from 'is-url'
import BarGraph from './BarGraph'
import Search from './Search'

import './Main.css'

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
  }

  UrlSearch = () => {
    this.setState(() => ({ fetching: true }))
    const { query } = this.state
    const Url = process.env.SERVER
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
        }
      }
    }
    return { data: response, fetching: false }
  }

  onChangeInput = event => {
    event.persist()
    this.setState(() => ({
      input: `${event.target.value}`,
    }))
  }

  onClickAddUrl = () => {
    this.setState(state => {
      if (isUrl(state.input)) {
        if (!state.query.includes(state.input)) {
          return { query: [...state.query, state.input], input: `` }
        } else {
          alert('already there')
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
    axios
      .get(
        `https://www.googleapis.com/customsearch/v1?key=${
          process.env.API_KEY
        }&cx=${process.env.SEARCH_ENGINE}&num=5&start=1`,
        {
          params: {
            q: this.state.query[0],
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
    } = this.state

    return (
      <div className="main">
        <div>
          <input
            type="radio"
            id="Url"
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
            value="topFive Search"
            checked={!UrlSearch}
            onChange={() =>
              this.setState(state => ({
                UrlSearch: !state.UrlSearch,
                query: [],
              }))
            }
          />
          <label htmlFor="topFive">Top Five Search</label>
        </div>
        <Search
          input={input}
          onClick={UrlSearch ? this.onClickAddUrl : this.onClickAddSearchTerm}
          onChange={this.onChangeInput}
        />
        <button
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
        </button>
        <ul>
          {data.length === 0 &&
            query.length >= 1 &&
            query.map(item => {
              return <li key={item}>{item}</li>
            })}
        </ul>
        {!error && data.length === 0 && fetching === true && (
          <div>Headless Chrome is running!</div>
        )}
        {!error ? (
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
