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
  box-shadow: rgba(0, 0, 0, 0.12) 0px 4px 4px;
  padding: 0 20px;
  cursor: pointer;
  margin-bottom: 15px;
  background: rgb(255, 255, 255);
  :hover {
    filter: brightness(98%);
  }
  border-radius: 4px;
  @media (min-width: 900px) {
    font-size: 1rem;
  }
`

export const Header = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 20px;

  @media (min-width: 900px) {
    font-size: 1rem;
  }
`
export const Average = styled.div`
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`
export const Metric = styled(Average)`
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
`
