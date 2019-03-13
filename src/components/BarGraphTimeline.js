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

  const handleMouseOver = value => {
    setTooltip({ isTooltip: true, tooltipValue: value })
  }
  const handleMouseOut = () => {
    setTooltip(defaultState)
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
          <YAxis title="ms" />
          <VerticalBarSeries
            className="bar"
            onValueClick={datapoint => onClick(dbKey, datapoint.x)}
            onValueMouseOver={handleMouseOver}
            onValueMouseOut={handleMouseOut}
            barWidth={0.8}
            color={color}
            data={data.map(item => ({
              x: item.fetchTime,
              y: item.audits[metric].rawValue,
            }))}
          />
          {isTooltip && <Hint value={tooltipValue} />}
        </FlexibleXYPlot>
      </InnerGraph>
    </OuterGraph>
  )
}

export default BarGraphTimeline
