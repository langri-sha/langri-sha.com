import React from 'react'
import classNames from 'classnames'

import {iconify} from '../lib/str'
import styles from './styles'

export const Link = ({name, href}) => (
  <a className={styles.link} href={href}>
    <span className={styles[iconify(name)]} />
  </a>
)

export const Header = () => (
  <header>
    <h1 className={styles.title}>Langri-Sha</h1>
    <nav className={styles.nav}>
      {[
        ['Stack Overflow', 'https://stackoverflow.com/users/story/44041'],
        ['Keybase', 'https://github.com/langri-sha'],
        ['GitHub', 'https://github.com/langri-sha'],
      ].map(([name, href]) => (
        <Link key={name} name={name} href={href} />
      ))}
    </nav>
  </header>
)
