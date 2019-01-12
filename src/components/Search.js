import React from 'react'
import PropTypes from 'prop-types'

const Search = ({ input, onChange, onClick }) => {
  return (
    <div>
      <input value={input} onChange={event => onChange(event)} type="text" />
      <button type="button" onClick={() => onClick()}>
        +
      </button>
    </div>
  )
}

Search.propTypes = {
  input: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
}

export default Search
