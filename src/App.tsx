import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import { ArrayBox } from './ArrayBox'
import { colorOf, NUMBERS } from './colors'
import { Heatmap } from './Heatmap'
import {
  clearMastery,
  loadMastery,
  recordOutcome,
  saveMastery,
  type Mastery,
  type MasteryStorage,
} from './mastery'
import { randomQuestion, type Question, type Rng } from './question'
import { clearRetry, pickNext, scheduleRetry, type Retry } from './scheduler'

interface AppProps {
  rng?: Rng
  storage?: MasteryStorage
}

const MAX_DIGITS = 3
const BURST_EVERY = 5
const MAX_GLOW_STREAK = 10

export default function App({ rng = Math.random, storage = localStorage }: AppProps) {
  const [question, setQuestion] = useState<Question>(() => randomQuestion(rng))
  const [isRetry, setIsRetry] = useState(false)
  const [typed, setTyped] = useState('')
  const [submitted, setSubmitted] = useState<number | null>(null)
  const [flipped, setFlipped] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [streak, setStreak] = useState(0)
  const [retries, setRetries] = useState<Retry[]>([])
  const [mastery, setMastery] = useState<Mastery>(() => loadMastery(storage))
  const [showMap, setShowMap] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  const { a, b, answer } = question
  const answered = submitted !== null
  const correct = submitted === answer
  const burst = answered && correct && streak > 0 && streak % BURST_EVERY === 0

  useEffect(() => {
    if (showMap) return
    if (answered) nextRef.current?.focus()
    else inputRef.current?.focus()
  }, [answered, showMap])

  useEffect(() => {
    if (Object.keys(mastery).length === 0) clearMastery(storage)
    else saveMastery(mastery, storage)
  }, [mastery, storage])

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === 'm' || e.key === 'M') setShowMap((v) => !v)
      if ((e.key === 'f' || e.key === 'F') && answered && !showMap) setFlipped((v) => !v)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [answered, showMap])

  function submit(value: string) {
    if (value === '' || answered) return
    const n = Number(value)
    const right = n === answer
    setSubmitted(n)
    setScore((s) => ({ correct: s.correct + (right ? 1 : 0), total: s.total + 1 }))
    setStreak((s) => (right ? s + 1 : 0))
    setMastery((m) => recordOutcome(m, a, b, right))
    setRetries((r) =>
      right ? clearRetry(r, question) : scheduleRetry(r, question, score.total, rng),
    )
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, '').slice(0, MAX_DIGITS)
    setTyped(value)
    if (value.length === String(answer).length) submit(value)
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    // Stop the browser (and user-event) from turning this Enter into a click on the Next button,
    // which receives focus during this same key event.
    e.preventDefault()
    submit(typed)
  }

  function next() {
    const pick = pickNext(retries, score.total, question, rng)
    setQuestion(pick.question)
    setRetries(pick.retries)
    setIsRetry(pick.isRetry)
    setTyped('')
    setSubmitted(null)
    setFlipped(false)
  }

  function resetProgress() {
    setMastery({})
    setShowMap(false)
  }

  const glow = Math.min(streak, MAX_GLOW_STREAK) / MAX_GLOW_STREAK

  return (
    <main className="game">
      <header className="topbar">
        <span className="score" aria-label="score">
          {score.correct} / {score.total}
        </span>
        <span className="streak" aria-label="streak">
          {streak > 0 ? `🔥 ${streak}` : ''}
        </span>
        <button type="button" className="map-toggle" onClick={() => setShowMap((v) => !v)}>
          {showMap ? 'Back (M)' : 'Progress (M)'}
        </button>
      </header>

      {showMap ? (
        <Heatmap mastery={mastery} onReset={resetProgress} />
      ) : (
        <section className="card" style={{ '--glow': glow } as CSSProperties}>
          {burst && <span className="burst" key={streak} aria-hidden="true" />}
          {isRetry && !answered && <span className="again">Again!</span>}
          <p className="question" aria-label="question">
            <span className="factor" style={{ color: colorOf(a) }}>
              {a}
            </span>{' '}
            <span className="op">×</span>{' '}
            <span className="factor" style={{ color: colorOf(b) }}>
              {b}
            </span>{' '}
            <span className="op">=</span>{' '}
            {answered ? (
              <span className={correct ? 'answer answer-correct' : 'answer answer-wrong'}>
                {submitted}
              </span>
            ) : (
              <input
                ref={inputRef}
                className="answer-input"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                aria-label="answer"
                maxLength={MAX_DIGITS}
                value={typed}
                onChange={onChange}
                onKeyDown={onKeyDown}
              />
            )}
          </p>

          {/* Slots below keep their size while a question is open so nothing shifts on submit. */}
          <p className={correct ? 'verdict verdict-correct' : 'verdict verdict-wrong'}>
            {answered && (correct ? 'Correct!' : `Not quite. It's ${answer}`)}
          </p>
          {answered ? (
            <ArrayBox key={String(flipped)} a={flipped ? b : a} b={flipped ? a : b} />
          ) : (
            <div className="array-box" aria-hidden="true" />
          )}
          <div className="actions">
            {answered && (
              <>
                <button type="button" className="flip" onClick={() => setFlipped((v) => !v)}>
                  Flip (F)
                </button>
                <button ref={nextRef} className="next" type="button" onClick={next}>
                  Next ↵
                </button>
              </>
            )}
          </div>
        </section>
      )}

      <footer className="legend" aria-label="number colours">
        {NUMBERS.map((n) => (
          <span key={n} className="chip" style={{ '--c': colorOf(n) } as CSSProperties}>
            {n}
          </span>
        ))}
      </footer>
    </main>
  )
}
