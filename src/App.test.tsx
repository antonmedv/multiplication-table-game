import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { STORAGE_KEY, type MasteryStorage } from './mastery'
import type { Rng } from './question'

/** Rng values → factors: 0.15 → 3, 0.25 → 4, 0.5 → 6, 0.6 → 7. */
function sequence(values: number[]): Rng {
  let i = 0
  return () => values[i++ % values.length]!
}

function memoryStorage(): MasteryStorage & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  }
}

/** First question 3 × 4, then 6 × 6, then 7 × 7. */
function renderGame(values = [0.15, 0.25, 0.5, 0.5, 0.6, 0.6]) {
  const user = userEvent.setup()
  const storage = memoryStorage()
  render(<App rng={sequence(values)} storage={storage} />)
  return { user, storage }
}

const question = () => screen.getByLabelText('question')
const input = () => screen.getByRole('textbox', { name: 'answer' })

describe('answering', () => {
  it('shows a question with a focused answer box', () => {
    renderGame()
    expect(question()).toHaveTextContent('3 × 4 =')
    expect(input()).toHaveFocus()
  })

  it('auto-submits once the digit count matches and shows the array box', async () => {
    const { user } = renderGame()
    await user.keyboard('12')
    expect(screen.getByText('Correct!')).toBeInTheDocument()
    expect(screen.getByRole('figure', { name: '3 rows of 4' })).toBeInTheDocument()
    expect(screen.getAllByTestId('cell')).toHaveLength(12)
    expect(screen.getByLabelText('score')).toHaveTextContent('1 / 1')
  })

  it('submits a short answer with Enter and reveals the right one', async () => {
    const { user } = renderGame()
    await user.keyboard('9{Enter}')
    expect(screen.getByText("Not quite. It's 12")).toBeInTheDocument()
    expect(screen.getAllByTestId('cell')).toHaveLength(12)
    expect(screen.getByLabelText('score')).toHaveTextContent('0 / 1')
  })

  it('ignores non-digits', async () => {
    const { user } = renderGame()
    await user.keyboard('a1')
    expect(input()).toHaveValue('1')
  })

  it('moves to a new question on Next', async () => {
    const { user } = renderGame()
    await user.keyboard('12')
    expect(screen.getByRole('button', { name: /next/i })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(question()).toHaveTextContent('6 × 6 =')
    expect(screen.queryByRole('figure')).not.toBeInTheDocument()
    expect(input()).toHaveValue('')
    expect(input()).toHaveFocus()
  })
})

describe('flip', () => {
  it('swaps rows and columns with F and resets on Next', async () => {
    const { user } = renderGame()
    await user.keyboard('12')
    await user.keyboard('f')
    expect(screen.getByRole('figure', { name: '4 rows of 3' })).toHaveTextContent('4 × 3 = 12')
    await user.click(screen.getByRole('button', { name: 'Flip (F)' }))
    expect(screen.getByRole('figure', { name: '3 rows of 4' })).toBeInTheDocument()
    await user.keyboard('f')
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.keyboard('36')
    expect(screen.getByRole('figure', { name: '6 rows of 6' })).toBeInTheDocument()
  })

  it('does nothing while a question is open', async () => {
    const { user } = renderGame()
    await user.keyboard('f12')
    expect(screen.getByRole('figure', { name: '3 rows of 4' })).toBeInTheDocument()
  })
})

describe('streak', () => {
  it('counts correct answers in a row and resets on a miss', async () => {
    const { user } = renderGame()
    expect(screen.getByLabelText('streak')).toHaveTextContent('')
    await user.keyboard('12{Enter}')
    expect(screen.getByLabelText('streak')).toHaveTextContent('🔥 1')
    await user.keyboard('36{Enter}')
    expect(screen.getByLabelText('streak')).toHaveTextContent('🔥 2')
    await user.keyboard('1{Enter}')
    expect(screen.getByLabelText('streak')).toHaveTextContent('')
  })

  it('bursts every fifth correct answer', async () => {
    // Every question 6 × 6 would repeat; alternate 6 × 6 and 7 × 7 instead.
    const { user } = renderGame([0.5, 0.5, 0.6, 0.6])
    await user.keyboard('36{Enter}49{Enter}36{Enter}49{Enter}')
    expect(document.querySelector('.burst')).toBeNull()
    await user.keyboard('36')
    expect(document.querySelector('.burst')).not.toBeNull()
  })
})

describe('retry queue', () => {
  it('asks a missed fact again 3 questions later, marked as a retry', async () => {
    // rng: 3 × 4 (0.15, 0.25) → miss → gap rng 0 → due at question 3;
    // then 6 × 6 (0.5, 0.5), 7 × 7 (0.6, 0.6), then the retry.
    const { user } = renderGame([0.15, 0.25, 0, 0.5, 0.5, 0.6, 0.6])
    await user.keyboard('9{Enter}{Enter}')
    expect(question()).toHaveTextContent('6 × 6 =')
    expect(screen.queryByText('Again!')).not.toBeInTheDocument()
    await user.keyboard('36{Enter}')
    expect(question()).toHaveTextContent('7 × 7 =')
    await user.keyboard('49{Enter}')
    expect(question()).toHaveTextContent('3 × 4 =')
    expect(screen.getByText('Again!')).toBeInTheDocument()
    await user.keyboard('12')
    expect(screen.getByText('Correct!')).toBeInTheDocument()
  })
})

describe('progress map', () => {
  it('persists outcomes and shows them in the heatmap', async () => {
    const { user, storage } = renderGame()
    await user.keyboard('12')
    expect(JSON.parse(storage.data.get(STORAGE_KEY)!)).toEqual({ '3x4': [true] })
    await user.keyboard('m')
    expect(screen.getByTitle('3 × 4: 1/1 right')).toBeInTheDocument()
    expect(screen.queryByLabelText('question')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Back (M)' }))
    expect(question()).toHaveTextContent('3 × 4 =')
  })

  it('loads saved progress and can reset it', async () => {
    const storage = memoryStorage()
    storage.setItem(STORAGE_KEY, JSON.stringify({ '2x2': [false, true] }))
    const user = userEvent.setup()
    render(<App rng={sequence([0.15, 0.25])} storage={storage} />)
    await user.click(screen.getByRole('button', { name: 'Progress (M)' }))
    expect(screen.getByTitle('2 × 2: 1/2 right')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reset progress' }))
    await user.click(screen.getByRole('button', { name: 'Really reset?' }))
    expect(storage.data.has(STORAGE_KEY)).toBe(false)
    expect(question()).toBeInTheDocument()
  })
})
