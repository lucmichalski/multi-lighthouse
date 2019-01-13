import React, { Component } from 'react'
import axios from 'axios'
import isUrl from 'is-url'
import BarGraph from './BarGraph'
import Search from './Search'

import './Main.css'

class Main extends Component {
  state = {
    data: [],
    input: 'https://www.',
    query: [],
    metrics: [
      'first-contentful-paint',
      'first-meaningful-paint',
      'speed-index',
      'first-cpu-idle',
      'interactive',
      'estimated-input-latency',
    ],
    error: false,
    errorMessage: '',
    fetching: false,
  }

  getData = () => {
    this.setState(() => ({ fetching: true }))
    const { query } = this.state
    const url = process.env.SERVER
    return axios
      .get(url, {
        params: {
          urls: query,
        },
      })
      .then(response => {
        console.log(response.data)
        /*this needs to be for every item in array */
        if (response.data[0].code) {
          this.setState(() => ({
            error: true,
            errorMessage: response.data[0].friendlyMessage,
            fetching: false,
          }))
        } else if (response.data[0].runtimeError.code !== 'NO_ERROR') {
          this.setState(() => ({
            error: true,
            errorMessage: response.data[0].runtimeError.message,
            fetching: false,
          }))
        } else {
          this.setState(() => ({ data: response.data, fetching: false }))
        }
      })
      .catch(error => {
        console.log(error)
      })
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
          return {
            query: [...state.query, state.input],
            input: `https://www.`,
          }
        } else {
          alert('already there')
        }
      } else {
        alert('not valid')
      }
    })
  }

  getTopFive = () => {
    axios
      .get(
        `https://www.googleapis.com/customsearch/v1?key=${
          process.env.API_KEY
        }&cx=${process.env.SEARCH_ENGINE}&num=5`,
        {
          params: {
            q: 'land for sale texas',
          },
        }
      )
      .then(response => {
        console.log(response)
        this.setState(() => ({ fetching: true }))
        const query = response.data.items.map(({ link }) => link)
        const url = process.env.SERVER
        return axios
          .get(url, {
            params: {
              urls: query,
            },
          })
          .then(response => {
            console.log(response.data)
            /*this needs to be for every item in array */
            if (response.data[0].code) {
              this.setState(() => ({
                error: true,
                errorMessage: response.data[0].friendlyMessage,
                fetching: false,
              }))
            } else if (response.data[0].runtimeError.code !== 'NO_ERROR') {
              this.setState(() => ({
                error: true,
                errorMessage: response.data[0].runtimeError.message,
                fetching: false,
              }))
            } else {
              this.setState(() => ({ data: response.data, fetching: false }))
            }
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
      fetching,
    } = this.state

    return (
      <div className="main">
        <Search
          input={input}
          onClick={this.onClickAddUrl}
          onChange={this.onChangeInput}
        />
        <button
          type="button"
          disabled={query.length === 0}
          onClick={query.length >= 1 ? () => this.getData() : null}
        >
          Run Lighthouse
        </button>
        <button onClick={() => this.getTopFive()} type="button">
          Top 5
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
          <div>{errorMessage}</div>
        )}
      </div>
    )
  }
}

export default Main
