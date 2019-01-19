import styled from 'styled-components'

export const MainWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  padding: 0 40px;
`

export const H2 = styled.h2`
  font-family: Noto Naskh Arabic, Roboto Slab, Helvetica Neue, Helvetica, Arial;
  font-weight: lighter;
  font-size: 2.5rem;
  letter-spacing: 4px;
  line-height: 1;
  width: 460px;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  margin-bottom: 50px;
`
export const LoadingMessage = styled(H2)``

const Button = styled.button`
  opacity: ${props => (props.disabled ? '.7' : '1.0')};
  font-weight: 300;
  width: auto;
  text-transform: none;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  :focus {outline: 0;}
  :hover {  filter: brightness(90%);}
  font-size: .9rem;
    height: 52px;
        text-decoration: none;
    color: #fff;
    background-color: #448aff;
    text-align: center;
    letter-spacing: .5px;
    transition: .2s ease-out;
    border: none;
    border-radius: 2px;
    line-height: 36px;
    padding: 0 1rem;
    outline: 0;
    text-transform: uppercase;
    vertical-align: middle;
    -webkit-tap-highlight-color: 
        box-shadow: 0 2px 5px 0 rgba(0,0,0,.16), 0 2px 10px 0 rgba(0,0,0,.12);
`

export const RunLighthouseButton = styled(Button)`
  margin-bottom: 25px;
`
export const RunAnotherAuditButton = styled(Button)`
  margin: 20px 0;
`

export const RadioGroupWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 460px;
  height: 75px;
  margin-bottom: 25px;
`
export const RadioGroupStyles = styled.div`
  font-family: Noto Naskh Arabic, Roboto Slab, Helvetica Neue, Helvetica, Arial;
  font-weight: lighter;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  border: 1px solid #757575;
  padding: 10px 0;
  width: 40%;
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

export const SearchTermDescription = styled.div`
  font-family: Noto Naskh Arabic, Roboto Slab, Helvetica Neue, Helvetica, Arial;
  font-weight: lighter;
  margin-bottom: 25px;
`
export const SearchTerm = styled.div`
  font-size: 1.5rem;
  text-align: center;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
`
