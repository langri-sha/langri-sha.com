// @flow
import * as React from 'react'

type Props = {
  action: string,
  category: string,
  children: React.Node,
  href: string,
  label: string,
  ...
}

export default class Link extends React.PureComponent<Props> {
  track: (
    eventCategory: string,
    eventAction: string,
    eventLabel: string
  ) => void

  track(eventCategory: string, eventAction: string, eventLabel: string) {
    ga('send', {
      hitType: 'event',
      eventCategory,
      eventAction,
      eventLabel,
    })
  }

  render(): React.Element<'a'> {
    const { href, category, action, label, children, ...props } = this.props

    return (
      <a
        {...props}
        href={href}
        onClick={() => {
          this.track(category, action, label)
        }}
      >
        {children}
      </a>
    )
  }
}
