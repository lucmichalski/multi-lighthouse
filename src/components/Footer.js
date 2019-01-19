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
  color: #ffffff;
`
const Footer = () => {
  return (
    <FooterWrapper>
      <a
        style={{ textDecoration: 'none' }}
        href={
          process.env.NODE_ENV === 'production'
            ? 'https://allthelighthouses.netlify.com/'
            : 'http://localhost:8000/'
        }
      >
        <Logo>all the Lighthouses</Logo>
      </a>
    </FooterWrapper>
  )
}

export default Footer
