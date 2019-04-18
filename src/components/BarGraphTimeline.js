import React, { useState } from 'react'

import {
  FlexibleXYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  VerticalBarSeries,
  Hint,
} from 'react-vis'
import { OuterGraph, Title, InnerGraph } from './BarGraphTimelineStyles'
import './BarGraph.css'

const BarGraphTimeline = ({ data, metric, color, onClick, dbKey }) => {
  const defaultState = {
    isTooltip: false,
    tooltipValue: { x: null, y: null },
  }
  const [tooltip, setTooltip] = useState(defaultState)
  const { isTooltip, tooltipValue } = tooltip
  const isOverall = metric === 'perf'

  const handleMouseOver = value => {
    setTooltip({ isTooltip: true, tooltipValue: value })
  }
  const handleMouseOut = () => {
    setTooltip(defaultState)
  }

  const handleClick = datapoint => {
    onClick(dbKey, datapoint.x)
  }

  return (
    <OuterGraph>
      <style
        dangerouslySetInnerHTML={{
          __html: `.rv-xy-plot__axis--horizontal {
                    display: none;
                  }`,
        }}
      />
      <Title>{metric}</Title>
      <InnerGraph>
        <FlexibleXYPlot xType="ordinal">
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis />
          <YAxis title={isOverall ? 'points' : 'ms'} />
          <VerticalBarSeries
            className="bar"
            onValueClick={handleClick}
            onValueMouseOver={handleMouseOver}
            onValueMouseOut={handleMouseOut}
            barWidth={0.8}
            color={color}
            data={[...data]
              .sort((a, b) => new Date(a.ft) - new Date(b.ft))
              .map(item => ({
                x: item.ft,
                y: item[metric] && item[metric].val ? item[metric].val : 0,
              }))}
          />
          {isTooltip && <Hint value={tooltipValue} />}
        </FlexibleXYPlot>
      </InnerGraph>
    </OuterGraph>
  )
}

export default BarGraphTimeline
