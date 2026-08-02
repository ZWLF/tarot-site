import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SpreadRitualLayer } from '../components/SpreadRitualLayer'
import type { SpreadStageLayout } from '../lib/spreadBoardLayout'

const makeLayout = (cards: SpreadStageLayout['cards']): SpreadStageLayout => ({
  stageWidth: 980,
  stageHeight: 680,
  boardLeft: 80,
  boardTop: 60,
  boardWidth: 820,
  boardHeight: 560,
  cardScale: 1,
  cards,
  captions: [],
})

const makeCard = (key: string, centerX: number, centerY: number) => ({
  key,
  x: ((centerX - 80) / 820) * 100,
  y: ((centerY - 60) / 560) * 100,
  centerX,
  centerY,
  width: 160,
  height: 256,
  rect: {
    left: centerX - 80,
    right: centerX + 80,
    top: centerY - 128,
    bottom: centerY + 128,
  },
})

describe('SpreadRitualLayer', () => {
  it('renders one node per card and skips the center connector', () => {
    render(
      <SpreadRitualLayer
        layout={makeLayout([
          makeCard('center', 490, 340),
          makeCard('past', 240, 340),
          makeCard('future', 740, 340),
        ])}
        revealedPositions={['past']}
      />,
    )

    const layer = screen.getByTestId('spread-ritual-layer')

    expect(layer).toHaveAttribute('aria-hidden', 'true')
    expect(layer).toHaveAttribute('pointer-events', 'none')
    expect(layer.querySelectorAll('.spread-board__ritual-node')).toHaveLength(3)
    expect(layer.querySelectorAll('.spread-board__ritual-line')).toHaveLength(2)
    expect(layer.querySelector('[data-position-key="past"]')).toHaveAttribute('data-state', 'active')
    expect(layer.querySelector('[data-position-key="future"]')).toHaveAttribute('data-state', 'idle')
  })

  it('marks the ring and every connector complete after all cards reveal', () => {
    const cards = [makeCard('one', 240, 340), makeCard('two', 740, 340)]

    render(<SpreadRitualLayer layout={makeLayout(cards)} revealedPositions={['one', 'two']} />)

    const layer = screen.getByTestId('spread-ritual-layer')

    expect(layer.querySelector('.spread-board__ritual-ring')).toHaveAttribute(
      'data-state',
      'complete',
    )
    expect(layer.querySelectorAll('.spread-board__ritual-line.is-active')).toHaveLength(2)
    expect(layer.querySelectorAll('.spread-board__ritual-node.is-active')).toHaveLength(2)
  })

  it('renders no connector for a single centered card', () => {
    render(
      <SpreadRitualLayer
        layout={makeLayout([makeCard('single', 490, 340)])}
        revealedPositions={[]}
      />,
    )

    expect(screen.getByTestId('spread-ritual-layer').querySelectorAll('.spread-board__ritual-line')).toHaveLength(0)
  })
})
