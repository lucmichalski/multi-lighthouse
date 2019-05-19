import styled from 'styled-components'

export const ShowcaseContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex-wrap: wrap;
`

export const Showcase = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  cursor: pointer;
  margin-bottom: 20px;
  background: rgb(255, 255, 255);
  border-radius: 4px;
  @media (min-width: 900px) {
    font-size: 1rem;
  }
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
  width: 100%;

  @media (min-width: 900px) {
    font-size: 1rem;
  }
`
export const SummaryContainer = styled.div`
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  padding: 10px;
  margin: 0 8px;
  box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 2px 1px;
  position: relative;
`
export const Metric = styled(SummaryContainer)`
  height: auto;
`

export const Change = styled.div`
  font-weight: 300;
  font-size: 12px;
  letter-spacing: 0.05px;
  color: rgb(44, 44, 44);
`
export const Categories = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  padding: 0 15px;
`