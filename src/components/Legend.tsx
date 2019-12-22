import React from 'react'
import { DiscreteColorLegend } from 'react-vis'

const Legend = ({ colors, legendItems }) => {
  return (
    <DiscreteColorLegend
      style={{ width: '100%' }}
      colors={colors}
      items={legendItems}
    />
  )
}

export default Legend
