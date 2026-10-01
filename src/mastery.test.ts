import { describe, expect, it } from 'vitest'
import {
  accuracy,
  accuracyColor,
  clearMastery,
  loadMastery,
  recordOutcome,
  saveMastery,
  STORAGE_KEY,
  type MasteryStorage,
} from './mastery'

function memoryStorage(initial: Record<string, string> = {}): MasteryStorage {
  const data = new Map(Object.entries(initial))
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  }
}

describe('recordOutcome / accuracy', () => {
  it('is null for a fact never asked', () => {
    expect(accuracy({}, 3, 4)).toBeNull()
  })

  it('tracks the share of right answers', () => {
    let m = recordOutcome({}, 3, 4, true)
    m = recordOutcome(m, 3, 4, false)
    expect(accuracy(m, 3, 4)).toBe(0.5)
    expect(accuracy(m, 4, 3)).toBeNull()
  })

  it('keeps only the last five outcomes', () => {
    let m = recordOutcome({}, 3, 4, false)
    for (let i = 0; i < 5; i++) m = recordOutcome(m, 3, 4, true)
    expect(accuracy(m, 3, 4)).toBe(1)
  })
})

describe('accuracyColor', () => {
  it('runs red to green', () => {
    expect(accuracyColor(0)).toBe('hsl(0 75% 45%)')
    expect(accuracyColor(1)).toBe('hsl(120 75% 45%)')
  })
})

describe('storage', () => {
  it('round-trips through storage', () => {
    const storage = memoryStorage()
    const m = recordOutcome({}, 3, 4, true)
    saveMastery(m, storage)
    expect(loadMastery(storage)).toEqual({ '3x4': [true] })
    clearMastery(storage)
    expect(loadMastery(storage)).toEqual({})
  })

  it('ignores corrupt or foreign data', () => {
    expect(loadMastery(memoryStorage({ [STORAGE_KEY]: '{not json' }))).toEqual({})
    expect(loadMastery(memoryStorage({ [STORAGE_KEY]: '{"3x4":[1,2]}' }))).toEqual({})
    expect(loadMastery(memoryStorage({ [STORAGE_KEY]: '[]' }))).toEqual({})
  })

  it('survives a throwing storage', () => {
    const broken: MasteryStorage = {
      getItem: () => {
        throw new Error('nope')
      },
      setItem: () => {
        throw new Error('nope')
      },
      removeItem: () => {
        throw new Error('nope')
      },
    }
    expect(loadMastery(broken)).toEqual({})
    expect(() => saveMastery({}, broken)).not.toThrow()
    expect(() => clearMastery(broken)).not.toThrow()
  })
})
