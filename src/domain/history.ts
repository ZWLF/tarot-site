import type { Orientation, ReadingResult } from './tarot'

export interface SavedReadingCard {
  positionLabel: string
  cardName: string
  orientation: Orientation
}

export interface SavedReadingEntry {
  id: string
  createdAt: string
  question: string
  topicId: ReadingResult['input']['topic']
  topicLabel: string
  spreadId: ReadingResult['spread']['id']
  spreadTitle: string
  tone: string
  summary: string
  advice: string[]
  dominantSignals: string[]
  cards: SavedReadingCard[]
}
