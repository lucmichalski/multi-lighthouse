import React, { useState } from 'react'
import LineGraph from './LineGraph'
import Guage from './Guage'
import { Button, H3, H4 } from './MainStyles'
import {
  ShowcaseContainer,
  Showcase,
  Categories,
  SummaryContainer,
  Header,
  Metric,
  Change,
  URLSection,
  Buffer,
  Time,
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
  metricsDisplayNames,
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
            <Buffer />
            {metrics.map(metric => (
              <Metric key={metric}>{metricsDisplayNames[metric]}</Metric>
            ))}
          </Header>
          {showcaseData[category].map(
            (
              { averageScores, decodedURL, currentScores, pastAverageScores },
              URLindex
            ) => {
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

              return (
                <Showcase key={decodedURL}>
                  <URLSection>
                    <H3>
                      {`${URLindex + 1}. `}

                      {domain.hostname.split('.')[1]}
                    </H3>
                    <H4>{decodedURL}</H4>
                  </URLSection>

                  {scores.map(([current, avg], index) => {
                    const change = getPercentageChange(current.val, avg)
                    const isIncrease =
                      metrics[index] === 'perf'
                        ? change > 0
                          ? false
                          : true
                        : change > 0
                        ? true
                        : false

                    return (
                      <SummaryContainer key={metrics[index]}>
                        <Guage
                          label={value => `${value}/100`}
                          dialStartAngle={90}
                          dialEndAngle={0}
                          value={Math.round(current.score)}
                        />
                        <Time>
                          {metrics[index] === 'perf'
                            ? `${current.val} total`
                            : `${(current.val * 0.001).toFixed(2)}s`}
                        </Time>
                        <Change isIncrease={isIncrease}>
                          {change.toString().slice(1)}
%
                          {isIncrease ? (
                            <span>&darr;</span>
                          ) : (
                            <span>&uarr;</span>
                          )}
                          avg
                        </Change>
                        {false && (
                          <div className="line-graph-container">
                            <LineGraph
                              data={Object.entries(pastAverageScores).map(
                                ([date, scoresByDate]) => ({
                                  x: date,
                                  y: scoresByDate[metrics[index]],
                                })
                              )}
                            />
                          </div>
                        )}
                      </SummaryContainer>
                    )
                  })}
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
