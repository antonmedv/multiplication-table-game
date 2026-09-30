import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import type { Rng } from './question'

/** 0.15 → 3, 0.25 → 4, 0.5 → 6: first question 3 × 4, then 6 × 6. */
function sequence(values: number[]): Rng {
  let i = 0
  return () => values[i++ % values.length]!
}

function renderGame() {
  const user = userEvent.setup()
  render(<App rng={sequence([0.15, 0.25, 0.5, 0.5])} />)
  return user
}

describe('App', () => {
  it('shows a question with a focused answer box', () => {
    renderGame()
    expect(screen.getByLabelText('question')).toHaveTextContent('3 × 4 =')
    expect(screen.getByRole('textbox', { name: 'answer' })).toHaveFocus()
  })

  it('auto-submits once the digit count matches and shows the array box', async () => {
    const user = renderGame()
    await user.keyboard('12')
    expect(screen.getByText('Correct!')).toBeInTheDocument()
    expect(screen.getByRole('figure', { name: '3 rows of 4' })).toBeInTheDocument()
    expect(screen.getAllByTestId('cell')).toHaveLength(12)
    expect(screen.getByLabelText('score')).toHaveTextContent('1 / 1')
  })

  it('submits a short answer with Enter and reveals the right one', async () => {
    const user = renderGame()
    await user.keyboard('9{Enter}')
    expect(screen.getByText("Not quite. It's 12")).toBeInTheDocument()
    expect(screen.getAllByTestId('cell')).toHaveLength(12)
    expect(screen.getByLabelText('score')).toHaveTextContent('0 / 1')
  })

  it('ignores non-digits', async () => {
    const user = renderGame()
    await user.keyboard('a1')
    expect(screen.getByRole('textbox', { name: 'answer' })).toHaveValue('1')
  })

  it('moves to a new question on Next', async () => {
    const user = renderGame()
    await user.keyboard('12')
    expect(screen.getByRole('button', { name: /next/i })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByLabelText('question')).toHaveTextContent('6 × 6 =')
    expect(screen.queryByRole('figure')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'answer' })).toHaveValue('')
    expect(screen.getByRole('textbox', { name: 'answer' })).toHaveFocus()
  })
})
