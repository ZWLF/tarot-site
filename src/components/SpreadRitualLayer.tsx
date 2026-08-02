import type { SpreadStageLayout } from '../lib/spreadBoardLayout'

interface SpreadRitualLayerProps {
  layout: SpreadStageLayout
  revealedPositions: readonly string[]
}

const MIN_CONNECTOR_DISTANCE = 8

const getDistance = (leftX: number, leftY: number, rightX: number, rightY: number) =>
  Math.hypot(leftX - rightX, leftY - rightY)

export function SpreadRitualLayer({ layout, revealedPositions }: SpreadRitualLayerProps) {
  const revealedSet = new Set(revealedPositions)
  const centerX = layout.boardLeft + layout.boardWidth / 2
  const centerY = layout.boardTop + layout.boardHeight / 2
  const ringRadius = Math.min(layout.boardWidth, layout.boardHeight) * 0.42
  const allRevealed =
    layout.cards.length > 0 && layout.cards.every((card) => revealedSet.has(card.key))
  const connectors = layout.cards.filter(
    (card) =>
      getDistance(centerX, centerY, card.centerX, card.centerY) >= MIN_CONNECTOR_DISTANCE,
  )

  return (
    <svg
      aria-hidden="true"
      className="spread-board__ritual-layer"
      data-testid="spread-ritual-layer"
      focusable="false"
      pointerEvents="none"
      preserveAspectRatio="none"
      viewBox={`0 0 ${layout.stageWidth} ${layout.stageHeight}`}
    >
      <circle
        className={`spread-board__ritual-ring ${allRevealed ? 'is-complete' : ''}`}
        cx={centerX}
        cy={centerY}
        data-state={allRevealed ? 'complete' : 'idle'}
        r={ringRadius}
      />
      {connectors.map((card) => {
        const active = revealedSet.has(card.key)

        return (
          <line
            key={`ritual-line-${card.key}`}
            className={`spread-board__ritual-line ${active ? 'is-active' : ''}`}
            data-position-key={card.key}
            data-state={active ? 'active' : 'idle'}
            pathLength="1"
            x1={centerX}
            x2={card.centerX}
            y1={centerY}
            y2={card.centerY}
          />
        )
      })}
      {layout.cards.map((card) => {
        const active = revealedSet.has(card.key)

        return (
          <circle
            key={`ritual-node-${card.key}`}
            className={`spread-board__ritual-node ${active ? 'is-active' : ''}`}
            cx={card.centerX}
            cy={card.centerY}
            data-position-key={card.key}
            data-state={active ? 'active' : 'idle'}
            r="7"
          />
        )
      })}
    </svg>
  )
}
