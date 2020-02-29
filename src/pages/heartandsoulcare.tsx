import React, { Fragment } from 'react'
import { Link } from 'gatsby'
import Helmet from 'react-helmet'
import Layout from '../components/Layout'
import UserGraphs from '../components/UserGraphs'
import SEO from '../components/Seo'

const HeartAndSoulCare = () => (
  <Fragment>
    <Helmet>
      <link
        rel="stylesheet"
        href="https://unpkg.com/react-vis/dist/style.css"
      />
    </Helmet>
    <Layout>
      <SEO title="Land" />
      <Link
        style={{
          position: 'absolute',
          right: 20,
          top: 20,
          textDecoration: 'none',
          background: 'rgb(0,0,28)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: `4px`,
        }}
        to="/"
      >
        Home
      </Link>
      <UserGraphs uid={'heartandsoulcare'} />
    </Layout>
  </Fragment>
)

export default HeartAndSoulCare
