import type { ReadingCardView } from '../domain/tarot'
import { TarotCardFigure } from './TarotCardFigure'

interface TarotCardButtonProps {
  entry: ReadingCardView
  revealed: boolean
  onReveal: () => void
  compact?: boolean
  testId?: string
}

export function TarotCardButton({
  entry,
  revealed,
  onReveal,
  compact = false,
  testId,
}: TarotCardButtonProps) {
  return (
    <TarotCardFigure
      art={entry.art}
      card={entry.card}
      compact={compact}
      interactive={!revealed}
      label={entry.positionLabel}
      onClick={onReveal}
      orientation={entry.drawn.orientation}
      revealed={revealed}
      testId={testId}
    />
  )
}
