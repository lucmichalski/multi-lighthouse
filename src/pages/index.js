import React, { Fragment } from 'react'

import Main from '../components/Main'
import Layout from '../components/Layout'
import SEO from '../components/Seo'

const IndexPage = () => (
  <Fragment>
    <Layout>
      <Main />
      <SEO />
      {/* <Link to="/page-2/">Go to page 2</Link> */}
    </Layout>
  </Fragment>
)

export default IndexPage
