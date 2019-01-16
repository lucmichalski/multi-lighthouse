import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Button, InputWrapper, Plus } from './SearchStyles'
import lighthouseImg from '../images/lighthouse.png'

const Search = ({ input, onChange, onSubmit, placeholder, UrlSearch }) => {
  return (
    <Form onSubmit={e => onSubmit(e)}>
      <InputWrapper>
        <Input
          placeholder={placeholder}
          value={input}
          onChange={event => onChange(event)}
          type="text"
        />
        <Button type="button" onClick={() => onSubmit()}>
          {UrlSearch ? (
            <Plus>&#43;</Plus>
          ) : (
            <img src={lighthouseImg} alt="Logo" />
          )}
        </Button>
      </InputWrapper>
    </Form>
  )
}

Search.propTypes = {
  input: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  UrlSearch: PropTypes.bool.isRequired,
}

export default Search
