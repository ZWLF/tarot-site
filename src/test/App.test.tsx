import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'

describe('App tarot flow', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders the refreshed shell without legacy atmosphere layers', () => {
    const { container } = render(<App shuffleDelayMs={0} />)

    expect(
      screen.getByRole('heading', { name: '把抽到的 78 张牌，真正铺上桌面。' }),
    ).toBeInTheDocument()
    expect(container.querySelector('.particle-layer')).not.toBeInTheDocument()
    expect(container.querySelector('.app-shell__mist')).not.toBeInTheDocument()
    expect(screen.queryByTestId('advanced-settings-panel')).not.toBeInTheDocument()
    expect(screen.queryByTestId('advanced-settings-toggle')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('晨间意图')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('晚间复盘')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '保存今日记录' })).not.toBeInTheDocument()
  })

  it(
    'completes a holy triangle reading with the streamlined studio controls',
    async () => {
      const user = userEvent.setup()

      render(<App shuffleDelayMs={0} />)

      expect(screen.queryByTestId('advanced-settings-panel')).not.toBeInTheDocument()
      expect(screen.queryByTestId('advanced-settings-toggle')).not.toBeInTheDocument()

      const questionText = '我接下来该怎样处理这段关系？'

      fireEvent.change(screen.getByLabelText('占卜问题'), {
        target: { value: questionText },
      })
      await user.click(screen.getByRole('button', { name: '爱情' }))
      await user.click(screen.getByRole('button', { name: '圣三角' }))
      await user.click(screen.getByRole('button', { name: '现状 / 阻碍 / 建议' }))
      await user.click(screen.getByRole('button', { name: '洗牌并抽牌' }))

      expect(screen.getByText('现状')).toBeInTheDocument()
      expect(screen.getByText('阻碍')).toBeInTheDocument()
      expect(screen.getByText('建议')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '分享文案' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '下载海报' })).toBeInTheDocument()
      expect(screen.getByTestId('follow-up-accordion')).not.toHaveAttribute('open')

      await user.click(screen.getByRole('button', { name: '全部揭晓' }))

      expect(screen.getByRole('heading', { name: '记录中心' })).toBeInTheDocument()
      expect(screen.getAllByText(questionText).length).toBeGreaterThan(0)

      fireEvent.change(screen.getByLabelText('记录标题'), {
        target: { value: '关系推进判断' },
      })
      fireEvent.change(screen.getByLabelText('记录标签'), {
        target: { value: '关系 决策' },
      })
      await user.click(screen.getByRole('button', { name: '加入收藏' }))
      await user.click(screen.getByRole('button', { name: '收藏' }))

      expect(screen.getByText('关系推进判断')).toBeInTheDocument()
    },
    30000,
  )

  it(
    'reveals daily guidance and auto-archives it in the record center',
    async () => {
      const user = userEvent.setup()

      render(<App shuffleDelayMs={0} />)

      expect(screen.queryByLabelText('晨间意图')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('晚间复盘')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '保存今日记录' })).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: '揭晓今日能量' }))
      expect(screen.getByTestId('daily-revealed-content')).toBeInTheDocument()
      const guidanceCard = screen.getByRole('heading', { name: '核心指引' }).closest('article')
      expect(guidanceCard).toBeInTheDocument()
      expect(guidanceCard?.textContent?.trim().length ?? 0).toBeGreaterThan(24)
      await user.click(screen.getByRole('button', { name: '每日一张' }))

      expect(screen.getByText(/每日一张 ·/)).toBeInTheDocument()
    },
    10000,
  )
})
