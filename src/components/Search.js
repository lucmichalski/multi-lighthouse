import React from 'react'
import PropTypes from 'prop-types'

const Search = ({ input, onChange, onClick, placeholder }) => {
  return (
    <div>
      <input
        placeholder={placeholder}
        value={input}
        onChange={event => onChange(event)}
        type="text"
      />
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
  placeholder: PropTypes.string.isRequired,
}

export default Search
