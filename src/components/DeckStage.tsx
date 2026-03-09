import { CARD_ART_MANIFEST } from '../data/artManifest'
import { TAROT_DECK } from '../data/cards'
import { TarotCardFigure } from './TarotCardFigure'

interface DeckStageProps {
  highlightedCardIds: string[]
  isShuffling: boolean
  shuffleIntensity: 'low' | 'medium' | 'high'
}

export function DeckStage({
  highlightedCardIds,
  isShuffling,
  shuffleIntensity,
}: DeckStageProps) {
  return (
    <section className="panel section" id="reading-deck">
      <div className="section__heading">
        <div>
          <p className="eyebrow">Deck Stage</p>
          <h2>浮世牌桌</h2>
        </div>
        <span className="section__count">完整 78 张牌面</span>
      </div>

      <p className="section__lede">
        抽牌前先让整副牌真实展开。洗牌时整桌会流动，最终被抽中的牌会先在牌桌里亮起，再进入牌阵。
      </p>

      <div
        className={`deck-stage ${isShuffling ? 'is-shuffling' : ''} is-${shuffleIntensity}`}
      >
        {TAROT_DECK.map((card) => (
          <div
            key={card.id}
            className={`deck-stage__card ${
              highlightedCardIds.includes(card.id) ? 'is-highlighted' : ''
            }`}
          >
            <TarotCardFigure
              art={CARD_ART_MANIFEST[card.id]}
              card={card}
              compact
              revealed
              testId="deck-stage-card"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
