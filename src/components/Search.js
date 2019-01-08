import React, { Component } from 'react'
import axios from 'axios'
import {
  XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  VerticalBarSeries,
  DiscreteColorLegend,
} from 'react-vis'
import './Search.css'

class Search extends Component {
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
        this.setState(() => ({ data: response.data }))
      })
      .catch(error => {
        console.log(error)
      })

  render() {
    const { input, query, data, metrics } = this.state
    const legendItems = data.map(({ finalUrl }) => finalUrl)
    return (
      <div className="search">
        <input
          style={{ width: '300px' }}
          value={input}
          onChange={event => {
            event.persist()
            this.setState(() => ({
              input: `${event.target.value}`,
            }))
          }}
          type="text"
        />
        <button
          type="button"
          onClick={() =>
            this.setState(state => ({
              query: [...state.query, state.input],
              input: `https://www.`,
            }))
          }
        >
          Add URL
        </button>
        <button type="button" onClick={() => this.getData()}>
          Run Lighthouse
        </button>
        <ul>
          {query.length >= 1 &&
            query.map(item => {
              return <li key={item}>{item}</li>
            })}
        </ul>

        <DiscreteColorLegend height={200} width={300} items={legendItems} />
        <XYPlot height={700} width={1200} xType="ordinal">
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis title="metric" />
          <YAxis title="ms" />
          {data.map(item => {
            return (
              <VerticalBarSeries
                key={item.finalUrl}
                data={metrics.map(metric => {
                  console.log(item.audits[metric])
                  return {
                    x: item.audits[metric].title,
                    y: item.audits[metric].rawValue,
                  }
                })}
              />
            )
          })}
          {/* <VerticalBarSeries
            key="blah"
            data={[
              {
                x: 10,
                y: 20,
              },
            ]}
          /> */}
        </XYPlot>
      </div>
    )
  }
}

export default Search
