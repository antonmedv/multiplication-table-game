import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Heatmap } from './Heatmap'
import { accuracyColor, recordOutcome } from './mastery'

describe('Heatmap', () => {
  it('shows every fact from 2×2 to 10×10', () => {
    render(<Heatmap mastery={{}} onReset={() => {}} />)
    const cells = screen.getAllByRole('cell')
    expect(cells).toHaveLength(81)
    expect(cells[0]).toHaveTextContent('4')
    expect(cells[80]).toHaveTextContent('100')
    expect(cells[0]).toHaveAttribute('title', '2 × 2: not asked yet')
  })

  it('colours an answered fact by accuracy', () => {
    const mastery = recordOutcome(recordOutcome({}, 3, 4, true), 3, 4, false)
    render(<Heatmap mastery={mastery} onReset={() => {}} />)
    const cell = screen.getByTitle('3 × 4: 1/2 right')
    expect(cell).toHaveStyle({ background: accuracyColor(0.5) })
    expect(cell).not.toHaveClass('fact-unseen')
  })

  it('asks for confirmation before resetting', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn<() => void>()
    render(<Heatmap mastery={{}} onReset={onReset} />)
    await user.click(screen.getByRole('button', { name: 'Reset progress' }))
    expect(onReset).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Really reset?' }))
    expect(onReset).toHaveBeenCalledOnce()
  })
})
