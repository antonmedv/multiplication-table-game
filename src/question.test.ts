import { describe, expect, it } from 'vitest'
import { makeQuestion, MAX_FACTOR, MIN_FACTOR, randomQuestion, type Rng } from './question'

function sequence(values: number[]): Rng {
  let i = 0
  return () => values[i++ % values.length]!
}

describe('makeQuestion', () => {
  it('computes the product', () => {
    expect(makeQuestion(3, 4)).toEqual({ a: 3, b: 4, answer: 12 })
  })
})

describe('randomQuestion', () => {
  it('keeps factors within 2..10', () => {
    for (let i = 0; i < 500; i++) {
      const { a, b } = randomQuestion()
      expect(a).toBeGreaterThanOrEqual(MIN_FACTOR)
      expect(a).toBeLessThanOrEqual(MAX_FACTOR)
      expect(b).toBeGreaterThanOrEqual(MIN_FACTOR)
      expect(b).toBeLessThanOrEqual(MAX_FACTOR)
    }
  })

  it('maps rng edges to 2 and 10', () => {
    expect(randomQuestion(sequence([0, 0.999]))).toEqual({ a: 2, b: 10, answer: 20 })
  })

  it('does not repeat the previous pair', () => {
    const previous = makeQuestion(3, 4)
    const q = randomQuestion(sequence([0.15, 0.25, 0.5, 0.5]), previous)
    expect(q).toEqual({ a: 6, b: 6, answer: 36 })
  })

  it('gives up avoiding a repeat when the rng is stuck', () => {
    const previous = makeQuestion(6, 6)
    expect(randomQuestion(() => 0.5, previous)).toEqual(previous)
  })
})
