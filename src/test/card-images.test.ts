import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CARD_ART_MANIFEST } from '../data/artManifest'
import { TAROT_DECK } from '../data/cards'

describe('rws card image mapping', () => {
  it('resolves local image urls for all 78 cards', () => {
    expect(TAROT_DECK).toHaveLength(78)

    for (const card of TAROT_DECK) {
      const art = CARD_ART_MANIFEST[card.id]
      expect(art.imageUrl).toBe(`/cards/rws/${card.id}.jpg`)
    }
  })

  it('has downloaded assets on disk for every card id', () => {
    for (const card of TAROT_DECK) {
      const filePath = join(process.cwd(), 'public', 'cards', 'rws', `${card.id}.jpg`)
      expect(existsSync(filePath)).toBe(true)
    }
  })
})

