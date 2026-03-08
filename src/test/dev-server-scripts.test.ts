import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('Windows dev server scripts', () => {
  const startScript = readFileSync('start-dev-server.cmd', 'utf8')
  const stopScript = readFileSync('stop-dev-server.cmd', 'utf8')

  it('defaults the helper scripts to the safe local port 4173', () => {
    expect(startScript).toContain('if "%PORT%"=="" set "PORT=4173"')
    expect(stopScript).toContain('if "%PORT%"=="" set "PORT=4173"')
  })

  it('checks startup readiness and handles missing servers explicitly', () => {
    expect(startScript).toContain('Dev server did not become ready')
    expect(startScript).toContain('Port {0} is not available on this machine')
    expect(stopScript).toContain('No dev server found on port {0}.')
  })
})
