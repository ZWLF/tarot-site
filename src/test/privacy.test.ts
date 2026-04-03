import { describe, expect, it } from 'vitest'
import { buildPrivacyCsp } from '../lib/privacy'

describe('privacy policy helpers', () => {
  it('builds a CSP that blocks external uploads and framing', () => {
    const csp = buildPrivacyCsp()

    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("connect-src 'self'")
    expect(csp).toContain("form-action 'self'")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
  })
})
