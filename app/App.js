import React, { useState, useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { random } from 'lodash'
import useInterval from '@use-it/interval'
import api from './api'
import useDisappearingState from './useDisappearingState'
import config from './config'
import constants from '../src/constants'

import shootingStarLeft from './images/shooting-star-left.svg'
import shootingStarRight from './images/shooting-star-right.svg'
import tent from './images/tent.svg'
import trees from './images/trees.svg'
import fireGlow from './images/fire-glow.svg'
import fire from './images/fire.svg'
import charactersSvg from '!svg-inline-loader!./images/characters.svg'
import fireEmbersSvg from '!svg-inline-loader!./images/fire-embers.svg'
import logos from './images/logos.svg'
import architectureDiagram from './images/architecture-diagram.svg'

import flagpole from './images/flagpole.svg'
import flagHeroku from './images/flag-heroku.svg'
import flagOregon from './images/flag-oregon.svg'
import flagVirginia from './images/flag-virginia.svg'
import flagUS from './images/flag-us.svg'
import flagIreland from './images/flag-ireland.svg'
import flagJapan from './images/flag-japan.svg'
import flagAustralia from './images/flag-australia.svg'
import flagGermany from './images/flag-germany.svg'

// The initial step is 0 which hides everything
const INITIAL_STEP = 0
const STEP_COUNT = 10

// In auto mode the initial step is 1 so something is always on the screen
const INITIAL_AUTO_STEP = 1
const STEP_COUNT_AUTO = 9
const INITIAL_AUTO = false

const BG_COUNT = 3

const App = ({ ws }) => {
  const [background, setBackground] = useState(random(1, BG_COUNT))
  const [
    submissions,
    { add: addSubmission, removeAll: removeAllSubmissions }
  ] = useDisappearingState(
    [],
    config.characters.hideAfter,
    config.characters.max
  )
  const [characters, setCharacters] = useState(null)
  const [step, setStep] = useState(INITIAL_STEP)
  const [auto, setAuto] = useState(INITIAL_AUTO)
  const [status, setStatus] = useState()

  // Hot keys to change steps and modes
  useHotkeys(
    config.keys.prev,
    () => !auto && setStep((prev) => Math.max(INITIAL_STEP, prev - 1)),
    [auto]
  )
  useHotkeys(
    config.keys.next,
    () =>
      // Add 1 to step count to allow everything to be hidden at the end
      !auto && setStep((prev) => Math.min(STEP_COUNT + 1, prev + 1)),
    [auto]
  )
  useHotkeys(
    config.keys.reset,
    () => setStep(auto ? INITIAL_AUTO_STEP : INITIAL_STEP),
    [auto]
  )
  useHotkeys(config.keys.autoToggle, () => setAuto((prev) => !prev))
  useHotkeys(config.keys.clear, () => removeAllSubmissions())

  useEffect(() => {
    api('/characters')
      .then((r) => r.json())
      .then(setCharacters)
  }, [])

  useEffect(() => {
    ws.onmessage = (e) => {
      const { type, data } = JSON.parse(e.data)
      if (type === constants.CHARACTER_CHANGE) {
        setCharacters((prev) => ({ ...prev, [data.name]: data.visible }))
      } else if (type === constants.SUBMISSION) {
        addSubmission([data.user.id, data.character])
      } else if (type === constants.BACKGROUND_CHANGE) {
        setBackground((prev) => (prev === BG_COUNT ? 1 : prev + 1))
      } else if (type === constants.STATUS_UPDATE) {
        setStatus(data.type)
      }
    }
    return () => ws.close()
  }, [ws])

  useInterval(
    () =>
      // When auto advancing, go from the last step to the first auto step
      setStep((prev) =>
        prev === STEP_COUNT_AUTO ? INITIAL_AUTO_STEP : prev + 1
      ),
    auto ? config.auto.interval : null
  )

  // When auto mode is changed, reset to the first step for the new mode
  useEffect(() => setStep(auto ? INITIAL_AUTO_STEP : INITIAL_STEP), [auto])

  useEffect(() => {
    // TODO: this was for the behind the scenes indicators
    // https://github.com/andyet/pure-heroku-demo/issues/16
  }, [status])

  useEffect(() => {
    if (!characters) return
    const nodes = Object.keys(characters).map((c) => document.getElementById(c))
    nodes.forEach(
      (node) => (node.style.display = characters[node.id] ? 'block' : 'none')
    )
    return () => nodes.forEach((node) => (node.style.display = 'block'))
  }, [characters])

  useEffect(() => {
    const className = `background-${background}`
    document.body.classList.add(className)
    return () => document.body.classList.remove(className)
  }, [background])

  useEffect(() => {
    const stepNodes = [...document.querySelectorAll('[data-step]')]

    stepNodes.forEach((node) => {
      const hideOrShow = node.getAttribute('data-step-action') || 'show'
      const takeAction = node
        .getAttribute('data-step')
        .split(',')
        .map((v) => Number(v))
        .includes(step)

      if (takeAction) {
        node.style.display = hideOrShow === 'show' ? 'block' : 'none'
      } else {
        node.style.display = hideOrShow === 'show' ? 'none' : 'block'
      }
    })

    return () =>
      [...document.querySelectorAll('[data-step]')].forEach((node) => {
        const hideOrShow = node.getAttribute('data-step-action') || 'show'
        node.style.display = hideOrShow === 'show' ? 'none' : 'block'
      })
  }, [step])

  return (
    <>
      <img src={shootingStarLeft} id="shooting-star-left" />
      <img src={shootingStarRight} id="shooting-star-right" />
      <div id="submissions">
        {submissions.map(([k, v]) => (
          <img key={k} src={v} />
        ))}
      </div>
      {auto && (
        <h1 className="auto-title" data-step="3" data-step-action="hide">
          What is Heroku?
        </h1>
      )}
      <div data-step={auto ? 9 : 10} id="architecture-diagram">
        <div>
          <img src={architectureDiagram} />
        </div>
      </div>
      <div id="regional-flags">
        <img src={flagpole} id="flagpole" />
        <img className="flag" src={flagHeroku} id="flag-heroku" />
        <img className="flag" src={flagOregon} id="flag-oregon" />
        <img className="flag" src={flagVirginia} id="flag-virginia" />
        <img className="flag" src={flagUS} id="flag-us" />
        <img className="flag" src={flagIreland} id="flag-ireland" />
        <img className="flag" src={flagJapan} id="flag-japan" />
        <img className="flag" src={flagAustralia} id="flag-australia" />
        <img className="flag" src={flagGermany} id="flag-germany" />
      </div>
      <img src={tent} id="tent" />
      <img src={trees} id="trees" />
      {characters && (
        <div id="characters">
          <span
            id="characters-svg"
            dangerouslySetInnerHTML={{ __html: charactersSvg }}
          />
          <div id="talk-sequence">
            <div className="talk-bubble char-1" data-step="1">
              What is Heroku?
            </div>
            <div className="talk-bubble char-2" data-step="2">
              Heroku helps programmers using Node.js, Python, Java and many
              other programming languages build anything they want and make it
              available to any internet user in minutes instead of hours or
              days.
            </div>
            <div className="talk-bubble char-3" data-step="4">
              But how would I use it with Sales Cloud or Service Cloud or
              Marketing Cloud?
            </div>
            <div className="talk-bubble char-4" data-step="5">
              Good question! Data integration is the key here. There’s so much
              of your business’s useful data in those clouds that could also be
              used for your customer-facing website or your mobile app.
            </div>
            <div className="talk-bubble char-4" data-step="6">
              Or used across these three together! Heroku makes it easy to use
              that data in apps built with all those programming languages Appy
              mentioned before.
            </div>
            <div className="talk-bubble char-2" data-step="7">
              In fact, we’re in a web app hosted on Heroku right now!
            </div>
            <div className="talk-bubble char-4" data-step={auto ? 8 : 9}>
              Why don’t we deploy an app now to show what it’s like to use
              Heroku as a developer? Maybe you want to create a mobile web app
              for a special promotion that allows your customers to share
              something they love about your company.
            </div>
          </div>
        </div>
      )}
      <img src={fireGlow} id="fire-glow" />
      <img src={fire} id="fire" />
      <div
        id="fire-embers"
        dangerouslySetInnerHTML={{ __html: fireEmbersSvg }}
      />
      <img src={logos} id="logos" data-step="3" />
      <a
        href={config.herokuUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden-link heroku"
      />
      <a
        href={config.githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden-link github"
      />
    </>
  )
}

export default App
