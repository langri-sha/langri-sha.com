'use client'

import { Global } from '@emotion/react'
import styled from '@emotion/styled'
import * as React from 'react'

import { CHANT, type Syllable, Voice } from '@/components/invocation'
import { colors, global } from '@/styles'

/* The editor carries a label per syllable — the phoneme it pronounces — for
 * the timeline and the copied-back comments. Labels ride along as an extra
 * property; the synthesiser ignores them. */
type EditableSyllable = Syllable & { label: string }

interface EditableBreath {
  pause: number
  pitch: number
  inhale?: number
  syllables: EditableSyllable[]
}

const LABELS = [
  ['s', 'n', 'oo', 'v', 'i', 's', 'u'],
  ['p', 'o', 'r', 'u', 'k', 'e'],
  ['eez', 'z'],
  ['du', 'bi', 'n', 'eee'],
]

const seed = (): EditableBreath[] =>
  CHANT.map((breath, i) => ({
    pause: breath.pause,
    pitch: breath.pitch,
    inhale: breath.inhale,
    syllables: breath.syllables.map((syllable, j) => ({
      ...structuredClone(syllable),
      label: LABELS[i]?.[j] ?? `${i + 1}.${j + 1}`,
    })),
  }))

const fmt = (value: number) => String(Number(value.toFixed(3)))

/* The edited table, printed in the source file's own shape so it can be
 * pasted straight over the CHANT constant in invocation.ts. */
const serialize = (breaths: EditableBreath[]) => {
  const lines = ['const CHANT: Breath[] = [']
  for (const breath of breaths) {
    lines.push('  {')
    lines.push(`    // "${breath.syllables.map((s) => s.label).join('-')}"`)
    lines.push(`    pause: ${fmt(breath.pause)},`)
    lines.push(`    pitch: ${fmt(breath.pitch)},`)
    if (breath.inhale) {
      lines.push(`    inhale: ${fmt(breath.inhale)},`)
    }
    lines.push('    syllables: [')
    for (const s of breath.syllables) {
      const parts = [`dur: ${fmt(s.dur)}`, `f: [${s.f.map(fmt).join(', ')}]`]
      if (s.to) {
        parts.push(`to: [${s.to.map(fmt).join(', ')}]`)
      }
      parts.push(`voice: ${fmt(s.voice)}`)
      if (s.fric) {
        parts.push(`fric: [${fmt(s.fric[0])}, ${fmt(s.fric[1])}]`)
      }
      if (s.gap != null) {
        parts.push(`gap: ${fmt(s.gap)}`)
      }
      if (s.dive != null) {
        parts.push(`dive: ${fmt(s.dive)}`)
      }
      lines.push(`      { ${parts.join(', ')} }, // ${s.label}`)
    }
    lines.push('    ],')
    lines.push('  },')
  }
  lines.push(']')
  return lines.join('\n')
}

