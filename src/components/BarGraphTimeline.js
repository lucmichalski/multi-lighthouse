import React from 'react'
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

const val = (value, event) => console.log(value, event)

const BarGraphTimeline = ({ data, dates, metric }) => (
  <OuterGraph>
    <Title>{metric}</Title>
    <InnerGraph>
      <FlexibleXYPlot xType="ordinal">
        <VerticalGridLines />
        <HorizontalGridLines />
        <XAxis />
        <YAxis title="ms" />
        <VerticalBarSeries
          className="bar"
          onValueMouseOver={val}
          barWidth={0.1}
          color="#448aff"
          data={data.map((item, idx) => ({
            x: dates[idx],
            y: item.audits[metric].rawValue,
          }))}
        />
        <Hint value={{ x: dates[0], y: data[0].audits[metric].rawValue }} />
      </FlexibleXYPlot>
    </InnerGraph>
  </OuterGraph>
)

export default BarGraphTimeline
