import React from 'react'
import { ErrorMessage } from './ErrorStyles'

const Error = ({ errorUrl, errorMessage, showError }) =>
  showError && (
    <ErrorMessage>
      <div>{errorUrl}</div>
      <div>{errorMessage}</div>
    </ErrorMessage>
  )

export default Error