export const ChantTuner: React.FC = () => {
  const [breaths, setBreaths] = React.useState(seed)
  const [collapsed, setCollapsed] = React.useState(() => CHANT.map(() => false))
  const [playing, setPlaying] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const audio = React.useRef<{ context: AudioContext; input: GainNode }>(null)
  const voice = React.useRef<Voice>(null)
  const stopTimer = React.useRef<ReturnType<typeof setTimeout>>(null)

  const update = (recipe: (draft: EditableBreath[]) => void) => {
    setBreaths((current) => {
      const next = structuredClone(current)
      recipe(next)
      return next
    })
  }

  const playChant = (chant: EditableBreath[]) => {
    if (!audio.current) {
      // The same output chain the site runs: unity into a brick-wall
      // limiter, so the tuner is heard at production loudness.
      const context = new AudioContext()
      const input = context.createGain()
      input.gain.value = 1
      const limiter = context.createDynamicsCompressor()
      limiter.threshold.value = -1
      limiter.knee.value = 0
      limiter.ratio.value = 20
      limiter.attack.value = 0.003
      limiter.release.value = 0.25
      input.connect(limiter)
      limiter.connect(context.destination)
      audio.current = { context, input }
    }

    const { context, input } = audio.current
    context.resume()

    voice.current?.dispose()
    const next = new Voice(context, input, chant)
    voice.current = next
    next.start(context.currentTime + 0.05)

    setPlaying(true)
    if (stopTimer.current) {
      clearTimeout(stopTimer.current)
    }
    stopTimer.current = setTimeout(
      () => setPlaying(false),
      (next.voiceEnd + 3) * 1000,
    )
  }

  const play = () => playChant(structuredClone(breaths))

  // Solo one breath, dropping its opening pause so it speaks at once —
  // unless the breath inhales, since the draw lives in that pause.
  const playBreath = (index: number) => {
    const solo = structuredClone(breaths[index])
    if (!solo.inhale) {
      solo.pause = 0
    }
    playChant([solo])
  }

  const stop = () => {
    voice.current?.dispose()
    voice.current = null
    if (stopTimer.current) {
      clearTimeout(stopTimer.current)
    }
    setPlaying(false)
  }

  const copy = async () => {
    const source = serialize(breaths)
    try {
      await navigator.clipboard.writeText(source)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = source
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  React.useEffect(
    () => () => {
      voice.current?.dispose()
      if (stopTimer.current) {
        clearTimeout(stopTimer.current)
      }
      audio.current?.context.close()
    },
    [],
  )

  // Each syllable's onset, in seconds after the voice enters — the timeline
  // the synthesiser will walk.
  const starts = React.useMemo(() => {
    const rows: number[][] = []
    let at = 0
    for (const breath of breaths) {
      at += breath.pause
      const row: number[] = []
      for (const syllable of breath.syllables) {
        at += syllable.gap ?? 0
        row.push(at)
        at += syllable.dur
      }
      rows.push(row)
    }
    return rows
  }, [breaths])

  return (
    <Root>
      <Global styles={global} />

      <Header>
        <Title>Chant</Title>
        <Subtitle>
          »Snovi su poruke iz dubine« — the voice&apos;s syllable table, as
          lines and knobs. Tune, play, then copy the table back into
          invocation.ts.
        </Subtitle>
      </Header>

      <Console>
        <Toolbar>
          <Button onClick={play}>{playing ? '↻ replay' : '▶ play'}</Button>
          <Button disabled={!playing} onClick={stop}>
            ■ stop
          </Button>
          <Button onClick={() => setBreaths(seed())}>reset</Button>
          <Button onClick={copy}>{copied ? 'copied ✓' : 'copy ts'}</Button>
        </Toolbar>

        <TimelineCard>
          <Timeline breaths={breaths} />
          <Legend>
            block height = voice · dashed = sweep · red cap = noise · red wedge
            = inhale · grey sliver = stop gap · lower line = pitch
          </Legend>
        </TimelineCard>
      </Console>

      {breaths.map((breath, i) => (
        <Card key={i}>
          <BreathHead>
            <RowButton
              aria-expanded={!collapsed[i]}
              title={collapsed[i] ? 'Expand breath' : 'Collapse breath'}
              onClick={() =>
                setCollapsed((current) =>
                  current.map((value, k) => (k === i ? !value : value)),
                )
              }
            >
              {collapsed[i] ? '▸' : '▾'}
            </RowButton>
            <BreathName>breath {i + 1}</BreathName>
            <RowButton
              title="Play only this breath"
              onClick={() => playBreath(i)}
            >
              ▶ solo
            </RowButton>
            <Field
              label="pause"
              max={1.5}
              min={0}
              step={0.05}
              value={breath.pause}
              onChange={(value) =>
                update((draft) => {
                  draft[i].pause = value
                })
              }
            />
            <Field
              label="pitch"
              max={90}
              min={40}
              step={0.5}
              value={breath.pitch}
              onChange={(value) =>
                update((draft) => {
                  draft[i].pitch = value
                })
              }
            />
            <Field
              label="inhale"
              max={1}
              min={0}
              step={0.05}
              value={breath.inhale ?? 0}
              onChange={(value) =>
                update((draft) => {
                  draft[i].inhale = value > 0 ? value : undefined
                })
              }
            />
          </BreathHead>

          {collapsed[i]
            ? null
            : breath.syllables.map((syllable, j) => (
                <SyllableEditor
                  key={j}
                  canRemove={breath.syllables.length > 1}
                  start={starts[i][j]}
                  syllable={syllable}
                  onChange={(recipe) =>
                    update((draft) => recipe(draft[i].syllables[j]))
                  }
                  onDuplicate={() =>
                    update((draft) => {
                      draft[i].syllables.splice(
                        j + 1,
                        0,
                        structuredClone(draft[i].syllables[j]),
                      )
                    })
                  }
                  onRemove={() =>
                    update((draft) => {
                      draft[i].syllables.splice(j, 1)
                    })
                  }
                />
              ))}
        </Card>
      ))}

      <Card>
        <details>
          <summary>
            <SummaryLabel>the table, as it would be pasted</SummaryLabel>
          </summary>
          <Source>{serialize(breaths)}</Source>
        </details>
      </Card>
    </Root>
  )
}

const PX_PER_SECOND = 110

const Timeline: React.FC<{ breaths: EditableBreath[] }> = ({ breaths }) => {
  const top = 14
  const baseline = 90
  const pitchY = (hz: number) =>
    112 + (70 - Math.min(70, Math.max(30, hz))) * 0.9

  const shapes: React.ReactNode[] = []
  let x = 12

  for (const [i, breath] of breaths.entries()) {
    if (breath.inhale && breath.pause > 0.15) {
      const width = breath.pause * PX_PER_SECOND
      shapes.push(
        <polygon
          key={`inhale-${i}`}
          fill={colors.red}
          opacity={0.15 + 0.35 * breath.inhale}
          points={`${x},${baseline} ${x + width},${baseline} ${x + width},${
            baseline - 8 - 34 * breath.inhale
          }`}
        />,
      )
    }
    x += breath.pause * PX_PER_SECOND
    const entry = x
    let pitchPath = ''
    let pitch = breath.pitch

    for (const [j, syllable] of breath.syllables.entries()) {
      if (syllable.gap) {
        const width = syllable.gap * PX_PER_SECOND
        shapes.push(
          <rect
            key={`gap-${i}-${j}`}
            fill={colors.text}
            height={baseline - top}
            opacity={0.12}
            width={width}
            x={x}
            y={top}
          />,
        )
        x += width
      }

      const width = syllable.dur * PX_PER_SECOND
      const height = Math.min(baseline - top, syllable.voice * 56)
      shapes.push(
        <rect
          key={`syllable-${i}-${j}`}
          fill={colors.blue}
          fillOpacity={syllable.to ? 0.55 : 0.85}
          height={height}
          stroke={syllable.to ? colors.text : 'none'}
          strokeDasharray={syllable.to ? '3 2' : undefined}
          width={width}
          x={x}
          y={baseline - height}
        />,
      )
      if (syllable.fric) {
        shapes.push(
          <rect
            key={`fric-${i}-${j}`}
            fill={colors.red}
            height={4}
            width={width}
            x={x}
            y={baseline - height - 6}
          />,
        )
      }
      shapes.push(
        <text
          key={`label-${i}-${j}`}
          fill={colors.text}
          fontSize={9}
          textAnchor="middle"
          x={x + width / 2}
          y={baseline + 13}
        >
          {syllable.label}
        </text>,
      )

      pitchPath += `${pitchPath ? 'L' : 'M'}${x},${pitchY(pitch)} `
      if (syllable.dive != null) {
        pitchPath += `L${x + width},${pitchY(syllable.dive)} `
        pitch = syllable.dive
      }
      x += width
    }

    pitchPath += `L${x},${pitchY(pitch)}`
    shapes.push(
      <path
        key={`pitch-${i}`}
        d={pitchPath}
        fill="none"
        stroke={colors.text}
        strokeLinecap="round"
        strokeWidth={2}
      />,
      <text
        key={`pitch-label-${i}`}
        fill={colors.text}
        fontSize={8}
        opacity={0.7}
        x={entry}
        y={pitchY(breath.pitch) - 5}
      >
        {fmt(breath.pitch)}Hz
      </text>,
    )
  }

  return (
    <Strip>
      <svg height={156} width={x + 16}>
        {shapes}
      </svg>
    </Strip>
  )
}

interface SyllableEditorProps {
  canRemove: boolean
  start: number
  syllable: EditableSyllable
  onChange: (recipe: (draft: EditableSyllable) => void) => void
  onDuplicate: () => void
  onRemove: () => void
}

const SyllableEditor: React.FC<SyllableEditorProps> = ({
  canRemove,
  start,
  syllable,
  onChange,
  onDuplicate,
  onRemove,
}) => (
  <SyllableCard>
    <SyllableHead>
      <LabelInput
        aria-label="Syllable label"
        value={syllable.label}
        onChange={(event) => {
          const label = event.target.value
          onChange((draft) => {
            draft.label = label
          })
        }}
      />
      <Onset>@ {fmt(start)}s</Onset>
      <RowButton title="Duplicate syllable" onClick={onDuplicate}>
        ⧉
      </RowButton>
      <RowButton
        disabled={!canRemove}
        title="Remove syllable"
        onClick={onRemove}
      >
        ×
      </RowButton>
    </SyllableHead>

    <Knobs>
      <Field
        label="dur"
        max={2}
        min={0.02}
        step={0.01}
        value={syllable.dur}
        onChange={(value) =>
          onChange((draft) => {
            draft.dur = value
          })
        }
      />
      <Field
        label="voice"
        max={1.3}
        min={0}
        step={0.01}
        value={syllable.voice}
        onChange={(value) =>
          onChange((draft) => {
            draft.voice = value
          })
        }
      />
      {syllable.f.map((frequency, k) => (
        <Field
          key={k}
          label={`f${k + 1}`}
          max={[900, 2400, 3000][k]}
          min={[200, 400, 1400][k]}
          step={5}
          value={frequency}
          onChange={(value) =>
            onChange((draft) => {
              draft.f[k] = value
            })
          }
        />
      ))}
    </Knobs>

    <Options>
      <Option
        enabled={Boolean(syllable.to)}
        name="sweep"
        onToggle={(enabled) =>
          onChange((draft) => {
            draft.to = enabled ? [...draft.f] : undefined
          })
        }
      >
        {syllable.to?.map((frequency, k) => (
          <Field
            key={k}
            label={`→ f${k + 1}`}
            max={[900, 2400, 3000][k]}
            min={[200, 400, 1400][k]}
            step={5}
            value={frequency}
            onChange={(value) =>
              onChange((draft) => {
                if (draft.to) {
                  draft.to[k] = value
                }
              })
            }
          />
        ))}
      </Option>

      <Option
        enabled={Boolean(syllable.fric)}
        name="noise"
        onToggle={(enabled) =>
          onChange((draft) => {
            draft.fric = enabled ? [5200, 0.07] : undefined
          })
        }
      >
        {syllable.fric && (
          <React.Fragment>
            <Field
              label="centre"
              max={8000}
              min={300}
              step={25}
              value={syllable.fric[0]}
              onChange={(value) =>
                onChange((draft) => {
                  if (draft.fric) {
                    draft.fric[0] = value
                  }
                })
              }
            />
            <Field
              label="level"
              max={0.2}
              min={0}
              step={0.005}
              value={syllable.fric[1]}
              onChange={(value) =>
                onChange((draft) => {
                  if (draft.fric) {
                    draft.fric[1] = value
                  }
                })
              }
            />
          </React.Fragment>
        )}
      </Option>

      <Option
        enabled={syllable.gap != null}
        name="stop gap"
        onToggle={(enabled) =>
          onChange((draft) => {
            draft.gap = enabled ? 0.05 : undefined
          })
        }
      >
        {syllable.gap != null && (
          <Field
            label="gap"
            max={0.5}
            min={0.01}
            step={0.01}
            value={syllable.gap}
            onChange={(value) =>
              onChange((draft) => {
                draft.gap = value
              })
            }
          />
        )}
      </Option>

      <Option
        enabled={syllable.dive != null}
        name="dive"
        onToggle={(enabled) =>
          onChange((draft) => {
            draft.dive = enabled ? 48 : undefined
          })
        }
      >
        {syllable.dive != null && (
          <Field
            label="to Hz"
            max={70}
            min={30}
            step={0.5}
            value={syllable.dive}
            onChange={(value) =>
              onChange((draft) => {
                draft.dive = value
              })
            }
          />
        )}
      </Option>
    </Options>
  </SyllableCard>
)

interface FieldProps {
  label: string
  max: number
  min: number
  step: number
  value: number
  onChange: (value: number) => void
}

const Field: React.FC<FieldProps> = ({
  label,
  max,
  min,
  step,
  value,
  onChange,
}) => {
  const handle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value)
    if (Number.isFinite(next)) {
      onChange(next)
    }
  }

  return (
    <FieldRoot>
      <FieldName>{label}</FieldName>
      <Slider
        max={max}
        min={min}
        step={step}
        type="range"
        value={value}
        onChange={handle}
      />
      <NumberInput
        max={max}
        min={min}
        step={step}
        type="number"
        value={value}
        onChange={handle}
      />
    </FieldRoot>
  )
}

