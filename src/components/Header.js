import React from 'react'
import { Link } from 'gatsby'
import styled from 'styled-components'

const Logo = styled.h1`
  color: #424242;
  line-height: 1.3;
  margin: 50px 40px 25px 40px;
  font-size: 2rem;
  font-weight: 300;
`

const Header = () => (
  <header>
    <Link
      to="/"
      style={{ textDecoration: 'none' }}
      href={
        process.env.NODE_ENV === 'production'
          ? 'https://allthelighthouses.netlify.com/'
          : 'http://localhost:8000/'
      }
    >
      <Logo>all the Lighthouses</Logo>
    </Link>
  </header>
)

export default Header
