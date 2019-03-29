import React, { Fragment, useState } from 'react'
import base64 from 'base-64'
import BarGraphTimeline from './BarGraphTimeline'
import { GraphH2, BarGraphTimelineContainer, Arrow } from './MainStyles'

export default function URLGraphSection({
  url,
  data,
  index,
  colors,
  metrics,
  onClick,
}) {
  const defaultState = {
    isGraphsVisible: false,
  }
  const [graph, setGraphVisibility] = useState(defaultState)
  const { areGraphsVisible } = graph
  return (
    <Fragment>
      <div
        onClick={() =>
          setGraphVisibility(() => ({
            areGraphsVisible: !areGraphsVisible,
          }))
        }
        style={{ width: '100%' }}
        role="button"
      >
        <GraphH2>
          {base64.decode(url)}
          <Arrow isOpen={areGraphsVisible} />
        </GraphH2>
      </div>

      {areGraphsVisible && (
        <BarGraphTimelineContainer>
          <Fragment>
            <BarGraphTimeline
              onClick={onClick}
              color={colors[index]}
              data={data}
              dbKey={url}
              metric="Overall"
            />
            {metrics.map(metric => (
              <BarGraphTimeline
                onClick={onClick}
                color={colors[index]}
                dbKey={url}
                key={metric}
                data={data}
                metric={metric}
              />
            ))}
          </Fragment>
        </BarGraphTimelineContainer>
      )}
    </Fragment>
  )
}
