import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ArrayBox } from './ArrayBox'
import { colorOf } from './colors'

describe('ArrayBox', () => {
  it('draws a rows of b cells', () => {
    render(<ArrayBox a={3} b={4} />)
    expect(screen.getByRole('figure', { name: '3 rows of 4' })).toBeInTheDocument()
    expect(screen.getAllByTestId('cell')).toHaveLength(12)
  })

  it('labels both dimensions in their own colours', () => {
    const { container } = render(<ArrayBox a={3} b={4} />)
    const side = container.querySelector('.array-label-side')
    const top = container.querySelector('.array-label-top')
    expect(side).toHaveTextContent('3')
    expect(side).toHaveStyle({ color: colorOf(3) })
    expect(top).toHaveTextContent('4')
    expect(top).toHaveStyle({ color: colorOf(4) })
  })

  it('captions the full equation', () => {
    render(<ArrayBox a={3} b={4} />)
    expect(screen.getByRole('figure')).toHaveTextContent('3 × 4 = 12')
  })
})