interface OptionProps {
  children?: React.ReactNode
  enabled: boolean
  name: string
  onToggle: (enabled: boolean) => void
}

const Option: React.FC<OptionProps> = ({
  children,
  enabled,
  name,
  onToggle,
}) => (
  <OptionRoot data-enabled={enabled}>
    <OptionToggle>
      <input
        checked={enabled}
        type="checkbox"
        onChange={(event) => onToggle(event.target.checked)}
      />
      {name}
    </OptionToggle>
    {enabled ? children : null}
  </OptionRoot>
)

const mono = `ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace`

const Root = styled.main`
  min-height: 100vh;
  box-sizing: border-box;
  padding: 3.2rem 2rem 9.6rem;
  background: ${colors.background};
`

const Header = styled.header`
  max-width: 104rem;
  margin: 0 auto 1.6rem;
`

const Title = styled.h1`
  margin: 0;
  font-size: 3.2rem;
`

const Subtitle = styled.p`
  max-width: 64rem;
  margin: 0.4rem 0 0;
  font-size: 1.5rem;
  opacity: 0.8;
`

/* The console — transport and timeline — rides along while the breath
 * cards below are tuned. */
const Console = styled.div`
  position: sticky;
  z-index: 2;
  top: 0;
  max-width: 104rem;
  margin: 0 auto;
  background: ${colors.background};
  padding-bottom: 1.6rem;
`

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  padding: 1.2rem 0;
  gap: 0.8rem;
