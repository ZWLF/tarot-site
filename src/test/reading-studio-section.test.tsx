import { render, screen, within } from '@testing-library/react'
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
          framing: '围绕你真正想确认的关系推进来提问。',
        }}
        selectedVariant={selectedVariant}
        spreadId={selectedSpread.id}
        topic="love"
        variantId={selectedVariant.id}
      />,
    )

    const suggestionList = within(screen.getByTestId('question-suggestions')).getAllByRole('button')
    const expectedSuggestion = suggestionList[0]?.textContent

    await user.click(suggestionList[0]!)

    expect(onQuestionChange).toHaveBeenCalledWith(expectedSuggestion)
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
        question="What changes if I stop forcing this?"
        selectedSpread={selectedSpread}
        selectedTopic={{
          label: '爱情',
          framing: '围绕你真正想确认的关系推进来提问。',
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

  it('renders topic hint and selected spread guide content', () => {
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
        question="What actually needs to change next?"
        selectedSpread={selectedSpread}
        selectedTopic={{
          label: '决策',
          framing: '先聚焦你真正能改变的那一部分。',
          meaningHint: '把问题落在你能负责的动作上，解读会更清楚。',
        }}
        selectedVariant={selectedVariant}
        spreadId={selectedSpread.id}
        topic="love"
        variantId={selectedVariant.id}
      />,
    )

    expect(screen.getByTestId('studio-guide-panel')).toBeInTheDocument()
    expect(screen.getByText('把问题落在你能负责的动作上，解读会更清楚。')).toBeInTheDocument()
    expect(screen.getByText('适合回答什么')).toBeInTheDocument()
    expect(screen.getByText(selectedVariant.guide.bestFor)).toBeInTheDocument()
    expect(screen.getByText('什么时候选它')).toBeInTheDocument()
    expect(screen.getByText(selectedVariant.guide.chooseWhen)).toBeInTheDocument()
    expect(screen.getByText('什么时候不要用它')).toBeInTheDocument()
    expect(screen.getByText(selectedVariant.guide.avoidWhen!)).toBeInTheDocument()
  })
})
