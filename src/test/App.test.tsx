import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'

describe('App tarot flow', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it(
    'supports draw, action plan, follow-up, save history, and encyclopedia flow',
    () => {
      render(<App shuffleDelayMs={0} />)

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

      expect(screen.getByRole('heading', { name: '占卜后行动计划' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: '追问模式' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: '78 张牌卡百科' })).toBeInTheDocument()

      const actionCheckboxes = screen.getAllByRole('checkbox')
      expect(actionCheckboxes.length).toBeGreaterThan(0)
      fireEvent.click(actionCheckboxes[0])
      expect(actionCheckboxes[0]).toBeChecked()

      fireEvent.change(screen.getByLabelText('追问问题'), {
        target: { value: '如果我先保持距离，会发生什么变化？' },
      })
      fireEvent.click(screen.getByRole('button', { name: '生成追问解读' }))

      expect(screen.getByText('追问 1')).toBeInTheDocument()
      expect(screen.getByText('“如果我先保持距离，会发生什么变化？”')).toBeInTheDocument()

      fireEvent.change(screen.getByLabelText('保存标题'), {
        target: { value: '关系选择占卜' },
      })
      fireEvent.change(screen.getByLabelText('保存标签'), {
        target: { value: '感情, 决策' },
      })
      fireEvent.click(screen.getByRole('button', { name: '保存到历史' }))

      expect(screen.getByText('已保存到历史占卜，可以按分类和标签回看。')).toBeInTheDocument()
      expect(screen.getByText('关系选择占卜')).toBeInTheDocument()

      const savedRaw = window.localStorage.getItem('ukiyo-tarot.saved-readings')
      expect(savedRaw).not.toBeNull()
      expect(savedRaw).toContain('关系选择占卜')

      fireEvent.click(screen.getByRole('button', { name: '开启新一轮占卜' }))

      expect(screen.getByLabelText('占卜问题')).toHaveValue('')
      expect(screen.getByRole('button', { name: '洗牌并抽牌' })).toBeDisabled()
    },
    20000,
  )
})
