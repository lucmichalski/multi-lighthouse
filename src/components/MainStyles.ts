import styled from 'styled-components'

export const MainWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  overflow-x: scroll;
  -webkit-overflow-scrolling: touch;
  @media (min-width: 1800px) {
    overflow-x: visible;
  }
`
export const InnerWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  width: 100%;
`
export const H2 = styled.h2`
  font-weight: 600;
  font-size: 1rem;
  width: 100%;
  text-align: center;
  @media (min-width: 900px) {
    font-size: 2rem;
  }
`

export const Hero = styled.header`
  border-bottom: 1px solid #f2f2f2;
  background-color: hsl(0, 0%, 97%);
  width: 100%;
  height: 35vh;
  padding: 1rem;
`
export const H3 = styled.h3`
  font-weight: 600;
  font-size: 1rem;
  margin: 0;
  text-transform: capitalize;
`
export const H4 = styled.h3`
  font-weight: 100;
  font-size: 0.8rem;
  margin: 0;
`
export const GraphH2 = styled(H2)`
  box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 2px 1px;
  min-height: 50px;
  display: flex;
  padding: 0 20px;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: rgb(255, 255, 255);
  font-size: 0.6rem;
  word-wrap: break-word;
  text-align: left;
  :hover {
    filter: brightness(98%);
  }
  border-radius: 4px;
  @media (min-width: 900px) {
    font-size: 1rem;
  }
`
export const Button = styled.button`
  opacity: ${props => (props.disabled ? '.7' : '1.0')};
  font-weight: 300;
  text-transform: none;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  align-self: flex-start;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  :focus {outline: 0;}
  :hover {  
    opacity: .7; 
    filter: brightness(90%);
  }
  font-size: .9rem;
    height: 52px;
    text-decoration: none;
    color: ${props => (props.color ? props.color : `rgb(0, 0, 28)`)};
    background-color: ${props =>
      props.background ? props.background : `rgb(0, 0, 28)`};
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

export const RunAnotherAuditButton = styled(Button)`
  margin: 20px 0 60px 0;
`
export const RadioGroupWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
  margin-bottom: 25px;
`
export const RadioGroupStyles = styled.div`
  font-weight: normal;
  opacity: 0.8;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 25px;
`
export const BarGraphTimelineContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 25px;
`
export const Modal = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;

  @media (min-width: 600px) {
    padding: 1rem;
  }
`
export const ModalContent = styled.div`
  box-sizing: border-box;
  display: grid;
  grid-template-rows: auto;
  justify-items: center;
  background: #fff;
  position: relative;
  padding: 5em 20px 0 20px;
  @media (min-width: 600px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`
export const ModalTitle = styled.h5`
  margin: 0 0 30px 0;
  font-size: 0.8em;
`
export const ModalMetric = styled.div`
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height 49vw;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 2px 1px;
  @media (min-width: 600px) {
    width: 29vw;
    height: 29vw;
  }
`
export const CloseModal = styled.button`
  position: absolute;
  top: 1em;
  right: 1em;
  z-index: 2;
  color: black;
  background: transparent;
  border: none;
  cursor: pointer;
  font-weight: 100;
  text-decoration: underline;
`
export const Arrow = styled.span`
  border: solid rgba(0, 0, 0, 0.5);
  border-width: 0 1px 1px 0;
  display: inline-block;
  width: 15px;
  height: 15px;
  transform: ${props => (props.isOpen ? `rotate(-135deg)` : 'rotate(45deg)')};
  transition: all 0.1s ease;
`
export const AuthContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  padding: 10px 10px 0 0;
`
export const SignOut = styled.button`
  border: none;
  background: #fff;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
`
