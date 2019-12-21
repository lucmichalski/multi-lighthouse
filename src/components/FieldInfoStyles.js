import styled from 'styled-components'

export const InfoI = styled.button`
  position: absolute;
  top: 3px;
  right: 3px;
  border-radius: 100%;
  background: transparent;
  height: 18px;
  width: 18px;
  cursor pointer;
  font-size 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
`

export const Info = styled.div`
  position: absolute;
  width: 270px;
  top: 3px;
  left: 3px;
  z-index: 10;
  background: rgba(245, 245, 245);
  box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 2px 1px;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-direction: column;
  padding: 15px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.3);
  text-align: center;
`
export const Stat = styled.div`
  width: 240px;
  padding: 10px 0;
  text-align: left;
`

export const Title = styled.h3`
  font-size: 18px;
  width: 240px;
`
