import React, { Fragment, useState } from 'react'

import BarGraphTimeline from './BarGraphTimeline'
import { GraphH2, BarGraphTimelineContainer, Arrow } from './MainStyles'

export default function URLGraphSection({
  url,
  urlLHRData,
  color,
  metrics,
  retrieveDbReport,
  metricsDisplayNames,
  fetchURLData,
}) {
  const defaultState = {
    areGraphsVisible: false,
  }
  const [graph, setGraphVisibility] = useState(defaultState)
  const { areGraphsVisible } = graph
  const lhrsAndDatesForURL = urlLHRData[url[0]]
  const justLHRsForURL =
    lhrsAndDatesForURL && urlLHRData[url[0]].map(item => item[1])
  return (
    <div style={{ width: '100%' }} key={url[1]}>
      {/*eslint-disable-next-line*/}
      <div
        style={{ width: '100%' }}
        role="button"
        onKeyDown={() => {
          fetchURLData(url[0])
          setGraphVisibility({ areGraphsVisible: !areGraphsVisible })
        }}
        onClick={() => {
          fetchURLData(url[0])
          setGraphVisibility({ areGraphsVisible: !areGraphsVisible })
        }}
      >
        <GraphH2>
          {url[1]}
          <Arrow isOpen={false} />
        </GraphH2>
      </div>
      {lhrsAndDatesForURL && areGraphsVisible && (
        <BarGraphTimelineContainer>
          <Fragment>
            {metrics.map(metric => (
              <BarGraphTimeline
                onClick={retrieveDbReport}
                color={color}
                dbKey={url}
                key={metric}
                data={justLHRsForURL}
                metric={metric}
                metricsDisplayNames={metricsDisplayNames}
              />
            ))}
          </Fragment>
        </BarGraphTimelineContainer>
      )}
    </div>
  )
}
