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
  track(eventCategory: string, eventAction: string, eventLabel: string) {
    ga('send', {
      hitType: 'event',
      eventCategory,
      eventAction,
      eventLabel
    })
  }

  render() {
    const { href, category, action, label, children, ...props } = this.props
    const track = this.track.bind(this, category, action, label)

    return (
      <a href={href} onClick={track} {...props}>
        {children}
      </a>
    )
  }
}
