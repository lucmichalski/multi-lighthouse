import React from 'react'
import { FlexibleXYPlot, LineSeries } from 'react-vis'

function LineGraph(props) {
  return (
    <FlexibleXYPlot xType="ordinal">
      <LineSeries
        style={{ strokeLinejoin: 'round', transform: 'none' }}
        className="first-series"
        data={[
          { x: 0, y: 33 },
          { x: 1, y: 41 },
          { x: 2, y: 22 },
          { x: 3, y: 12 },
          { x: 4, y: 22 },
          { x: 5, y: 45 },
          { x: 6, y: 37 },
          { x: 7, y: 57 },
          { x: 8, y: 97 },
          { x: 9, y: 100 },
          { x: 10, y: 33 },
          { x: 11, y: 41 },
          { x: 12, y: 22 },
          { x: 13, y: 12 },
          { x: 14, y: 22 },
          { x: 15, y: 45 },
          { x: 16, y: 37 },
          { x: 17, y: 57 },
          { x: 18, y: 97 },
          { x: 19, y: 100 },
        ]}
      />
    </FlexibleXYPlot>
  )
}

export default LineGraph
