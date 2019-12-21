import React from 'react'
import Helmet from 'react-helmet'
import { StaticQuery, graphql } from 'gatsby'

interface Props {
  description?: string
  lang?: string
  meta?: string[]
  keywords?: string[]
  title?: string
}

const detailsQuery = graphql`
  query DefaultSEOQuery {
    site {
      siteMetadata {
        title
        description
        author
      }
    }
  }
`

function SEO(props: Props): JSX.Element {
  const { description, keywords, title } = props
  return (
    <StaticQuery
      query={detailsQuery}
      render={data => {
        const metaDescription =
          description || data.site.siteMetadata.description
        return (
          <Helmet
            htmlAttributes={{
              lang: 'en',
            }}
            title={title || data.site.siteMetadata.title}
            // titleTemplate={}
            meta={[
              {
                name: `description`,
                content: metaDescription,
              },
              {
                property: `og:title`,
                content: title,
              },
              {
                property: `og:description`,
                content: metaDescription,
              },
              {
                property: `og:type`,
                content: `website`,
              },
              {
                name: `twitter:card`,
                content: `summary`,
              },
              {
                name: `twitter:creator`,
                content: data.site.siteMetadata.author,
              },
              {
                name: `twitter:title`,
                content: title,
              },
              {
                name: `twitter:description`,
                content: metaDescription,
              },
              {
                name: 'google-site-verification',
                content: 'GumqlBaPeibtE8a7Zy_p8Q0efnBVy6-ZAnRNxFM-5cI',
              },
            ]
              .concat(
                keywords && keywords.length > 0
                  ? {
                      name: `keywords`,
                      content: keywords.join(`, `),
                    }
                  : []
              )
              .concat([])}
          />
        )
      }}
    />
  )
}

export default SEO
