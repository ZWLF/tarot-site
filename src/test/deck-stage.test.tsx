import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DeckStage } from '../components/DeckStage'
import { TAROT_DECK } from '../data/cards'

describe('DeckStage abyss funnel', () => {
  it('renders 150 vortex cards with three-layer nesting', () => {
    const { container } = render(<DeckStage highlightedCardIds={[]} />)

    expect(screen.getAllByTestId('deck-stage-card')).toHaveLength(150)
    expect(container.querySelectorAll('.deck-vortex-card-positioner')).toHaveLength(150)
    expect(container.querySelectorAll('.deck-vortex-card-floater')).toHaveLength(150)
    expect(container.querySelectorAll('.deck-vortex-card-visual')).toHaveLength(150)
  })

  it('highlights only the first duplicated instance for a highlighted card id', () => {
    const { container } = render(<DeckStage highlightedCardIds={[TAROT_DECK[0].id]} />)

    const highlighted = container.querySelectorAll('.deck-vortex-card-positioner.is-highlighted')
    const positioners = container.querySelectorAll('.deck-vortex-card-positioner')

    expect(highlighted).toHaveLength(1)
    expect(positioners.item(0)).toBeTruthy()
    expect(highlighted.item(0)).toBe(positioners.item(0))
  })

  it('applies hover state only to the hovered instance', () => {
    const { container } = render(<DeckStage highlightedCardIds={[]} />)
    const positioners = container.querySelectorAll('.deck-vortex-card-positioner')
    const first = positioners.item(0)

    expect(first).toBeTruthy()

    if (!first) {
      throw new Error('Expected at least one vortex card positioner.')
    }

    fireEvent.mouseEnter(first)
    expect(container.querySelectorAll('.deck-vortex-card-positioner.is-hovered')).toHaveLength(1)

    fireEvent.mouseLeave(first)
    expect(container.querySelectorAll('.deck-vortex-card-positioner.is-hovered')).toHaveLength(0)
  })
})
