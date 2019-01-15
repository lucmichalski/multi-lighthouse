import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Button, InputWrapper, Plus } from './SearchStyles'

const Search = ({ input, onChange, onSubmit, placeholder }) => {
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
          <Plus>&#43;</Plus>
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
}

export default Search
