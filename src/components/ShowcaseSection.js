import React, { useState } from 'react'
import Guage from './Guage'
import { Button, H3 } from './MainStyles'
import {
  ShowcaseContainer,
  Showcase,
  Categories,
  Average,
  Header,
  Metric,
  Change,
} from './ShowcaseSectionStyles'

function getPercentageChange(oldNumber, newNumber) {
  const decreaseValue = oldNumber - newNumber
  return ((decreaseValue / oldNumber) * 100).toFixed(2)
}

const ShowcaseSection = ({ category, showcaseData, getShowcaseData }) => {
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
      {showcaseData[category] && isOpen && (
        <ShowcaseContainer>
          <Header>
            <H3 />
            <Metric>Perf</Metric>
            <Metric>FCP</Metric>
            <Metric>TTI</Metric>
          </Header>
          {showcaseData[category].map(
            ({ URLAverageScore, decodedURL, currentScore }, index) => {
              const domain = new URL(decodedURL)
              const { perf, i, fcp } = currentScore
              const change = getPercentageChange(perf.score, URLAverageScore)
              const scores = [perf, fcp, i]
              return (
                <Showcase key={decodedURL}>
                  <div>
                    <H3>
                      {`${index + 1}. `}

                      {domain.hostname.split('.')[1]}
                    </H3>
                    <div>{decodedURL}</div>
                  </div>

                  {scores.map(({ score, val }) => (
                    <Average key="get key here">
                      <Guage
                        height="100px"
                        width="100px"
                        label={value => `${value}/100`}
                        dialStartAngle={90}
                        dialEndAngle={0}
                        value={score}
                      />
                      <div>
                        {(val * 0.001).toFixed(1)}
s
                      </div>
                      <Change>
                        {change}
%
                      </Change>
                    </Average>
                  ))}
                </Showcase>
              )
            }
          )}
        </ShowcaseContainer>
      )}
    </Categories>
  )
}

export default ShowcaseSection
