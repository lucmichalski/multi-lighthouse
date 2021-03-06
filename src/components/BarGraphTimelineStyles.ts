import styled from 'styled-components'

export const OuterGraph = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 75vw;
  padding: 0 15px;
  margin-bottom: 50px;

  @media (min-width: 900px) {
    width: 50%;
    height: 33vw;
  }
`
export const InnerGraph = styled.div`
  width: 100%;
  height: 100%;
`

export const Title = styled.h2`
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.5);
  margin: 0;
`
