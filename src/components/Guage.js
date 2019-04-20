import React, { Component } from 'react'
import Gauge from 'svg-gauge'
import './Guage.css'

const defaultOptions = {
  animDuration: 1,
  showValue: true,
  max: 100, //this needs to be set for every metric
  // Put any other defaults you want. e.g. dialStartAngle, dialEndAngle, radius, etc.
}

class ScoreGuage extends Component {
  componentDidMount() {
    this.renderGauge(this.props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { props } = this
    if (props.value !== nextProps.value) {
      this.renderGauge(nextProps)
    }
    return false
  }
  renderGauge(props) {
    const gaugeOptions = Object.assign({}, defaultOptions, props)
    if (!this.gauge) {
      this.gauge = Gauge(this.gaugeEl, gaugeOptions)
    }
    this.gauge.setValueAnimated(props.value, gaugeOptions.animDuration)
  }

  render() {
    return <div className="gauge-container" ref={el => (this.gaugeEl = el)} />
  }
}

export default ScoreGuage