`

const Button = styled.button`
  padding: 0.6rem 1.2rem;
  border: 2px solid ${colors.text};
  background: ${colors.white};
  box-shadow: 3px 3px 0 ${colors.text};
  color: ${colors.text};
  cursor: pointer;
  font-family: ${mono};
  font-size: 1.3rem;

  &:active {
    box-shadow: 0 0 0 ${colors.text};
    transform: translate(3px, 3px);
  }

  &:disabled {
    box-shadow: none;
    cursor: default;
    opacity: 0.4;
    transform: none;
  }
`

const Card = styled.section`
  max-width: 104rem;
  box-sizing: border-box;
  margin: 0 auto 2rem;
  padding: 1.6rem;
  border: 2px solid ${colors.text};
  background: ${colors.white};
  box-shadow: 5px 5px 0 ${colors.text};
`

const TimelineCard = styled(Card)`
  margin-bottom: 0;
`

const Strip = styled.div`
  overflow-x: auto;
`

const Legend = styled.p`
  margin: 0.8rem 0 0;
  font-family: ${mono};
  font-size: 1.05rem;
  opacity: 0.65;
`

const BreathHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 1.2rem;
  gap: 0.8rem 2.4rem;
`

const BreathName = styled.h2`
  margin: 0;
  font-size: 1.8rem;
`

