import React from 'react'
import classNames from 'classnames'

import styles from './styles'
import {iconify} from './lib/str'

export const Link = ({name, href}) => (
  <a href={href}>
    <span className={styles[iconify(name)]} />
  </a>
)

export const Main = () => (
  <div>
    <h1 className={styles.title}>Langri-Sha</h1>
    {[
      ['GitHub', 'https://github.com/langri-sha'],
      ['Stack Overflow', 'https://github.com/langri-sha'],
      ['Keybase', 'https://github.com/langri-sha'],
      ['Twitter', 'https://github.com/langri-sha']
    ].map(([name, href]) => (
      <Link key={name} name={name} href={href} />
    ))}
  </div>
)
