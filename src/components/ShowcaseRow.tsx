import React, { Fragment } from 'react'
import FieldInfo from './FieldInfo'
import LineGraph from './LineGraph'
import Guage from './Guage'
import { H3, H4 } from './MainStyles'
import {
  Showcase,
  SummaryContainer,
  Change,
  URLSection,
  Time,
  Err,
} from './ShowcaseSectionStyles'

function getPercentageChange(oldNumber, newNumber) {
  const decreaseValue = oldNumber - newNumber
  return (decreaseValue / oldNumber) * 100
}

const ShowcaseRow = ({
  averageScores,
  decodedURL,
  currentScores,
  pastAverageScores,
  URLindex,
  metrics,
}) => {
  const domain = new URL(decodedURL)
  const {
    perf,
    i,
    fcp,
    fci,
    eil,
    fmp,
    si,
    ttfb,
    tbt,
    mpfid,
    captcha,
    'field-fcp': fieldFCP,
    'field-fid': fieldFID,
    'field-fcp-origin': fieldFCPOrigin,
    'field-fid-origin': fieldFIDOrigin,
  } = currentScores
  if (perf.score === 0) {
    return null
  }
  const {
    perf: avgPerf,
    i: avgI,
    fcp: avgFcp,
    fci: avgFci,
    eil: avgEil,
    fmp: avgFmp,
    si: avgSi,
    ttfb: avgTtfb,
    tbt: avgTbt,
    mpfid: avgMpfid,
    fieldFCP: avgFieldFCP,
    fieldFID: avgFieldFID,
    fieldFCPOrigin: avgFieldFCPOrigin,
    fieldFIDOrigin: avgFieldFIDOrigin,
  } = averageScores
  const scores = [
    [perf, avgPerf],
    [i, avgI],
    [si, avgSi],
    [fcp, avgFcp],
    [fci, avgFci],
    [fmp, avgFmp],
    [eil, avgEil],
    [ttfb, avgTtfb],
    [tbt, avgTbt],
    [mpfid, avgMpfid],
    [fieldFCP, avgFieldFCP],
    [fieldFID, avgFieldFID],
    [fieldFCPOrigin, avgFieldFCPOrigin],
    [fieldFIDOrigin, avgFieldFIDOrigin],
  ]

  return (
    <Showcase key={decodedURL}>
      <URLSection>
        <H3>
          {`${URLindex + 1}. `}

          {domain.hostname.split('.')[1]}
        </H3>
        <H4>{decodedURL}</H4>
        {currentScores.err !== 0 && <Err>{currentScores.err}</Err>}
        {captcha && captcha.val === 0 && (
          <Err>
            Captcha was found on page load. This may interfere with performance
            scores
          </Err>
        )}
      </URLSection>

      {scores &&
        scores.map(([current, avg], index) => {
          if (!current) {
            return null
          }
          const change = getPercentageChange(current.val, avg)
          const isIncrease =
            metrics[index] === 'perf'
              ? change > 0
                ? false
                : true
              : change > 0
              ? true
              : false
          const changeStr = change.toFixed(2)

          return (
            <SummaryContainer key={metrics[index]}>
              {current.error ? (
                current.error
              ) : (
                <Fragment>
                  {metrics[index].includes('field') && (
                    <FieldInfo current={current} />
                  )}

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
                  {change !== 0 && (
                    <Change isIncrease={isIncrease}>
                      {changeStr[0] === '-' ? changeStr.slice(1) : changeStr}%
                      {isIncrease ? <span>&darr;</span> : <span>&uarr;</span>}
                      avg
                    </Change>
                  )}
                  {false && (
                    <div className="line-graph-container">
                      <LineGraph
                        data={
                          pastAverageScores &&
                          Object.entries(pastAverageScores).map(
                            ([date, scoresByDate]) => ({
                              x: date,
                              y: scoresByDate[metrics[index]],
                            })
                          )
                        }
                      />
                    </div>
                  )}
                </Fragment>
              )}
            </SummaryContainer>
          )
        })}
    </Showcase>
  )
}

export default ShowcaseRow
