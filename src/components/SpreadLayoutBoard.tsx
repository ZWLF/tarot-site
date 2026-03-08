import type { CSSProperties } from 'react'
import type { ReadingCardView, ResolvedSpreadDefinition } from '../domain/tarot'
import { TarotCardFigure } from './TarotCardFigure'

interface SpreadLayoutBoardProps {
  cards: ReadingCardView[]
  spread: ResolvedSpreadDefinition
  revealedPositions: string[]
  onReveal: (positionKey: string) => void
}

interface BoardCoordinate {
  key: string
  x: number
  y: number
  rotation?: number
}

const getBoardMeta = (spread: ResolvedSpreadDefinition) => {
  switch (spread.layoutId) {
    case 'single':
      return {
        width: 420,
        height: 540,
        coordinates: [{ key: spread.positions[0].key, x: 50, y: 50 }],
      }
    case 'line-3':
      return {
        width: 900,
        height: 520,
        coordinates: spread.positions.map((position, index) => ({
          key: position.key,
          x: 18 + index * 32,
          y: 50,
        })),
      }
    case 'cross-5':
      return {
        width: 900,
        height: 720,
        coordinates: [
          { key: spread.positions[0].key, x: 50, y: 50 },
          { key: spread.positions[1].key, x: 50, y: 18 },
          { key: spread.positions[2].key, x: 18, y: 50 },
          { key: spread.positions[3].key, x: 82, y: 50 },
          { key: spread.positions[4].key, x: 50, y: 82 },
        ],
      }
    case 'decision-compass':
      return {
        width: 900,
        height: 620,
        coordinates: [
          { key: spread.positions[0].key, x: 50, y: 20 },
          { key: spread.positions[1].key, x: 20, y: 58, rotation: -4 },
          { key: spread.positions[2].key, x: 80, y: 58, rotation: 4 },
          { key: spread.positions[3].key, x: 50, y: 80 },
        ],
      }
    case 'relationship-mirror':
      return {
        width: 880,
        height: 620,
        coordinates: [
          { key: spread.positions[0].key, x: 28, y: 30 },
          { key: spread.positions[1].key, x: 72, y: 30 },
          { key: spread.positions[2].key, x: 28, y: 74 },
          { key: spread.positions[3].key, x: 72, y: 74 },
        ],
      }
    case 'weekly-flow':
      return {
        width: 1120,
        height: 580,
        coordinates: [
          { key: spread.positions[0].key, x: 12, y: 50, rotation: -6 },
          { key: spread.positions[1].key, x: 32, y: 32, rotation: -3 },
          { key: spread.positions[2].key, x: 52, y: 50 },
          { key: spread.positions[3].key, x: 72, y: 32, rotation: 3 },
          { key: spread.positions[4].key, x: 88, y: 50, rotation: 6 },
        ],
      }
    case 'celtic-cross':
      return {
        width: 1180,
        height: 940,
        coordinates: [
          { key: spread.positions[0].key, x: 24, y: 40 },
          { key: spread.positions[1].key, x: 24, y: 40, rotation: 90 },
          { key: spread.positions[2].key, x: 24, y: 12 },
          { key: spread.positions[3].key, x: 24, y: 68 },
          { key: spread.positions[4].key, x: 8, y: 40 },
          { key: spread.positions[5].key, x: 40, y: 40 },
          { key: spread.positions[6].key, x: 72, y: 14 },
          { key: spread.positions[7].key, x: 72, y: 36 },
          { key: spread.positions[8].key, x: 72, y: 58 },
          { key: spread.positions[9].key, x: 72, y: 80 },
        ],
      }
    case 'zodiac-wheel':
      return {
        width: 1240,
        height: 1240,
        coordinates: spread.positions.map((position, index) => {
          const angle = (Math.PI * 2 * index) / spread.positions.length - Math.PI / 2
          const radius = 36

          return {
            key: position.key,
            x: 50 + Math.cos(angle) * radius,
            y: 50 + Math.sin(angle) * radius,
            rotation: ((index + 1) % 2 === 0 ? -1 : 1) * 4,
          }
        }),
      }
    case 'tree-of-life':
      return {
        width: 1040,
        height: 1280,
        coordinates: [
          { key: spread.positions[0].key, x: 50, y: 8 },
          { key: spread.positions[1].key, x: 32, y: 22 },
          { key: spread.positions[2].key, x: 68, y: 22 },
          { key: spread.positions[3].key, x: 24, y: 44 },
          { key: spread.positions[4].key, x: 76, y: 44 },
          { key: spread.positions[5].key, x: 50, y: 52 },
          { key: spread.positions[6].key, x: 28, y: 72 },
          { key: spread.positions[7].key, x: 72, y: 72 },
          { key: spread.positions[8].key, x: 50, y: 88 },
          { key: spread.positions[9].key, x: 50, y: 108 },
        ],
      }
  }
}

const createCoordinateMap = (coordinates: BoardCoordinate[]) =>
  Object.fromEntries(coordinates.map((entry) => [entry.key, entry]))

export function SpreadLayoutBoard({
  cards,
  spread,
  revealedPositions,
  onReveal,
}: SpreadLayoutBoardProps) {
  const boardMeta = getBoardMeta(spread)
  const coordinateMap = createCoordinateMap(boardMeta.coordinates)

  return (
    <div className="spread-board-shell">
      <div className="spread-board-scroll">
        <div
          className={`spread-board spread-board--${spread.layoutId}`}
          style={
            {
              '--board-width': `${boardMeta.width}px`,
              '--board-height': `${boardMeta.height}px`,
            } as CSSProperties
          }
        >
          {cards.map((entry) => {
            const coordinate = coordinateMap[entry.drawn.positionKey]
            const revealed = revealedPositions.includes(entry.drawn.positionKey)

            return (
              <div
                key={entry.drawn.positionKey}
                className="spread-board__slot"
                style={
                  {
                    '--slot-x': `${coordinate.x}%`,
                    '--slot-y': `${coordinate.y}%`,
                    '--slot-rotation': `${coordinate.rotation ?? 0}deg`,
                  } as CSSProperties
                }
              >
                <TarotCardFigure
                  art={entry.art}
                  card={entry.card}
                  interactive={!revealed}
                  onClick={() => onReveal(entry.drawn.positionKey)}
                  orientation={entry.drawn.orientation}
                  revealed={revealed}
                />
                <div className="spread-board__caption">
                  <strong>{entry.positionLabel}</strong>
                  <span>{entry.prompt}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="spread-board__reading-list">
        {cards.map((entry) => (
          <article key={`${entry.drawn.positionKey}-summary`} className="result-panel">
            <p className="eyebrow">牌位 · {entry.positionLabel}</p>
            <h3>
              {entry.card.nameZh} · {entry.drawn.orientation === 'up' ? '正位' : '逆位'}
            </h3>
            <p>{entry.prompt}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
