import { describe, expect, it } from 'vitest'
import { makeQuestion } from './question'
import { clearRetry, pickNext, scheduleRetry, type Retry } from './scheduler'

const q34 = makeQuestion(3, 4)
const q66 = makeQuestion(6, 6)
const rng = () => 0.5 // random fallback → 6 × 6

describe('scheduleRetry', () => {
  it('queues the fact 3 to 5 questions later', () => {
    expect(scheduleRetry([], q34, 7, () => 0)).toEqual([{ question: q34, dueAt: 10 }])
    expect(scheduleRetry([], q34, 7, () => 0.999)).toEqual([{ question: q34, dueAt: 12 }])
  })

  it('replaces an existing entry for the same fact', () => {
    const queued: Retry[] = [{ question: q34, dueAt: 5 }]
    expect(scheduleRetry(queued, q34, 9, () => 0)).toEqual([{ question: q34, dueAt: 12 }])
  })
})

describe('clearRetry', () => {
  it('drops only the matching fact', () => {
    const queued: Retry[] = [
      { question: q34, dueAt: 5 },
      { question: q66, dueAt: 6 },
    ]
    expect(clearRetry(queued, q34)).toEqual([{ question: q66, dueAt: 6 }])
  })
})

describe('pickNext', () => {
  it('returns a due retry and removes it from the queue', () => {
    const queued: Retry[] = [{ question: q34, dueAt: 3 }]
    expect(pickNext(queued, 3, q66, rng)).toEqual({ question: q34, retries: [], isRetry: true })
  })

  it('leaves a retry that is not due yet', () => {
    const queued: Retry[] = [{ question: q34, dueAt: 4 }]
    expect(pickNext(queued, 3, makeQuestion(2, 2), rng)).toEqual({
      question: q66,
      retries: queued,
      isRetry: false,
    })
  })

  it('never asks the same pair twice in a row, even for a due retry', () => {
    const queued: Retry[] = [{ question: q34, dueAt: 3 }]
    const pick = pickNext(queued, 5, q34, rng)
    expect(pick.question).toEqual(q66)
    expect(pick.retries).toEqual(queued)
    expect(pick.isRetry).toBe(false)
  })
})
