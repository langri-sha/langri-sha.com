import React from 'react'

import {iconify} from '../lib/str'
import styles from './styles'

export const Link = ({name, href}) => (
  <a title={name} className={styles.link} onClick={() => window.open(href)}>
    <span className={styles[iconify(name)]} />
  </a>
)

export const Header = () => (
  <header className={styles.header}>
    <h1 className={styles.title}>Langri-Sha</h1>
    <nav className={styles.nav}>
      {[
        ['Stack Overflow', 'https://stackoverflow.com/users/44041/filip-dupanovi%C4%87?tab=profile'],
        ['Keybase', 'https://keybase.io/langrisha'],
        ['GitHub', 'https://github.com/langri-sha']
      ].map(([name, href]) => (
        <Link key={name} name={name} href={href} />
      ))}
    </nav>
  </header>
)
