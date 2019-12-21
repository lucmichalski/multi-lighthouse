import React, { useState } from 'react'
import ShowcaseRow from './ShowcaseRow'
import { Button } from './MainStyles'
import {
  ShowcaseContainer,
  Categories,
  Header,
  Metric,
  Buffer,
} from './ShowcaseSectionStyles'

const ShowcaseSection = ({
  category,
  showcaseData,
  getShowcaseData,
  metrics,
  metricsDisplayNames,
  loading,
}) => {
  const [isOpen, toggleOpen] = useState(false)
  const getShowcaseDataAndOpen = () => {
    getShowcaseData(category)
    toggleOpen(true)
  }

  return (
    <Categories key={category}>
      <Button
        background="#fff"
        color="#2c2c2c"
        onClick={
          !showcaseData[category] && !isOpen
            ? getShowcaseDataAndOpen
            : () => toggleOpen(!isOpen)
        }
      >
        {category}
      </Button>
      {loading && isOpen && (
        <div className="progress-container" style={{ width: `100%` }}>
          <div className="progress-bar">
            <span className="progress-value" style={{ width: `100%` }} />
          </div>
        </div>
      )}
      {showcaseData[category] && isOpen && (
        <ShowcaseContainer>
          <Header>
            <Buffer />
            {metrics.map(metric => (
              <Metric key={metric}>{metricsDisplayNames[metric]}</Metric>
            ))}
          </Header>
          {showcaseData[category] &&
            showcaseData[category].map(
              (
                { averageScores, decodedURL, currentScores, pastAverageScores },
                URLindex
              ) => (
                <ShowcaseRow
                  key={URLindex}
                  metrics={metrics}
                  averageScores={averageScores}
                  decodedURL={decodedURL}
                  currentScores={currentScores}
                  pastAverageScores={pastAverageScores}
                  URLindex={URLindex}
                />
              )
            )}
        </ShowcaseContainer>
      )}
    </Categories>
  )
}

export default ShowcaseSection
