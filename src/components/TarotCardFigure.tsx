import type { CardArtManifest, Orientation, TarotCard } from '../domain/tarot'

interface TarotCardFigureProps {
  card: TarotCard
  art: CardArtManifest
  orientation?: Orientation
  label?: string
  revealed: boolean
  compact?: boolean
  interactive?: boolean
  onClick?: () => void
  className?: string
  testId?: string
}

const SUIT_SYMBOLS = {
  wands: '焰',
  cups: '潮',
  swords: '锋',
  pentacles: '穗',
} as const

const getPipCount = (card: TarotCard) =>
  card.arcana === 'minor' && card.number <= 10 ? card.number : 0

const renderPips = (card: TarotCard) => {
  if (card.arcana === 'major') {
    return null
  }

  const count = getPipCount(card)

  if (count > 0) {
    return (
      <div className="tarot-card-figure__pips" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <span key={`${card.id}-${index}`}>{SUIT_SYMBOLS[card.suit]}</span>
        ))}
      </div>
    )
  }

  return (
    <div className="tarot-card-figure__court" aria-hidden="true">
      {card.nameEn.split(' of ')[0]}
    </div>
  )
}

export function TarotCardFigure({
  card,
  art,
  orientation = 'up',
  label,
  revealed,
  compact = false,
  interactive = false,
  onClick,
  className = '',
  testId,
}: TarotCardFigureProps) {
  const Tag = interactive ? 'button' : 'div'
  const classNameValue = [
    'tarot-card-figure',
    compact ? 'is-compact' : '',
    revealed ? 'is-revealed' : '',
    `is-${art.background}`,
    `is-${art.accentToken}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (compact) {
    return (
      <Tag
        className={classNameValue}
        data-testid={testId}
        type={interactive ? 'button' : undefined}
        onClick={interactive ? onClick : undefined}
      >
        <div className="tarot-card-figure__mini">
          <div className="tarot-card-figure__mini-header">
            <span>{art.seal}</span>
            <span>{card.arcana === 'major' ? `M${card.number}` : art.motif}</span>
          </div>
          <div className="tarot-card-figure__mini-mark">{art.motif}</div>
          <div className="tarot-card-figure__mini-footer">
            <strong>{card.nameZh}</strong>
            <small>{label ?? card.nameEn}</small>
          </div>
        </div>
      </Tag>
    )
  }

  return (
    <Tag
      className={classNameValue}
      data-testid={testId}
      type={interactive ? 'button' : undefined}
      onClick={interactive ? onClick : undefined}
    >
      <div className="tarot-card-figure__inner">
        <div className="tarot-card-figure__face tarot-card-figure__face--back">
          <span className="tarot-card-figure__back-mark">浮世</span>
          <span className="tarot-card-figure__back-sub">TAROT</span>
        </div>

        <div className="tarot-card-figure__face tarot-card-figure__face--front">
          <div className="tarot-card-figure__halo" />
          <div className="tarot-card-figure__header">
            <span>{art.seal}</span>
            <span>{card.arcana === 'major' ? 'Major' : 'Minor'}</span>
          </div>

          <div className={`tarot-card-figure__frame tarot-card-figure__frame--${art.frame}`}>
            <div className="tarot-card-figure__motif">{art.motif}</div>
            <div className="tarot-card-figure__constellation">{art.constellation}</div>
            {renderPips(card)}
            <div className="tarot-card-figure__glyphs" aria-hidden="true">
              {art.glyphs.map((glyph, index) => (
                <span key={`${card.id}-${glyph}-${index}`}>{glyph}</span>
              ))}
            </div>
          </div>

          <div className="tarot-card-figure__footer">
            {label ? <span className="tarot-card-figure__label">{label}</span> : null}
            <strong>{card.nameZh}</strong>
            <small>
              {card.nameEn}
              {revealed ? ` · ${orientation === 'up' ? '正位' : '逆位'}` : ''}
            </small>
          </div>
        </div>
      </div>
    </Tag>
  )
}
