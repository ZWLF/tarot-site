import { afterEach, describe, expect, it, vi } from 'vitest'
import { shareText } from '../lib/share'

describe('share helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('falls back to clipboard when Web Share is unavailable', async () => {
    const clipboardWriteText = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(window.navigator, 'share', {
      configurable: true,
      value: undefined,
    })
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: { writeText: clipboardWriteText },
    })

    const message = await shareText('浮世占', '测试分享文案')

    expect(message).toBe('分享文案已复制到剪贴板。')
    expect(clipboardWriteText).toHaveBeenCalledWith('测试分享文案')
  })
})
