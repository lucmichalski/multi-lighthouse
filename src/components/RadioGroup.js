import React from 'react'

const RadioGroup = ({
  groupName,
  onChange,
  identifiers,
  styles: RadioGroup,
}) => {
  return identifiers.map(({ value, id, checked }) => (
    <RadioGroup key={id}>
      <input
        type="radio"
        id={id}
        name={groupName}
        value={value}
        checked={checked}
        onChange={() => onChange()}
      />
      <label htmlFor={id}>{value}</label>
    </RadioGroup>
  ))
}

export default RadioGroup
