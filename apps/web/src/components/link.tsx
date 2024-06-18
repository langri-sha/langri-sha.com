import * as React from 'react'

export interface LinkProps {
  children: React.ReactElement
  eventAction: string
  eventCategory: string
  eventLabel: string
  href: string
  target: string
  title: string
}

export const Link: React.FC<LinkProps> = ({
  eventAction,
  eventCategory,
  eventLabel,
  children,
  ...props
}) => {
  // Use the 'useCallback' hook for optimized event handler
  const handleClick: React.MouseEventHandler<HTMLAnchorElement> =
    React.useCallback(
      (event) => {
        event.preventDefault()

        gtag('event', eventAction, {
          event_category: eventCategory,
          event_label: eventLabel,

          event_callback: () => {
            window.location.href = props.href
          },
          event_timeout: 2000,
        })
      },
      [eventCategory, eventAction, eventLabel],
    )

  return (
    <a {...props} onClick={handleClick}>
      {children}
    </a>
  )
}
