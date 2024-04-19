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
    React.useCallback(() => {
      ga('send', {
        hitType: 'event',
        eventCategory,
        eventAction,
        eventLabel,
      })
    }, [eventCategory, eventAction, eventLabel])

  return (
    <a {...props} onClick={handleClick}>
      {children}
    </a>
  )
}
