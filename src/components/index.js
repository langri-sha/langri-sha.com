import Header from '../header'
import Scene from '../scene'
import Drone from '../drone'
import Analytics from '../../lib/analytics'

export default () => (
  <div>
    <Header />
    <Scene />
    <Drone />
    <Analytics id={'UA-86127521-1'} />
  </div>
)