const SyllableCard = styled.div`
  margin-bottom: 1rem;
  padding: 1rem 1.2rem;
  border: 1px solid ${colors.text};
  background: ${colors.background};
`

const SyllableHead = styled.div`
  display: flex;
  align-items: baseline;
  margin-bottom: 0.6rem;
  gap: 0.8rem;
`

const LabelInput = styled.input`
  width: 6ch;
  border: none;
  border-bottom: 2px solid ${colors.text};
  background: transparent;
  color: ${colors.text};
  font-family: ${mono};
  font-size: 1.5rem;
  font-weight: 700;
`

/* Pushes the row buttons after it to the right edge of a syllable head. */
const Onset = styled.span`
  margin-right: auto;
  font-family: ${mono};
  font-size: 1.1rem;
  opacity: 0.6;
`

const RowButton = styled.button`
  padding: 0.1rem 0.6rem;
  border: 1px solid ${colors.text};
  background: transparent;
  color: ${colors.text};
  cursor: pointer;
  font-family: ${mono};
  font-size: 1.2rem;
  line-height: 1.4;

  &:disabled {
    cursor: default;
    opacity: 0.35;
  }
`

const Knobs = styled.div`
  display: grid;
  gap: 0.4rem 1.6rem;
  grid-template-columns: repeat(auto-fit, minmax(21rem, 1fr));
`

const Options = styled.div`
  display: grid;
  margin-top: 0.8rem;
  gap: 0.6rem 1.6rem;
  grid-template-columns: repeat(auto-fit, minmax(21rem, 1fr));
`

const OptionRoot = styled.div`
  padding-left: 0.8rem;
  border-left: 3px solid transparent;

  &[data-enabled='true'] {
    border-left-color: ${colors.blue};
  }
`

const OptionToggle = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-family: ${mono};
  font-size: 1.2rem;
  gap: 0.5rem;
`

const FieldRoot = styled.label`
  display: flex;
  align-items: center;
  font-family: ${mono};
  font-size: 1.15rem;
  gap: 0.6rem;
`

const FieldName = styled.span`
  flex: none;
  width: 5rem;
  opacity: 0.75;
`

const Slider = styled.input`
  min-width: 8rem;
  flex: 1;
  margin: 0;
  accent-color: ${colors.blue};
`

const NumberInput = styled.input`
  width: 7.5ch;
  border: 1px solid ${colors.text};
  background: ${colors.white};
  color: ${colors.text};
  font-family: ${mono};
  font-size: 1.15rem;
`

const SummaryLabel = styled.span`
  cursor: pointer;
  font-family: ${mono};
  font-size: 1.2rem;
`

const Source = styled.pre`
  overflow: auto;
  margin: 1rem 0 0;
  font-family: ${mono};
  font-size: 1.15rem;
  line-height: 1.5;
`
