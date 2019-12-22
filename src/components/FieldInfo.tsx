import React, { useState } from 'react'
import { InfoI, Info, Stat, Title } from './FieldInfoStyles'

const FieldInfo = ({ current }) => {
  const [isVisible, toggleVisible] = useState(false)

  return isVisible ? (
    <Info>
      <Title>Field Data from CrUX Report</Title>
      <InfoI onClick={() => toggleVisible(!isVisible)}>X</InfoI>
      <div>
        {current.items.map(item => (
          <Stat key={item.category}>
            <div>{item.category}</div>
            <div>{item.distribution}</div>
          </Stat>
        ))}
      </div>
    </Info>
  ) : (
    <InfoI type="button" onClick={() => toggleVisible(!isVisible)}>
      i
    </InfoI>
  )
}

export default FieldInfo
