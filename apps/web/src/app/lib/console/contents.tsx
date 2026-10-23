import styled from '@emotion/styled'
import * as React from 'react'

import { colors, media } from '@/styles'

import { sections } from './content'
import { Micro, micro } from './panel'

const entries = Object.values(sections)
const ids = entries.map(({ id }) => id)

export const Contents: React.FC = () => {
  const active = useActiveSection(ids)

  return (
    <Root aria-label="Sections">
      <Heading aria-hidden="true">Index</Heading>
      <Entries>
        {entries.map(({ id, part, label }) => (
          <li key={id}>
            <Entry
              href={`#${id}`}
              aria-current={active === id ? 'true' : undefined}
            >
              <Part>{part.split(' / ')[1]}</Part> {label}
            </Entry>
          </li>
        ))}
      </Entries>
    </Root>
  )
}

const useActiveSection = (candidates: string[]) => {
  const [active, setActive] = React.useState<string | null>(null)

  React.useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const line = window.innerHeight * 0.4
      let current: string | null = null

      for (const id of candidates) {
        const top = document.getElementById(id)?.getBoundingClientRect().top

        if (top !== undefined && top <= line) {
          current = id
        }
      }

      setActive(current)
    }

    const schedule = () => {
      frame ||= requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [candidates])

  return active
}

const Root = styled.nav`
  position: sticky;
  z-index: 1;
  top: 0;
  margin-inline: calc(-1 * var(--gutter));
  padding: 1.2rem var(--gutter);
  border-bottom: 1px solid ${colors.hairline};
  background: rgba(1, 2, 8, 0.82);
  backdrop-filter: blur(8px);

  ${media.wide} {
    top: 4.8rem;
    align-self: start;
    margin: 0;
    padding: 0;
    border: 0;
    background: none;
    backdrop-filter: none;
  }
`

const Heading = styled(Micro)`
  display: none;

  ${media.wide} {
    display: block;
    margin-bottom: 1.6rem;
  }
`

const Entries = styled.ol`
  display: flex;
  gap: 2rem;
  margin: 0;
  padding: 0;
  overflow-x: auto;
  list-style: none;
  scrollbar-width: none;

  ${media.wide} {
    flex-direction: column;
    gap: 0;
    overflow: visible;
    border-left: 1px solid ${colors.hairline};
  }
`

const Entry = styled.a`
  ${micro};
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  color: ${colors.readoutMuted};
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.2s ease;

  &::before {
    flex: none;
    width: 0.6rem;
    height: 0.6rem;
    border: 1px solid currentColor;
    background: ${colors.nightDeep};
    content: '';
    transform: rotate(45deg);
    transition: background-color 0.2s ease;
  }

  &[aria-current] {
    color: ${colors.accent};

    &::before {
      background: currentColor;
    }
  }

  &:focus-visible {
    outline: 2px solid ${colors.accent};
    outline-offset: 0.4rem;
  }

  ${media.hover} {
    &:hover {
      color: ${colors.readout};
    }
  }

  ${media.wide} {
    padding-block: 0.8rem;

    &::before {
      margin-left: calc(-0.3rem - 0.5px);
    }
  }
`

const Part = styled.span`
  color: ${colors.signal};

  &:is([aria-current] > *) {
    color: inherit;
  }
`
