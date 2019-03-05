import React from 'react'
import {
  FlexibleXYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  VerticalBarSeries,
} from 'react-vis'
import { OuterGraph, Title, InnerGraph } from './BarGraphTimelineStyles'
import './BarGraph.css'

const BarGraphTimeline = ({ data, dates, metric }) => (
  <OuterGraph>
    <Title>{metric}</Title>
    <InnerGraph>
      <FlexibleXYPlot xType="ordinal">
        <VerticalGridLines />
        <HorizontalGridLines />
        <XAxis />
        <YAxis title="ms" />
        {data.map((item, idx) => {
          return (
            <VerticalBarSeries
              barWidth={0.1}
              color="#448aff"
              key={dates[idx]}
              data={[
                {
                  x: dates[idx],
                  y: item.audits[metric].rawValue,
                },
              ]}
            />
          )
        })}
      </FlexibleXYPlot>
    </InnerGraph>
  </OuterGraph>
)

export default BarGraphTimeline
