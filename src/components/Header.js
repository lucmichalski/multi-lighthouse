//import { Link } from 'gatsby'
//import PropTypes from 'prop-types'
import React from 'react'

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
    <Logo>all the Lighthouses</Logo>
  </header>
)

// const Header = ({ siteTitle }) => (
//   <Link
//     to="/"
//     style={{
//       color: `white`,
//       textDecoration: `none`,
//     }}
//   >
//     {siteTitle}
//   </Link>
// )

// Header.propTypes = {
//   siteTitle: PropTypes.string,
// }

// Header.defaultProps = {
//   siteTitle: ``,
// }

export default Header
