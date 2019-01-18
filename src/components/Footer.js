import React from 'react'
import styled from 'styled-components'

const FooterWrapper = styled.footer`
  background: #448aff;
  color: #ffffff;
`
const Logo = styled.h3`
  line-height: 1.3;
  padding: 1rem 0 2rem 0;
  margin: 0 0.5em;
  font-size: 2rem;
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
