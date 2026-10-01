import { randomQuestion, samePair, type Question, type Rng } from './question'

/** A fact answered wrong, due to come back as question number `dueAt` (0-based). */
export interface Retry {
  question: Question
  dueAt: number
}

export const RETRY_MIN_GAP = 3
export const RETRY_MAX_GAP = 5

/** Queue `question` (asked as number `askedIndex`) to return 3–5 questions later. Replaces any older entry. */
export function scheduleRetry(
  retries: readonly Retry[],
  question: Question,
  askedIndex: number,
  rng: Rng,
): Retry[] {
  const gap = RETRY_MIN_GAP + Math.floor(rng() * (RETRY_MAX_GAP - RETRY_MIN_GAP + 1))
  return [...clearRetry(retries, question), { question, dueAt: askedIndex + gap }]
}

export function clearRetry(retries: readonly Retry[], question: Question): Retry[] {
  return retries.filter((r) => !samePair(r.question, question))
}

export interface Pick {
  question: Question
  retries: Retry[]
  isRetry: boolean
}

/** Question number `index`: the first due retry (never the same pair as `previous`), else random. */
export function pickNext(
  retries: readonly Retry[],
  index: number,
  previous: Question,
  rng: Rng,
): Pick {
  const due = retries.findIndex((r) => r.dueAt <= index && !samePair(r.question, previous))
  if (due !== -1) {
    return { question: retries[due]!.question, retries: retries.toSpliced(due, 1), isRetry: true }
  }
  return { question: randomQuestion(rng, previous), retries: [...retries], isRetry: false }
}
