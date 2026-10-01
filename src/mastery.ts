/** Per fact ("3x4"), the last few outcomes, oldest first. */
export type Mastery = Readonly<Record<string, readonly boolean[]>>

export const HISTORY_LENGTH = 5
export const STORAGE_KEY = 'multiplication-mastery'

export type MasteryStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function factKey(a: number, b: number): string {
  return `${a}x${b}`
}

export function recordOutcome(mastery: Mastery, a: number, b: number, correct: boolean): Mastery {
  const key = factKey(a, b)
  const history = [...(mastery[key] ?? []), correct].slice(-HISTORY_LENGTH)
  return { ...mastery, [key]: history }
}

/** Share of recent answers that were right, or null when never asked. */
export function accuracy(mastery: Mastery, a: number, b: number): number | null {
  const history = mastery[factKey(a, b)]
  if (!history || history.length === 0) return null
  return history.filter(Boolean).length / history.length
}

/** Red (0) through yellow to green (1). */
export function accuracyColor(value: number): string {
  return `hsl(${Math.round(value * 120)} 75% 45%)`
}

export function loadMastery(storage: MasteryStorage): Mastery {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    return isMastery(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export function saveMastery(mastery: Mastery, storage: MasteryStorage): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(mastery))
  } catch {
    // Storage may be unavailable (private mode, quota). Progress is then session-only.
  }
}

function isMastery(value: unknown): value is Mastery {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(
      (history) => Array.isArray(history) && history.every((x) => typeof x === 'boolean'),
    )
  )
}

export function clearMastery(storage: MasteryStorage): void {
  try {
    storage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}
