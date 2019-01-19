import React from 'react'
import styled from 'styled-components'

const FooterWrapper = styled.footer`
  background: #448aff;
  color: #ffffff;
`
const Logo = styled.h3`
  line-height: 1.3;
  padding: 25px 40px 50px 40px;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 300;
`
const Footer = () => {
  return (
    <FooterWrapper>
      <Logo>all the Lighthouses</Logo>
    </FooterWrapper>
  )
}

export default Footer
