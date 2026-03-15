import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CARD_ART_MANIFEST } from '../data/artManifest'
import { CARD_IMAGE_ASSET_BY_ID } from '../data/cardImages'
import { TAROT_DECK } from '../data/cards'

describe('rws card image mapping', () => {
  it('resolves local image urls for all 78 cards', () => {
    expect(TAROT_DECK).toHaveLength(78)

    for (const card of TAROT_DECK) {
      const art = CARD_ART_MANIFEST[card.id]
      const imageAsset = CARD_IMAGE_ASSET_BY_ID[card.id]

      expect(art.imageUrl).toBe(imageAsset.detailJpgUrl)
      expect(imageAsset.thumbnailJpgUrl).toBe(`/cards/rws/thumb-jpg/${card.id}.jpg`)
      expect(imageAsset.thumbnailWebpUrl).toBe(`/cards/rws/thumb-webp/${card.id}.webp`)
      expect(imageAsset.detailWebpUrl).toBe(`/cards/rws/detail-webp/${card.id}.webp`)
    }
  })

  it('has generated thumbnail and webp assets on disk for every card id', () => {
    for (const card of TAROT_DECK) {
      expect(
        existsSync(join(process.cwd(), 'public', 'cards', 'rws', `${card.id}.jpg`)),
      ).toBe(true)
      expect(
        existsSync(
          join(process.cwd(), 'public', 'cards', 'rws', 'thumb-jpg', `${card.id}.jpg`),
        ),
      ).toBe(true)
      expect(
        existsSync(
          join(process.cwd(), 'public', 'cards', 'rws', 'thumb-webp', `${card.id}.webp`),
        ),
      ).toBe(true)
      expect(
        existsSync(
          join(process.cwd(), 'public', 'cards', 'rws', 'detail-webp', `${card.id}.webp`),
        ),
      ).toBe(true)
    }
  })
})
