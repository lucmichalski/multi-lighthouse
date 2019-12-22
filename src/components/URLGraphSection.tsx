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
  const decodedURL = url[1]
  const encodedURL = url[0]
  function handleGraphEvents() {
    fetchURLData(encodedURL)
    setGraphVisibility({ areGraphsVisible: !areGraphsVisible })
  }

  return (
    <div style={{ width: '100%' }} key={url[1]}>
      {/*eslint-disable-next-line*/}
      <div
        style={{ width: '100%' }}
        role="button"
        onKeyDown={handleGraphEvents}
        onClick={handleGraphEvents}
      >
        <GraphH2>
          {decodedURL}
          <Arrow isOpen={false} />
        </GraphH2>
      </div>
      {urlLHRData && areGraphsVisible && (
        <BarGraphTimelineContainer>
          <Fragment>
            {metrics.map(metric => (
              <BarGraphTimeline
                onClick={retrieveDbReport}
                color={color}
                dbKey={url}
                key={metric}
                data={urlLHRData}
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
