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

const ShowcaseSection = ({
  category,
  showcaseData,
  getShowcaseData,
  metrics,
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
      {showcaseData[category] && isOpen && (
        <ShowcaseContainer>
          <Header>
            <H3 />
            {metrics.map(metric => (
              <Metric key={metric}>{metric}</Metric>
            ))}
          </Header>
          {showcaseData[category].map(
            ({ averageScores, decodedURL, currentScores }, index) => {
              const domain = new URL(decodedURL)
              const { perf, i, fcp, fci, eil, fmp, si } = currentScores
              const {
                perf: avgPerf,
                i: avgI,
                fcp: avgFcp,
                fci: avgFci,
                eil: avgEil,
                fmp: avgFmp,
                si: avgSi,
              } = averageScores
              const scores = [
                [perf, avgPerf],
                [fcp, avgFcp],
                [fmp, avgFmp],
                [si, avgSi],
                [fci, avgFci],
                [i, avgI],
                [eil, avgEil],
              ]
              console.log(scores)
              return (
                <Showcase key={decodedURL}>
                  <div>
                    <H3>
                      {`${index + 1}. `}

                      {domain.hostname.split('.')[1]}
                    </H3>
                    <div>{decodedURL}</div>
                  </div>

                  {scores.map(([current, avg], index) => (
                    <Average key={metrics[index]}>
                      <Guage
                        height="100px"
                        width="100px"
                        label={value => `${value}/100`}
                        dialStartAngle={90}
                        dialEndAngle={0}
                        value={Math.round(current.score)}
                      />
                      <div>
                        {(current.val * 0.001).toFixed(1)}
s
                      </div>
                      <Change>
                        {getPercentageChange(current.val, avg)}
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
