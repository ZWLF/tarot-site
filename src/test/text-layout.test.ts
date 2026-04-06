import { describe, expect, it } from 'vitest'
import {
  layoutParagraphLines,
  measureNaturalTextWidth,
  measureParagraph,
} from '../lib/textLayout'

describe('text layout adapter', () => {
  it('measures paragraph height with max-lines cap', () => {
    const metrics = measureParagraph({
      font: '400 16px Inter, "PingFang SC", "Noto Sans SC", sans-serif',
      lineHeight: 24,
      maxLines: 2,
      maxWidth: 96,
      text: '这是一个用于测试多行文本布局的长句子。',
    })

    expect(metrics.lineCount).toBeLessThanOrEqual(2)
    expect(metrics.height).toBeGreaterThan(0)
    expect(['fallback', 'pretext']).toContain(metrics.measured)
  })

  it('layouts text lines and truncates with ellipsis', () => {
    const lines = layoutParagraphLines({
      font: '400 16px Inter, "PingFang SC", "Noto Sans SC", sans-serif',
      lineHeight: 24,
      maxLines: 1,
      maxWidth: 100,
      text: '这是一个非常非常长的句子，需要被截断。',
    })

    expect(lines.lines).toHaveLength(1)
    expect(lines.lines[0]?.endsWith('…')).toBe(true)
    expect(lines.truncated).toBe(true)
  })

  it('returns a positive natural width estimate', () => {
    const measured = measureNaturalTextWidth({
      font: '600 16px Inter, "PingFang SC", "Noto Sans SC", sans-serif',
      text: '本月核心主题',
    })

    expect(measured.width).toBeGreaterThan(0)
    expect(['fallback', 'pretext']).toContain(measured.measured)
  })
})

