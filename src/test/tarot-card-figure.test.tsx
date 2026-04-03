import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TarotCardFigure } from '../components/TarotCardFigure'
import { CARD_ART_MANIFEST } from '../data/artManifest'
import { TAROT_DECK } from '../data/cards'

describe('TarotCardFigure compact mode', () => {
  it('shows the Chinese card name instead of a major arcana index', () => {
    const card = TAROT_DECK.find((entry) => entry.id === 'the-magician')!

    render(
      <TarotCardFigure
        art={CARD_ART_MANIFEST[card.id]}
        card={card}
        compact
        revealed
      />,
    )

    expect(screen.getByText(card.nameZh)).toBeInTheDocument()
    expect(screen.queryByText('M1')).not.toBeInTheDocument()
  })

  it('renders the actual card name in the front header', () => {
    const card = TAROT_DECK.find((entry) => entry.id === 'the-magician')!
    const { container } = render(
      <TarotCardFigure
        art={CARD_ART_MANIFEST[card.id]}
        card={card}
        revealed
      />,
    )

    const headerSpans = container.querySelectorAll('.tarot-card-figure__header span')

    expect(headerSpans).toHaveLength(1)
    expect(headerSpans.item(0)?.textContent).toBe(card.nameZh)
    expect(screen.queryByText('Major Arcana')).not.toBeInTheDocument()
  })
})
