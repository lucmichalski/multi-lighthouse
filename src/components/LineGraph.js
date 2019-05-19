import React from 'react'
import { FlexibleXYPlot, LineSeries } from 'react-vis'

function LineGraph({ data }) {
  return (
    <FlexibleXYPlot xType="ordinal">
      <LineSeries
        style={{ strokeLinejoin: 'round', transform: 'none' }}
        className="first-series"
        data={data}
      />
    </FlexibleXYPlot>
  )
}

export default LineGraph
