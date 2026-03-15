import { useEffect, useState, type CSSProperties } from 'react'
import { CARD_ART_MANIFEST } from '../data/artManifest'
import { TAROT_DECK } from '../data/cards'
import type { DeckPerformanceMode } from '../domain/tarot'
import { TarotCardFigure } from './TarotCardFigure'
import './DeckStageVortex.css'

interface DeckStageProps {
  highlightedCardIds: string[]
  performanceMode?: DeckPerformanceMode
}

const resolveDeckElementCount = (
  performanceMode: DeckPerformanceMode,
  reduceMotion: boolean,
  viewportWidth: number,
) => {
  if (performanceMode === 'full') {
    return 150
  }

  if (performanceMode === 'lite') {
    return 60
  }

  if (reduceMotion) {
    return 42
  }

  if (viewportWidth < 640) {
    return 48
  }

  if (viewportWidth < 1024) {
    return 96
  }

  return 150
}

export function DeckStage({
  highlightedCardIds,
  performanceMode = 'auto',
}: DeckStageProps) {
  const [hoveredInstanceIndex, setHoveredInstanceIndex] = useState<number | null>(null)
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1180,
  )
  const [reduceMotion, setReduceMotion] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  const highlightedSet = new Set(highlightedCardIds)
  const totalElements = Math.max(
    TAROT_DECK.length,
    resolveDeckElementCount(performanceMode, reduceMotion, viewportWidth),
  )
  const scaleFactor = Math.min(viewportWidth / 1180, 1)
  const firstHighlightIndexByCardId = new Map<string, number>()

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleResize = () => setViewportWidth(window.innerWidth)
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncReduceMotion = () => setReduceMotion(mediaQuery.matches)

    window.addEventListener('resize', handleResize)

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncReduceMotion)
    }

    return () => {
      window.removeEventListener('resize', handleResize)

      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', syncReduceMotion)
      }
    }
  }, [])

  for (let index = 0; index < totalElements; index += 1) {
    const card = TAROT_DECK[index % TAROT_DECK.length]

    if (highlightedSet.has(card.id) && !firstHighlightIndexByCardId.has(card.id)) {
      firstHighlightIndexByCardId.set(card.id, index)
    }
  }

  return (
    <section className="panel section deck-vortex-section" id="reading-deck">
      <div className="section__heading deck-vortex-heading">
        <div>
          <p className="eyebrow">The Archive</p>
          <h2>浮世档案台</h2>
        </div>
        <span className="section__count">{totalElements} 阵列 · 78 张牌循环</span>
      </div>

      <p className="section__lede deck-vortex-lede">
        78 张牌不再平铺陈列，而是像一段缓慢上升的档案旋涡。抽中的牌会先在阵列里显影，再进入本次牌阵。
      </p>

      <div className="deck-vortex-container">
        {Array.from({ length: totalElements }, (_, index) => {
          const card = TAROT_DECK[index % TAROT_DECK.length]
          const progress = index / totalElements
          const angle = index * 0.5
          const exponentialRadius = Math.pow(progress, 1.8) * 800 * scaleFactor
          const x = Math.cos(angle) * exponentialRadius
          const y = Math.sin(angle) * exponentialRadius * 0.76
          const zDepth = (progress - 1) * 2500
          const rotation = (angle * 180) / Math.PI + 90
          const baseScale = (0.2 + progress * 0.4) * scaleFactor
          const fadeOpacity = Math.max(0, (progress - 0.1) * 1.5)
          const isHovered = hoveredInstanceIndex === index
          const isHighlighted = firstHighlightIndexByCardId.get(card.id) === index
          const imageProfile =
            performanceMode === 'lite' || (performanceMode === 'auto' && reduceMotion)
              ? isHovered || isHighlighted
                ? 'thumb'
                : 'minimal'
              : 'thumb'

          return (
            <div
              key={`${card.id}-${index}`}
              className={[
                'deck-vortex-card-positioner',
                isHovered ? 'is-hovered' : '',
                isHighlighted ? 'is-highlighted' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onMouseEnter={() => setHoveredInstanceIndex(index)}
              onMouseLeave={() => setHoveredInstanceIndex(null)}
              style={{
                transform: `translate3d(${x}px, ${y}px, ${zDepth}px) rotate(${rotation}deg) scale(${baseScale})`,
                zIndex: isHovered ? 300 : index + 1,
                '--card-opacity': fadeOpacity.toString(),
                '--float-delay': `-${index * 0.05}s`,
              } as CSSProperties}
            >
              <div className="deck-vortex-card-floater">
                <TarotCardFigure
                  art={CARD_ART_MANIFEST[card.id]}
                  card={card}
                  className="deck-vortex-card-visual"
                  imageProfile={imageProfile}
                  revealed
                  testId="deck-stage-card"
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
