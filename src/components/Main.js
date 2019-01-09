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
  }

  getData = () =>
    axios
      .get('http://localhost:8001/lighthouse', {
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
          }))
        } else if (response.data[0].runtimeError.code !== 'NO_ERROR') {
          this.setState(() => ({
            error: true,
            errorMessage: response.data[0].runtimeError.message,
          }))
        } else {
          this.setState(() => ({ data: response.data }))
        }
      })
      .catch(error => {
        console.log(error)
      })

  onChange = event => {
    event.persist()
    this.setState(() => ({
      input: `${event.target.value}`,
    }))
  }

  onClick = () =>
    this.setState(state => ({
      query: [...state.query, state.input],
      input: `https://www.`,
    }))

  render() {
    const { input, query, data, metrics, error, errorMessage } = this.state

    return (
      <div className="main">
        <Search input={input} onClick={this.onClick} onChange={this.onChange} />
        <button type="button" onClick={() => this.getData()}>
          Run Lighthouse
        </button>
        <ul>
          {data.length === 0 &&
            query.length >= 1 &&
            query.map(item => {
              return <li key={item}>{item}</li>
            })}
        </ul>
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
