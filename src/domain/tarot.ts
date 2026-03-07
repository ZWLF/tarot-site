export type TopicId =
  | 'general'
  | 'love'
  | 'career'
  | 'relationships'
  | 'growth'

export type Arcana = 'major' | 'minor'
export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles' | null
export type Orientation = 'up' | 'down'

interface TarotCardBase {
  id: string
  nameZh: string
  nameEn: string
  number: number
  keywords: {
    up: string[]
    down: string[]
  }
  meaning: {
    up: string
    down: string
  }
  adviceTags: string[]
  elementTags: string[]
}

export interface MajorArcanaCard extends TarotCardBase {
  arcana: 'major'
  suit: null
}

export interface MinorArcanaCard extends TarotCardBase {
  arcana: 'minor'
  suit: Exclude<Suit, null>
}

export type TarotCard = MajorArcanaCard | MinorArcanaCard

export interface SpreadPosition {
  key: string
  label: string
  prompt: string
}

export interface SpreadDefinition {
  id: string
  title: string
  description: string
  cardCount: number
  positions: SpreadPosition[]
}

export interface ReadingInput {
  question: string
  topic: TopicId
  spreadId: string
}

export interface DrawnCard {
  cardId: string
  orientation: Orientation
  positionKey: string
}

export interface CardArtManifest {
  cardId: string
  label: string
  imageSrc?: string
  accentToken: 'gold' | 'crimson' | 'azure' | 'jade'
}

export interface ReadingCardView {
  drawn: DrawnCard
  card: TarotCard
  art: CardArtManifest
  positionLabel: string
  prompt: string
}

export interface PositionReading {
  positionKey: string
  label: string
  prompt: string
  cardId: string
  cardName: string
  orientation: Orientation
  message: string
  keywords: string[]
}

export interface ReadingResult {
  input: ReadingInput
  spread: SpreadDefinition
  cards: ReadingCardView[]
  positionReadings: PositionReading[]
  summary: string
  advice: string[]
  tone: string
  dominantSignals: string[]
}
