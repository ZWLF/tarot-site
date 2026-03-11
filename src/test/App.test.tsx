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
    expect(screen.getAllByTestId('deck-stage-card')).toHaveLength(150)
  })

  it(
    'shows all 150 cards on the deck stage and completes a holy triangle reading',
    async () => {
      const user = userEvent.setup()

      render(<App shuffleDelayMs={0} />)

      expect(screen.getAllByTestId('deck-stage-card')).toHaveLength(150)

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
    'supports daily reflection and records it in the record center',
    async () => {
      const user = userEvent.setup()

      render(<App shuffleDelayMs={0} />)

      await user.click(screen.getByRole('button', { name: '揭晓今日能量' }))
      fireEvent.change(screen.getByLabelText('晨间意图'), {
        target: { value: '今天要稳住节奏' },
      })
      fireEvent.change(screen.getByLabelText('晚间复盘'), {
        target: { value: '晚上的节奏确实更稳了。' },
      })
      await user.click(screen.getByRole('button', { name: '强共鸣' }))
      await user.click(screen.getByRole('button', { name: '保存今日记录' }))
      await user.click(screen.getByRole('button', { name: '每日一张' }))

      expect(screen.getByText('今天要稳住节奏')).toBeInTheDocument()
      expect(screen.getAllByText('晚上的节奏确实更稳了。').length).toBeGreaterThan(0)
    },
    10000,
  )
})
