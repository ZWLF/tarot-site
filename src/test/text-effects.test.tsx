import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RevealText } from '../components/RevealText'

describe('text effects', () => {
  it('keeps reveal headings queryable by accessible name', () => {
    render(<RevealText as="h2" text="记录中心" />)

    expect(screen.getByRole('heading', { name: '记录中心' })).toBeInTheDocument()
  })
})
