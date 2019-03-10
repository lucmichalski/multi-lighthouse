import styled from 'styled-components'

export const OuterGraph = styled.div`
  box-sizing: border-box;
  width: 100%;
  padding: 0 15px;
  margin-bottom: 25px;

  @media (min-width: 900px) {
    width: 49%;
  }
`
export const InnerGraph = styled.div`
  width: 100%;
  height: 300px;
`

export const Title = styled.h2`
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.5);
  margin: 0;
`
