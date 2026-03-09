import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GuidePanel } from '../components/GuidePanel'

describe('GuidePanel onboarding', () => {
  it('supports step navigation and completion', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()

    render(<GuidePanel dismissed={false} onDismiss={onDismiss} onRestore={vi.fn()} />)

    expect(screen.getByText('第 1 / 4 步')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '下一步' }))
    await user.click(screen.getByRole('button', { name: '下一步' }))
    await user.click(screen.getByRole('button', { name: '下一步' }))

    expect(screen.getByText('第 4 / 4 步')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '完成引导' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})

