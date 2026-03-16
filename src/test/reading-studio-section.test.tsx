import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SPREADS } from '../data/spreads'
import { ReadingStudioSection } from '../sections/ReadingStudioSection'

const selectedSpread = SPREADS.find((entry) => entry.id === 'holy-triangle')!
const selectedVariant = selectedSpread.variants?.find((entry) => entry.id === 'timeline')

if (!selectedVariant) {
  throw new Error('Expected holy-triangle timeline variant to exist.')
}

describe('ReadingStudioSection', () => {
  it('fills the textarea from a suggestion chip', async () => {
    const user = userEvent.setup()
    const onQuestionChange = vi.fn()

    render(
      <ReadingStudioSection
        canDraw={false}
        drawNotice={null}
        isShuffling={false}
        needsReDrawConfirm={false}
        onDraw={vi.fn()}
        onQuestionChange={onQuestionChange}
        onSelectSpread={vi.fn()}
        onSelectTopic={vi.fn()}
        onSelectVariant={vi.fn()}
        question=""
        selectedSpread={selectedSpread}
        selectedTopic={{
          label: '爱情',
          framing: '用更真诚的方式看清关系中的张力与选择。',
        }}
        selectedVariant={selectedVariant}
        spreadId={selectedSpread.id}
        topic="love"
        variantId={selectedVariant.id}
      />,
    )

    await user.click(
      screen.getByRole('button', {
        name: '这段关系的下一步走向是什么？',
      }),
    )

    expect(onQuestionChange).toHaveBeenCalledWith('这段关系的下一步走向是什么？')
  })

  it('does not render the advanced settings controls', () => {
    render(
      <ReadingStudioSection
        canDraw
        drawNotice={null}
        isShuffling={false}
        needsReDrawConfirm={false}
        onDraw={vi.fn()}
        onQuestionChange={vi.fn()}
        onSelectSpread={vi.fn()}
        onSelectTopic={vi.fn()}
        onSelectVariant={vi.fn()}
        question="我接下来该怎样处理这段关系？"
        selectedSpread={selectedSpread}
        selectedTopic={{
          label: '爱情',
          framing: '用更真诚的方式看清关系中的张力与选择。',
        }}
        selectedVariant={selectedVariant}
        spreadId={selectedSpread.id}
        topic="love"
        variantId={selectedVariant.id}
      />,
    )

    expect(screen.queryByTestId('advanced-settings-panel')).not.toBeInTheDocument()
    expect(screen.queryByTestId('advanced-settings-toggle')).not.toBeInTheDocument()
    expect(screen.queryAllByRole('combobox')).toHaveLength(0)
  })
})
