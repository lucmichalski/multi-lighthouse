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
import { GlobalState } from './Main'

interface Props extends Partial<GlobalState> {
  category: GlobalState['categories'][0]
  getShowcaseData: (category: GlobalState['categories'][0]) => void
}

const ShowcaseSection = ({
  category,
  showcaseData,
  getShowcaseData,
  metrics,
  metricsDisplayNames,
  loading,
}: Props): JSX.Element => {
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
            : (): void => toggleOpen(!isOpen)
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
            {metrics.map((metric: any) => (
              <Metric key={metric}>{metricsDisplayNames[metric]}</Metric>
            ))}
          </Header>
          {showcaseData[category] &&
            showcaseData[category].map(
              (
                {
                  averageScores,
                  decodedURL,
                  currentScores,
                  pastAverageScores,
                }: Props['showcaseData'],
                URLindex: number
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
