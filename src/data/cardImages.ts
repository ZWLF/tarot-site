import { TAROT_DECK } from './cards'

const CARD_ASSET_BASE_URL = import.meta.env.BASE_URL

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
      detailJpgUrl: `${CARD_ASSET_BASE_URL}cards/rws/${card.id}.jpg`,
      detailWebpUrl: `${CARD_ASSET_BASE_URL}cards/rws/detail-webp/${card.id}.webp`,
      thumbnailJpgUrl: `${CARD_ASSET_BASE_URL}cards/rws/thumb-jpg/${card.id}.jpg`,
      thumbnailWebpUrl: `${CARD_ASSET_BASE_URL}cards/rws/thumb-webp/${card.id}.webp`,
    } satisfies CardImageAsset,
  ]),
)

export const CARD_IMAGE_BY_ID: Record<string, string> = Object.fromEntries(
  TAROT_DECK.map((card) => [card.id, CARD_IMAGE_ASSET_BY_ID[card.id].detailJpgUrl]),
)
