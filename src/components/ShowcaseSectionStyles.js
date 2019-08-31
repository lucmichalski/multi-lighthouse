import styled from 'styled-components'

export const ShowcaseContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex-wrap: wrap;
  width: inherit;
  font-size: 1rem;
`

export const Showcase = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: inherit;
  cursor: pointer;
  margin-bottom: 20px;
  background: rgb(255, 255, 255);
  border-radius: 4px;
`
export const Buffer = styled.div`
  width: 300px;
  padding: 15px;
`

export const URLSection = styled.div`
  box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 2px 1px;
  box-sizing: border-box;
  height: 100px;
  width: 300px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

export const Header = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 10px 0;
  width: inherit;
  z-index: 1;

  @media (min-width: 900px) {
    position: sticky;
    top: -10px;
  }
`
export const SummaryContainer = styled.div`
  width: 130px;
  height: 120px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  padding: 20px;
  margin: 0 8px;
  box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 2px 1px;
  position: relative;
`
export const Metric = styled(SummaryContainer)`
  height: 58px;
  font-size: 0.8em;
  padding: 10px;
  background: #fff;
`

export const Change = styled.div`
  font-weight: 300;
  font-size: 0.6em;
  letter-spacing: 0.05px;
  color: rgb(44, 44, 44);
  padding: 2px 5px;
  background: ${props =>
    props.isIncrease ? 'rgba(255, 0, 0, 0.2);' : 'rgba(41, 241, 195, 0.2)'};
`

export const Time = styled.div`
  font-size: 0.8em;
  letter-spacing: 0.05px;
  color: rgb(44, 44, 44);
`

export const Categories = styled.div`
  width: auto;
  overflow-x: scroll;
  -webkit-overflow-scrolling: touch
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  padding: 0 15px;
`
