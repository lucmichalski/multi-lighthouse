import React from 'react'

import './Guage.css'

function ScoreGuage(props) {
  const { width, value } = props
  return (
    <div className="progress-container" style={{ width }}>
      <div className="progress-bar">
        <span
          className="progress-value"
          style={{ width: `${value.toString()}%` }}
        />
      </div>
      <div>
        <span className="value">{value.toString()}</span>

        <span className="hundred">/100</span>
      </div>
    </div>
  )
}
ScoreGuage.defaultProps = {
  width: '100%',
}

export default ScoreGuage
