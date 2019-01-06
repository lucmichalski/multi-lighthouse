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
    return (
      <div className="search">
        <input
          style={{ width: '300px' }}
          value={this.state.input}
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
        <button onClick={() => this.getData(this.state.query)}>
          Run Lighthouse
        </button>
        <ul>
          {this.state.query.length >= 1 &&
            this.state.query.map(item => {
              return <li key={item}>{item}</li>
            })}
        </ul>
        <ul>
          {this.state.data.length >= 1 &&
            this.state.data.map(item => (
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
