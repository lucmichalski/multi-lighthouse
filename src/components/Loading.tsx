import React, { Fragment } from 'react'
import ReactLoading from 'react-loading'
import { LoadingMessage } from './LoadingStyles'

const Loading = ({ loadingMessage, showLoading }) =>
  showLoading && (
    <Fragment>
      <LoadingMessage>{loadingMessage}</LoadingMessage>
      <ReactLoading type="spin" color="#757575" height="20%" width="20%" />
    </Fragment>
  )

export default Loading
