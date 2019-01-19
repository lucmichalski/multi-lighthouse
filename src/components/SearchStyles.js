import styled from 'styled-components'

export const Form = styled.form`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 25px;
`

export const InputWrapper = styled.div`
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
  padding: 0 15px;
`

export const Input = styled.input`
  width: 300px;
  border: none;
  box-sizing: content-box;
  color: rgba(0, 0, 0, 0.87);
  font-size: 1rem;
  line-height: 1;
  outline: none;
`

export const Button = styled.button`
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  box-sizing: border-box;
  background: #448aff;
  border-radius: 100%;
  color: #ffffff;
  width: 48px;
  height: 48px;
  font-size: 1.5rem;
  padding: 0;
  :focus {
    outline: 0;
  }
  :hover {
    filter: brightness(90%);
  }
`
export const Plus = styled.div`
  margin-top: -4px;
  margin-left: 1px;
`
