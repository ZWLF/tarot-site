import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CARD_ART_MANIFEST } from '../data/artManifest'
import { TAROT_DECK } from '../data/cards'
import { SPREADS } from '../data/spreads'
import type { ReadingResult, ResolvedSpreadDefinition } from '../domain/tarot'
import { ReadingResultSection } from '../sections/ReadingResultSection'

const spreadDefinition = SPREADS.find((entry) => entry.id === 'holy-triangle')!
const spreadVariant = spreadDefinition.variants?.find((entry) => entry.id === 'diagnostic')

if (!spreadVariant) {
  throw new Error('Expected holy-triangle diagnostic variant to exist.')
}

const spread: ResolvedSpreadDefinition = {
  id: spreadDefinition.id,
  title: spreadDefinition.title,
  description: spreadDefinition.description,
  cardCount: spreadDefinition.cardCount,
  layoutId: spreadDefinition.layoutId,
  positions: spreadVariant?.positions ?? spreadDefinition.positions,
  activeVariantId: spreadVariant?.id,
  activeVariantTitle: spreadVariant?.title,
}

const reading: ReadingResult = {
  input: {
    question: '我接下来该怎样处理这段关系？',
    topic: 'love',
    spreadId: spread.id,
    variantId: spread.activeVariantId,
  },
  spread,
  cards: spread.positions.map((position, index) => {
    const card = TAROT_DECK[index]!

    return {
      art: CARD_ART_MANIFEST[card.id],
      card,
      drawn: {
        cardId: card.id,
        orientation: index === 1 ? 'down' : 'up',
        positionKey: position.key,
      },
      positionLabel: position.label,
      prompt: position.prompt,
    }
  }),
  positionReadings: spread.positions.map((position, index) => ({
    positionKey: position.key,
    label: position.label,
    prompt: position.prompt,
    cardId: TAROT_DECK[index]!.id,
    cardName: TAROT_DECK[index]!.nameZh,
    orientation: index === 1 ? 'down' : 'up',
    message: `解读-${position.key}`,
    keywords: ['清晰', '关系'],
  })),
  summary: '把关系里的真实张力说清楚，接下来才有推进空间。',
  advice: ['先说清楚当前的不安来源。', '把边界和期待同时摆到台面上。'],
  actionPlan: [
    { id: 'step-1', title: '澄清', detail: '先确认你最在意的关系需求。' },
    { id: 'step-2', title: '表达', detail: '安排一次不被打断的沟通。' },
  ],
  tone: '关系进入重新校准期',
  dominantSignals: ['关系', '沟通', '边界'],
}

describe('ReadingResultSection', () => {
  it('keeps follow-up exploration collapsed by default and exposes icon-only secondary actions', () => {
    render(
      <ReadingResultSection
        actionPlanDoneIds={[]}
        followUpQuestion=""
        followUpSuggestions={['如果我主动推进一次，会发生什么？']}
        followUps={[]}
        onDownloadPoster={vi.fn()}
        onFollowUpQuestionChange={vi.fn()}
        onRecordTagsChange={vi.fn()}
        onRecordTitleChange={vi.fn()}
        onReveal={vi.fn()}
        onRevealAll={vi.fn()}
        onSaveReading={vi.fn()}
        onShareReading={vi.fn()}
        onSubmitFollowUp={vi.fn()}
        onToggleActionPlan={vi.fn()}
        reading={reading}
        recordNotice={null}
        recordTagsInput=""
        recordTitle=""
        revealedPositions={[]}
        shareMessage={null}
      />,
    )

    expect(screen.getByRole('button', { name: '全部揭晓' })).toHaveClass(
      'result-actions__primary',
    )
    expect(screen.getByRole('button', { name: '分享文案' })).toHaveClass(
      'ghost-button--icon-only',
    )
    expect(screen.getByRole('button', { name: '下载海报' })).toHaveClass(
      'ghost-button--icon-only',
    )
    expect(screen.getByTestId('follow-up-accordion')).not.toHaveAttribute('open')
  })

  it('keeps the archive inputs writable through the existing handlers', () => {
    const onRecordTitleChange = vi.fn()
    const onRecordTagsChange = vi.fn()

    render(
      <ReadingResultSection
        actionPlanDoneIds={[]}
        followUpQuestion=""
        followUpSuggestions={[]}
        followUps={[]}
        onDownloadPoster={vi.fn()}
        onFollowUpQuestionChange={vi.fn()}
        onRecordTagsChange={onRecordTagsChange}
        onRecordTitleChange={onRecordTitleChange}
        onReveal={vi.fn()}
        onRevealAll={vi.fn()}
        onSaveReading={vi.fn()}
        onShareReading={vi.fn()}
        onSubmitFollowUp={vi.fn()}
        onToggleActionPlan={vi.fn()}
        reading={reading}
        recordNotice={null}
        recordTagsInput=""
        recordTitle=""
        revealedPositions={reading.cards.map((entry) => entry.drawn.positionKey)}
        shareMessage={null}
      />,
    )

    fireEvent.change(screen.getByLabelText('记录标题'), {
      target: { value: '关系推进判断' },
    })
    fireEvent.change(screen.getByLabelText('记录标签'), {
      target: { value: '关系 决策' },
    })

    expect(onRecordTitleChange).toHaveBeenCalledWith('关系推进判断')
    expect(onRecordTagsChange).toHaveBeenCalledWith('关系 决策')
  })
})
