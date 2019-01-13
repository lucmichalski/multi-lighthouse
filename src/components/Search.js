import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Form = styled.form`
  display: flex;
  justify-content: center;
  align-items: center;
`
const InputWrapper = styled.div`
  width: 430px;
  height: 74px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-radius: 2px;
  border: none;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  box-sizing: content-box;
  color: #424242;
  direction: ltr;
  font-size: 1rem;
  line-height: 1;
  padding: 0 15px;
`

const Input = styled.input`
  width: 300px;
  border: none;
  box-sizing: content-box;
  color: #424242;
  font-size: 1rem;
  line-height: 1;
  outline: none;
`

const Button = styled.button`
  box-sizing: border-box;
  background: #448aff;
  border-radius: 100%;
  color: #ffffff;
  width: 48px;
  height: 48px;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0;
`

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
          +
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
