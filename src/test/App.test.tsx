import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'

describe('App tarot flow', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it(
    'supports daily reveal, saves completed readings to history, and can reset after reading',
    () => {
      render(<App shuffleDelayMs={0} />)

      expect(
        screen.getByRole('heading', { name: '每日一张牌' }),
      ).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: '揭晓今日能量' }))
      expect(screen.getByRole('heading', { name: '今日提示' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '分享今日抽牌' })).toBeEnabled()

      const drawButton = screen.getByRole('button', { name: '洗牌并抽牌' })
      expect(drawButton).toBeDisabled()

      fireEvent.change(screen.getByLabelText('占卜问题'), {
        target: { value: '我该如何面对下一步的关系选择？' },
      })
      fireEvent.click(screen.getByRole('button', { name: /爱情/ }))
      fireEvent.click(screen.getByRole('button', { name: /过去 \/ 现在 \/ 未来/ }))

      expect(drawButton).toBeEnabled()

      fireEvent.click(drawButton)

      expect(screen.getByText('过去')).toBeInTheDocument()
      expect(screen.getByText('现在')).toBeInTheDocument()
      expect(screen.getByText('未来')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: '全部揭晓' }))

      expect(screen.getByRole('heading', { name: '问卜之题' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: '牌阵揭晓' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: '逐张解读' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: '综合结论' })).toBeInTheDocument()
      expect(screen.getAllByRole('heading', { name: '行动建议' })).toHaveLength(2)
      expect(screen.getAllByText('我该如何面对下一步的关系选择？')).toHaveLength(3)
      expect(screen.getByRole('button', { name: '分享这次结果' })).toBeEnabled()

      expect(
        screen.getByRole('heading', { name: '本地历史记录' }),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '收起详情' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: '牌阵回看' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: '关键信号' })).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: '重新占卜' }))

      expect(screen.getByLabelText('占卜问题')).toHaveValue('')
      expect(screen.getByRole('button', { name: '洗牌并抽牌' })).toBeDisabled()
    },
    20000,
  )
})
