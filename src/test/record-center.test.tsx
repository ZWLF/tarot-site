import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RecordCenter } from '../components/RecordCenter'
import type { ReadingRecordV2 } from '../domain/tarot'

const createRecord = (
  id: string,
  overrides: Partial<ReadingRecordV2> = {},
): ReadingRecordV2 => ({
  version: 2,
  id,
  kind: 'reading',
  saved: false,
  createdAt: '2026-03-01T00:00:00.000Z',
  updatedAt: '2026-03-01T00:00:00.000Z',
  title: `记录-${id}`,
  question: `问题-${id}`,
  topicId: 'general',
  topicLabel: '通用',
  spreadId: 'holy-triangle',
  spreadTitle: '圣三角',
  tone: '稳定推进',
  summary: `总结-${id}`,
  dominantSignals: ['主题：通用'],
  tags: [],
  cards: [],
  actionPlan: [],
  followUps: [],
  dailyReflection: {
    morningIntent: '',
    eveningReview: '',
    resonance: null,
  },
  ...overrides,
})

describe('RecordCenter filters and compare', () => {
  it('applies tag and date filters and triggers compare callback', async () => {
    const user = userEvent.setup()
    const onToggleCompare = vi.fn()

    const records = [
      createRecord('recent-love', {
        updatedAt: new Date().toISOString(),
        tags: ['关系'],
      }),
      createRecord('old-career', {
        updatedAt: '2024-01-01T00:00:00.000Z',
        tags: ['事业'],
      }),
    ]

    render(
      <RecordCenter
        records={records}
        filter="all"
        query=""
        tagFilter="关系"
        dateFilter="7d"
        compareSelection={[]}
        onFilterChange={vi.fn()}
        onQueryChange={vi.fn()}
        onTagFilterChange={vi.fn()}
        onDateFilterChange={vi.fn()}
        onToggleCompare={onToggleCompare}
        onClearCompare={vi.fn()}
      />,
    )

    expect(screen.getByText('记录-recent-love')).toBeInTheDocument()
    expect(screen.queryByText('记录-old-career')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '加入对比' }))
    expect(onToggleCompare).toHaveBeenCalledWith('recent-love')
  })
})

