import type { ReadingCardView } from '../domain/tarot'

interface TarotCardButtonProps {
  entry: ReadingCardView
  revealed: boolean
  onReveal: () => void
}

const SUIT_LABELS = {
  wands: '权杖能量',
  cups: '圣杯能量',
  swords: '宝剑能量',
  pentacles: '星币能量',
} as const

const getToneLabel = (entry: ReadingCardView) => {
  if (entry.card.arcana === 'major') {
    return '大阿尔卡那'
  }

  return SUIT_LABELS[entry.card.suit]
}

export function TarotCardButton({
  entry,
  revealed,
  onReveal,
}: TarotCardButtonProps) {
  const orientationLabel = entry.drawn.orientation === 'up' ? '正位' : '逆位'
  const accentClass = `accent-${entry.art.accentToken}`

  return (
    <button
      aria-label={revealed ? `${entry.card.nameZh}${orientationLabel}` : `翻开${entry.positionLabel}`}
      className={`tarot-card-button ${revealed ? 'is-revealed' : ''}`}
      type="button"
      onClick={onReveal}
    >
      <span className="tarot-card-button__position">{entry.positionLabel}</span>
      <span className="tarot-card-button__prompt">{entry.prompt}</span>

      <span className="tarot-card">
        <span className="tarot-card__inner">
          <span className="tarot-card__face tarot-card__face--back">
            <span className="tarot-card__back-title">浮世塔罗</span>
          </span>

          <span className={`tarot-card__face tarot-card__face--front ${accentClass}`}>
            <span className="tarot-card__art">
              <span className="tarot-card__ribbon">{getToneLabel(entry)}</span>
              <span className="tarot-card__title">
                <strong>{entry.card.nameZh}</strong>
                <small>{entry.card.nameEn}</small>
              </span>
              <span className="tarot-card__glyph">{entry.art.label}</span>
            </span>
          </span>
        </span>
      </span>

      <span className="tarot-card-button__status">
        {revealed ? `${entry.card.nameZh} · ${orientationLabel}` : '点击翻开牌面'}
      </span>
    </button>
  )
}
