import { TAROT_DECK } from './cards'

export const CARD_IMAGE_CREDIT =
  'Rider-Waite-Smith tarot deck (1909), public domain via Wikimedia Commons.'

export const CARD_IMAGE_BY_ID: Record<string, string> = Object.fromEntries(
  TAROT_DECK.map((card) => [card.id, `/cards/rws/${card.id}.jpg`]),
)

