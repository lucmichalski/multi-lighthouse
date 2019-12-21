import React from 'react'
import { Link } from 'gatsby'
import styled from 'styled-components'

const FooterWrapper = styled.footer`
  background: rgb(0, 0, 28);
  color: #ffffff;
`
const Logo = styled.h3`
  line-height: 1.3;
  padding: 25px 40px 50px 40px;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 300;
  color: #ffffff;
`
const Footer = () => {
  return (
    <FooterWrapper>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Logo>all the Lighthouses</Logo>
      </Link>
    </FooterWrapper>
  )
}

export default Footer
