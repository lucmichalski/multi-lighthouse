import React, { Fragment } from 'react'

import Helmet from 'react-helmet'
import Main from '../components/Main'
import Layout from '../components/Layout'
import SEO from '../components/seo'

const IndexPage = () => (
  <Fragment>
    <Helmet>
      <link
        rel="stylesheet"
        href="https://unpkg.com/react-vis/dist/style.css"
      />
    </Helmet>
    <Layout>
      <Main />
      <SEO />
      {/* <Link to="/page-2/">Go to page 2</Link> */}
    </Layout>
  </Fragment>
)

export default IndexPage
