import React, { useState } from 'react'
import Guage from './Guage'

import {
  ShowcaseContainer,
  Showcase,
  Categories,
  Button,
  Average,
  H3,
} from './MainStyles'

const ShowcaseSection = ({ category, showcaseData, getShowcaseData }) => {
  const [isOpen, toggleOpen] = useState(false)
  const getShowcaseDataAndOpen = () => {
    getShowcaseData(category)
    toggleOpen(true)
  }

  return (
    <Categories key={category}>
      <Button
        background="#fff"
        color="#2c2c2c"
        onClick={
          !showcaseData[category] && !isOpen
            ? getShowcaseDataAndOpen
            : () => toggleOpen(!isOpen)
        }
      >
        {category}
      </Button>
      {showcaseData[category] && isOpen && (
        <ShowcaseContainer>
          {showcaseData[category].map(
            ({ URLAverageScore, decodedURL }, index) => {
              const url = new URL(decodedURL)
              return (
                <Showcase key={decodedURL}>
                  <H3>
                    {`${index + 1}. `}

                    {url.hostname.split('.')[1]}
                  </H3>
                  <Average>
                    <Guage value={URLAverageScore} />
                  </Average>
                </Showcase>
              )
            }
          )}
        </ShowcaseContainer>
      )}
    </Categories>
  )
}

export default ShowcaseSection
