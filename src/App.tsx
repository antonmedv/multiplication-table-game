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
import { randomQuestion, type Question, type Rng } from './question'

interface AppProps {
  rng?: Rng
}

const MAX_DIGITS = 3

export default function App({ rng = Math.random }: AppProps) {
  const [question, setQuestion] = useState<Question>(() => randomQuestion(rng))
  const [typed, setTyped] = useState('')
  const [submitted, setSubmitted] = useState<number | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  const { a, b, answer } = question
  const answered = submitted !== null
  const correct = submitted === answer

  useEffect(() => {
    if (answered) nextRef.current?.focus()
    else inputRef.current?.focus()
  }, [answered])

  function submit(value: string) {
    if (value === '' || answered) return
    const n = Number(value)
    setSubmitted(n)
    setScore((s) => ({ correct: s.correct + (n === answer ? 1 : 0), total: s.total + 1 }))
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
    setQuestion((q) => randomQuestion(rng, q))
    setTyped('')
    setSubmitted(null)
  }

  return (
    <main className="game">
      <header className="score" aria-label="score">
        {score.correct} / {score.total}
      </header>

      <section className="card">
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

        {answered && (
          <>
            <p className={correct ? 'verdict verdict-correct' : 'verdict verdict-wrong'}>
              {correct ? 'Correct!' : `Not quite. It's ${answer}`}
            </p>
            <ArrayBox a={a} b={b} />
            <button ref={nextRef} className="next" type="button" onClick={next}>
              Next ↵
            </button>
          </>
        )}
      </section>

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
