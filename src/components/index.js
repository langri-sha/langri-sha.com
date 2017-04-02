// @flow
import Header from 'components/header'
import Scene from 'components/scene'
import Drone from 'components/drone'
import {Analytics} from 'lib/analytics'
import {IconDefinitions} from 'lib/icon'

export default () => (
  <div>
    <IconDefinitions />
    <Header />
    <Scene />
    <Drone />
    <Analytics id={'UA-86127521-1'} />
  </div>
)
