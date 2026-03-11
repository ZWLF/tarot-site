import { useState } from 'react'
import { CARD_ART_MANIFEST } from '../data/artManifest'
import { TAROT_DECK } from '../data/cards'
import { TarotCardFigure } from './TarotCardFigure'
import './DeckStageVortex.css'

interface DeckStageProps {
  highlightedCardIds: string[]
  isShuffling: boolean
}

export function DeckStage({ highlightedCardIds, isShuffling }: DeckStageProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const highlightedSet = new Set(highlightedCardIds)
  const totalCards = Math.max(TAROT_DECK.length - 1, 1)

  return (
    <section className="panel section deck-vortex-section" id="reading-deck">
      <div className="section__heading deck-vortex-heading">
        <div>
          <p className="eyebrow">The Archive</p>
          <h2>浮世阶梯</h2>
        </div>
        <span className="section__count">78 秘仪</span>
      </div>

      <p className="section__lede deck-vortex-lede">
        78 张牌不再平铺陈列，而是像一段缓慢上升的档案螺旋。抽中的牌先在阵列中显影，再进入本次牌阵。
      </p>

      <div className={`deck-vortex-container ${isShuffling ? 'is-shuffling' : ''}`}>
        {TAROT_DECK.map((card, index) => {
          const progress = index / totalCards
          const angle = index * 0.38
          const radius = 20 + index * 4.5
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius * 0.76
          const rotation = (angle * 180) / Math.PI + 90
          const baseScale = 0.58 + progress * 0.52
          const isHovered = hoveredId === card.id
          const isFaded = hoveredId !== null && !isHovered
          const isHighlighted = highlightedSet.has(card.id)
          const depth = isHovered ? 84 : Math.round(progress * 14)
          const scale = isHovered ? baseScale * 1.14 : baseScale
          const verticalOffset = isHovered ? y - 12 : y

          return (
            <div
              key={card.id}
              className={[
                'deck-vortex-card',
                isHovered ? 'is-hovered' : '',
                isFaded ? 'is-faded' : '',
                isHighlighted ? 'is-highlighted' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onMouseEnter={() => setHoveredId(card.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                transform: `translate(-50%, -50%) translate3d(${x}px, ${verticalOffset}px, ${depth}px) rotate(${rotation}deg) scale(${scale})`,
                zIndex: isHovered ? 300 : index + 1,
              }}
            >
              <TarotCardFigure
                art={CARD_ART_MANIFEST[card.id]}
                card={card}
                compact
                revealed
                testId="deck-stage-card"
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
