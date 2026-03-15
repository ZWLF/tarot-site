import { TAROT_DECK } from './cards'

export const CARD_IMAGE_CREDIT =
  'Rider-Waite-Smith tarot deck (1909), public domain via Wikimedia Commons.'

export interface CardImageAsset {
  detailJpgUrl: string
  detailWebpUrl: string
  thumbnailJpgUrl: string
  thumbnailWebpUrl: string
}

export const CARD_IMAGE_ASSET_BY_ID: Record<string, CardImageAsset> = Object.fromEntries(
  TAROT_DECK.map((card) => [
    card.id,
    {
      detailJpgUrl: `/cards/rws/${card.id}.jpg`,
      detailWebpUrl: `/cards/rws/detail-webp/${card.id}.webp`,
      thumbnailJpgUrl: `/cards/rws/thumb-jpg/${card.id}.jpg`,
      thumbnailWebpUrl: `/cards/rws/thumb-webp/${card.id}.webp`,
    } satisfies CardImageAsset,
  ]),
)

export const CARD_IMAGE_BY_ID: Record<string, string> = Object.fromEntries(
  TAROT_DECK.map((card) => [card.id, CARD_IMAGE_ASSET_BY_ID[card.id].detailJpgUrl]),
)

