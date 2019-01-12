import React from 'react'
import {
  FlexibleXYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  VerticalBarSeries,
  DiscreteColorLegend,
} from 'react-vis'

import './BarGraph.css'

const BarGraph = ({ data, metrics }) => {
  const legendItems = data.map(({ finalUrl }) => finalUrl)
  return (
    <div className="graph">
      <DiscreteColorLegend height={200} width={300} items={legendItems} />
      <FlexibleXYPlot xType="ordinal">
        <VerticalGridLines />
        <HorizontalGridLines />
        <XAxis title="metric" />
        <YAxis title="ms" />
        {data.map(item => {
          return (
            <VerticalBarSeries
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
    </div>
  )
}

export default BarGraph
