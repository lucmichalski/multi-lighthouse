import React from 'react'
import { Link } from 'gatsby'
import styled from 'styled-components'

const Logo = styled.h1`
  color: #424242;
  line-height: 1.3;
  margin: 50px 40px 15px 40px;
  font-size: 2rem;
  font-weight: 300;
`
const TagLine = styled.h2`
  color: #424242;
  font-size: 1rem;
  font-weight: 200;
  opacity: 0.7;
  margin: 0 15px 40px 40px;
`

const Header = () => (
  <header>
    <Link to="/" style={{ textDecoration: 'none' }}>
      <Logo>all the Lighthouses</Logo>
    </Link>
    <TagLine>
      Daily Lighthouse performance reports performed on Alexa Top Sites and
      more.
    </TagLine>
  </header>
)

export default Header
