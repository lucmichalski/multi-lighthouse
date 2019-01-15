import styled from 'styled-components'

export const RunLighthouseButton = styled.button`
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.302),
    0 1px 3px 1px rgba(60, 64, 67, 0.149);
  align-items: center;
  background:  #448aff;
  opacity: ${props => (props.disabled ? '.7' : '1.0')}
  border: 1px solid transparent;
  border-radius: 24px;
  color: #ffffff;
  display: inline-flex;
  font-family: 'Google Sans', Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
  font-weight: 500;
  font-size: 14px;
  height: 48px;
  letter-spacing: 0.15px;
  line-height: 22px;
  margin: 0;
  min-width: 120px;
  padding: 0;
  text-transform: none;
  width: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')}
`
