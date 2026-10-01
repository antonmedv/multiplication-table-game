import { useState } from 'react'
import { colorOf } from './colors'
import { accuracy, accuracyColor, type Mastery } from './mastery'
import { MAX_FACTOR, MIN_FACTOR } from './question'

interface HeatmapProps {
  mastery: Mastery
  onReset: () => void
}

const FACTORS = Array.from({ length: MAX_FACTOR - MIN_FACTOR + 1 }, (_, i) => MIN_FACTOR + i)

/** Every fact as a coloured table cell: red → green by recent accuracy, dim when never asked. */
export function Heatmap({ mastery, onReset }: HeatmapProps) {
  const [confirming, setConfirming] = useState(false)
  return (
    <section className="heatmap" aria-label="progress">
      <table>
        <thead>
          <tr>
            <th aria-label="times" />
            {FACTORS.map((b) => (
              <th key={b} scope="col" style={{ color: colorOf(b) }}>
                {b}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FACTORS.map((a) => (
            <tr key={a}>
              <th scope="row" style={{ color: colorOf(a) }}>
                {a}
              </th>
              {FACTORS.map((b) => {
                const value = accuracy(mastery, a, b)
                return (
                  <td
                    key={b}
                    className={value === null ? 'fact fact-unseen' : 'fact'}
                    style={value === null ? undefined : { background: accuracyColor(value) }}
                    title={`${a} × ${b}: ${describe(mastery, a, b)}`}
                  >
                    {a * b}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {confirming ? (
        <button type="button" className="reset reset-confirm" onClick={onReset}>
          Really reset?
        </button>
      ) : (
        <button type="button" className="reset" onClick={() => setConfirming(true)}>
          Reset progress
        </button>
      )}
    </section>
  )
}

function describe(mastery: Mastery, a: number, b: number): string {
  const history = mastery[`${a}x${b}`] ?? []
  if (history.length === 0) return 'not asked yet'
  return `${history.filter(Boolean).length}/${history.length} right`
}
