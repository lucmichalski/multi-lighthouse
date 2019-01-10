import React, { Component } from 'react'
import axios from 'axios'
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
    return axios
      .get('http://localhost:8080/lighthouse', {
        params: {
          urls: this.state.query,
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
    //todo: utils file
    function validURL(str) {
      const pattern = new RegExp(
        '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name and extension
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?' + // port
        '(\\/[-a-z\\d%@_.~+&:]*)*' + // path
        '(\\?[;&a-z\\d%@_.,~+&:=-]*)?' + // query string
          '(\\#[-a-z\\d_]*)?$',
        'i'
      )

      return pattern.test(str)
    }

    this.setState(state => {
      if (validURL(state.input)) {
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
