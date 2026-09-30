import { describe, expect, it } from 'vitest'
import { colorOf, FALLBACK_COLOR, NUMBER_COLORS, NUMBERS } from './colors'

describe('colors', () => {
  it('covers 1 through 10 in order', () => {
    expect(NUMBERS).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('gives every number a distinct colour', () => {
    expect(new Set(Object.values(NUMBER_COLORS)).size).toBe(10)
  })

  it('returns the number colour', () => {
    expect(colorOf(3)).toBe(NUMBER_COLORS[3])
  })

  it('falls back for numbers without a colour', () => {
    expect(colorOf(12)).toBe(FALLBACK_COLOR)
  })
})
