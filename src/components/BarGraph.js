import React, { Fragment } from 'react'
import {
  FlexibleXYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  VerticalBarSeries,
} from 'react-vis'
import { Graph } from './BarGraphStyles'
import './BarGraph.css'

const BarGraph = ({ data, metrics, colors }) => (
  <Graph>
    <FlexibleXYPlot xType="ordinal">
      <VerticalGridLines />
      <HorizontalGridLines />
      <XAxis />
      <YAxis title="ms" />
      {data.map((item, idx) => {
        return (
          <VerticalBarSeries
            barWidth={0.7}
            color={colors[idx]}
            key={item.finalUrl}
            data={metrics.map(metric => {
              return {
                x: item.audits[metric].title,
                y: item.audits[metric].rawValue,
              }
            })}
          />
        )
      })}
    </FlexibleXYPlot>
  </Graph>
)

export default BarGraph
