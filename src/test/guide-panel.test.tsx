import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GuidePanel } from '../components/GuidePanel'

describe('GuidePanel onboarding', () => {
  it('supports step navigation and completion', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    const { container } = render(
      <GuidePanel dismissed={false} onDismiss={onDismiss} onRestore={vi.fn()} />,
    )

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1')

    const advance = () =>
      container.querySelector<HTMLButtonElement>('.draw-summary__actions .primary-button')

    await user.click(advance()!)
    await user.click(advance()!)

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3')

    await user.click(advance()!)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('renders caller-provided guide content when available', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <GuidePanel
        dismissed={false}
        guide={{
          title: 'Custom Ritual',
          collapsedNote: 'Bring this guide back whenever the spread changes shape.',
          steps: [
            {
              title: 'Name the tension',
              detail: 'Write the exact pressure point before you draw.',
              meaningHint: 'Questions with a concrete stake produce cleaner spreads.',
            },
            {
              title: 'Pick the lens',
              detail: 'Choose the spread that matches the decision horizon.',
            },
          ],
        }}
        onDismiss={vi.fn()}
        onRestore={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Custom Ritual' })).toBeInTheDocument()
    expect(
      screen.getByText('Questions with a concrete stake produce cleaner spreads.'),
    ).toBeInTheDocument()

    await user.click(container.querySelector<HTMLButtonElement>('.draw-summary__actions .primary-button')!)

    expect(screen.getByRole('heading', { name: 'Pick the lens' })).toBeInTheDocument()
  })
})
