import React, { Fragment } from 'react'
import { Link } from 'gatsby'
import Helmet from 'react-helmet'
import Layout from '../components/Layout'
import AuthPage from '../components/AuthPage'
import SEO from '../components/Seo'

const SecondPage = () => (
  <Fragment>
    <Helmet>
      <link
        rel="stylesheet"
        href="https://unpkg.com/react-vis/dist/style.css"
      />
    </Helmet>
    <Layout>
      <SEO title="Page two" />
      <AuthPage />
      <Link to="/">Go back to the homepage</Link>
    </Layout>
  </Fragment>
)

export default SecondPage
