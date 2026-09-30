import type { CSSProperties } from 'react'
import { colorOf } from './colors'

interface ArrayBoxProps {
  a: number
  b: number
}

/** The picture of a × b: `a` rows, each one a block of `b` cells in b's colour. */
export function ArrayBox({ a, b }: ArrayBoxProps) {
  const colorA = colorOf(a)
  const colorB = colorOf(b)
  return (
    <figure className="array-box" aria-label={`${a} rows of ${b}`}>
      <div className="array-label array-label-top" style={{ color: colorB }}>
        {b}
      </div>
      <div className="array-label array-label-side" style={{ color: colorA }}>
        {a}
      </div>
      <div className="array-rows">
        {Array.from({ length: a }, (_, row) => (
          <div key={row} className="array-row" style={{ '--c': colorB } as CSSProperties}>
            {Array.from({ length: b }, (__, col) => (
              <span
                key={col}
                className="array-cell"
                data-testid="cell"
                style={{ '--i': row * b + col } as CSSProperties}
              />
            ))}
          </div>
        ))}
      </div>
      <figcaption className="array-caption">
        <span style={{ color: colorA }}>{a}</span> × <span style={{ color: colorB }}>{b}</span> ={' '}
        {a * b}
      </figcaption>
    </figure>
  )
}
