import styled from 'styled-components'

const Button = styled.button`
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.302),
    0 1px 3px 1px rgba(60, 64, 67, 0.149);
  align-items: center;
  background:  #448aff;
  opacity: ${props => (props.disabled ? '.7' : '1.0')}
  border: 1px solid transparent;
  border-radius: 24px;
  color: #ffffff;
  display: inline-flex;
  font-weight: 500;
  font-size: 14px;
  height: 48px;
  letter-spacing: 0.15px;
  line-height: 22px;
  margin: 0;
  width: auto;
  padding: 0 15px;
  text-transform: none;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  :focus {outline: 0;}
`

export const RunLighthouseButton = styled(Button)``
export const SearchAgainButton = styled(Button)`
  margin: 20px 0;
`

export const RadioGroupWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 460px;
  height: 74px;
  font-size: 18px;
`
export const RadioGroupStyles = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export const MainWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
`

export const UL = styled.ul`
  list-style: none;
  padding: 0;
  margin: 20px 0;
  width: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  display: flex;
`

export const LI = styled.li`
  justify-content: space-between;
  align-items: center;
  display: flex;
  width: 100%;
`
export const IMG = styled.img`
  width: 30px;
  height: 30px;
  cursor: pointer;
`
