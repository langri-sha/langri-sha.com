import * as React from 'react'

interface Props {
  action: string
  category: string
  children: React.ReactNode
  href: string
  label: string
}

export class Link extends React.PureComponent<Props> {
  track(eventCategory: string, eventAction: string, eventLabel: string): void {
    ga('send', {
      hitType: 'event',
      eventCategory,
      eventAction,
      eventLabel,
    })
  }

  render() {
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
