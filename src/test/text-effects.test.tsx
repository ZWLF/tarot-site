import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BlurText } from '../components/BlurText'
import { RevealText } from '../components/RevealText'

describe('text effects', () => {
  it('keeps reveal headings queryable by accessible name', () => {
    render(<RevealText as="h2" text="记录中心" />)

    expect(screen.getByRole('heading', { name: '记录中心' })).toBeInTheDocument()
  })

  it('renders blur text without hiding readable summary content', () => {
    render(<BlurText text="抽到的牌面提醒你放慢节奏。" />)

    expect(screen.getByText('抽到的牌面提醒你放慢节奏。')).toBeInTheDocument()
  })
})
