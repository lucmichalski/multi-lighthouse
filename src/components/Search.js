import React, { Component } from 'react'
import axios from 'axios'
import './Search.css'

class Search extends Component {
  state = {
    data: [],
    input: 'http://www.',
    query: [],
  }

  getData = query =>
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
    const { input, query, data } = this.state
    return (
      <div className="search">
        <input
          style={{ width: '300px' }}
          value={input}
          onChange={event => {
            event.persist()
            this.setState(state => ({
              input: `${event.target.value}`,
            }))
          }}
          type="text"
        />
        <button
          onClick={() =>
            this.setState(state => ({
              query: [...state.query, state.input],
              input: `http://www.`,
            }))
          }
        >
          Add URL
        </button>
        <button onClick={() => this.getData(query)}>Run Lighthouse</button>
        <ul>
          {query.length >= 1 &&
            query.map(item => {
              return <li key={item}>{item}</li>
            })}
        </ul>
        <ul>
          {data.length >= 1 &&
            data.map(item => (
              <li>
                {item.categories.performance.id}
                {item.categories.performance.score}
              </li>
            ))}
        </ul>
      </div>
    )
  }
}

export default Search
