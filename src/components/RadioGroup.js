import React from 'react'

const RadioGroup = ({
  groupName,
  onChange,
  identifiers,
  styles: RadioGroup,
}) => {
  return identifiers.map(({ value, id, checked, onClick }) => (
    <RadioGroup key={id}>
      <label htmlFor={id}>{value}</label>
      <input
        type="radio"
        id={id}
        name={groupName}
        value={value}
        checked={checked}
        onChange={() => onChange(id, onClick)}
      />
    </RadioGroup>
  ))
}

export default RadioGroup
