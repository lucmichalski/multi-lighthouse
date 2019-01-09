import React from 'react'
import {
  XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  VerticalBarSeries,
  DiscreteColorLegend,
} from 'react-vis'

const BarGraph = ({ data, metrics }) => {
  const legendItems = data.map(({ finalUrl }) => finalUrl)
  return (
    <div>
      <DiscreteColorLegend height={200} width={300} items={legendItems} />
      <XYPlot height={400} width={1200} xType="ordinal">
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
      </XYPlot>
    </div>
  )
}

export default BarGraph
