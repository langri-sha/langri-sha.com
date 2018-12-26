// @flow
import {Analytics} from 'lib/analytics'
import {IconDefinitions} from 'lib/icon'
import * as React from 'react'
import Drone from 'components/drone'
import Header from 'components/header'
import Scene from 'components/scene'

import styles from '../styles'

export default () => (
  <div className={styles.container}>
    <IconDefinitions />
    <Header />
    <Scene />
    <Drone />
    <Analytics id={'UA-86127521-1'} />
  </div>
)
