import * as React from 'react'

import {
  Archive,
  Deck,
  Heading,
  Item,
  Lead,
  Main,
  Meta,
  More,
  Prose,
  Stream,
  Summary,
  Tags,
  Threshold,
  Title,
} from './elements'
import { type Entry, entries } from './entries'

const dates = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

const href = (entry: Entry) => `/log/${entry.slug}`

export const Logbook: React.FC = () => {
  const [latest, ...earlier] = entries

  return (
    <Main aria-labelledby="logbook">
      <Threshold>
        <Heading id="logbook">Logbook</Heading>
        <Deck>
          Notes from building this site and the machinery around it, kept
          irregularly and mostly after dark.
        </Deck>
      </Threshold>
      <Stream reversed>
        {latest ? (
          <Item>
            <article>
              <EntryMeta entry={latest} />
              <Lead>
                <a href={href(latest)}>{latest.title}</a>
              </Lead>
              <Prose>
                {latest.body?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </Prose>
              <More href={href(latest)}>Continue reading →</More>
            </article>
          </Item>
        ) : null}
        {earlier.map((entry) => (
          <Item key={entry.slug}>
            <article>
              <EntryMeta entry={entry} />
              <Title>
                <a href={href(entry)}>{entry.title}</a>
              </Title>
              <Summary>{entry.summary}</Summary>
              <Tags>{entry.tags.join(' · ')}</Tags>
            </article>
          </Item>
        ))}
      </Stream>
      <Archive>
        Older entries are in <a href="/log">the full log</a>.
      </Archive>
    </Main>
  )
}

const EntryMeta: React.FC<{ entry: Entry }> = ({ entry }) => (
  <Meta>
    No. {entry.number} ·{' '}
    <time dateTime={entry.date}>{dates.format(new Date(entry.date))}</time> ·{' '}
    {entry.minutes} min read
  </Meta>
)
