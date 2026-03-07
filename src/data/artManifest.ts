import type { CardArtManifest } from '../domain/tarot'
import { TAROT_DECK } from './cards'

type AccentToken = CardArtManifest['accentToken']

const SUIT_ACCENTS: Record<string, AccentToken> = {
  wands: 'crimson',
  cups: 'azure',
  swords: 'gold',
  pentacles: 'jade',
}

export const CARD_ART_MANIFEST: Record<string, CardArtManifest> =
  Object.fromEntries(
    TAROT_DECK.map((card) => {
      const accentToken =
        card.arcana === 'major'
          ? card.number % 2 === 0
            ? 'gold'
            : 'azure'
          : SUIT_ACCENTS[card.suit]

      return [
        card.id,
        {
          cardId: card.id,
          label: card.arcana === 'major' ? '命运纹样' : '浮世纹样',
          accentToken,
        },
      ]
    }),
  )
