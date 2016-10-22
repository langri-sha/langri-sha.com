import React from 'react'

import {iconify} from '../lib/str'
import styles from './styles'

export default () => (
  <header className={styles.header}>
    <h1 className={styles.title}>Langri-Sha</h1>
    <nav className={styles.nav}>
      {[
        [
          'Stack Overflow', 'https://stackoverflow.com/users/44041/filip-dupanovi%C4%87?tab=profile',
          'StackOverflow profile #SOreadytohelp 💓'
        ],
        [
          'Keybase', 'https://keybase.io/langrisha',
          'Identity details on Keybase.io'
        ],
        [
          'GitHub', 'https://github.com/langri-sha',
          'GitHub profile'
        ],
        [
          'Docker', 'https://hub.docker.com/u/langrisha/',
          'Docker Hub profile'
        ]
      ].map(([name, href, title]) => (
        <Link key={name} name={name} href={href} title={title} />
      ))}
    </nav>
  </header>
)

const Link = ({name, href, title}) => (
  <a className={styles.link} href={href} title={title} target={'_blank'}>
    <span className={styles[iconify(name)]} />
  </a>
)
