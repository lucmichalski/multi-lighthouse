import React from 'react'

const RadioGroup = ({ groupName, onChange, identifiers }) => {
  return identifiers.map(({ value, id, checked }) => (
    <div key={id}>
      <input
        type="radio"
        id={id}
        name={groupName}
        value={value}
        checked={checked}
        onChange={() => onChange()}
      />
      <label htmlFor={id}>{value}</label>
    </div>
  ))
}

export default RadioGroup
