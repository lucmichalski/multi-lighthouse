import React, { Fragment } from 'react'
import {
  FlexibleXYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  VerticalBarSeries,
  DiscreteColorLegend,
} from 'react-vis'
import { Graph } from './BarGraphStyles'
import './BarGraph.css'

const BarGraph = ({ data, metrics }) => {
  const colors = ['#448aff', '#ffde03', `#6200ee`, `#03dac5`, '#e30425']
  const legendItems = data.map(({ finalUrl, categories }) => (
    <span key={finalUrl}>
      <span>{finalUrl}</span> 
      {' '}
      <span> | </span>
      <span>Performance Score</span>
      <span>{` ${categories.performance.score.toString().slice(2)}`}</span>
    </span>
  ))
  return (
    <Fragment>
      <DiscreteColorLegend
        style={{ width: '100%' }}
        colors={colors}
        items={legendItems}
      />
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
    </Fragment>
  )
}

export default BarGraph
