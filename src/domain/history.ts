import type {
  DailyReflection,
  Orientation,
  ReadingResult,
  SavedActionPlanStep,
  TopicId,
} from './tarot'

export interface SavedReadingCard {
  positionLabel: string
  cardName: string
  orientation: Orientation
}

export interface SavedReadingEntry {
  id: string
  createdAt: string
  question: string
  topicId: TopicId
  topicLabel: string
  spreadId: ReadingResult['spread']['id']
  spreadTitle: string
  tone: string
  summary: string
  advice: string[]
  dominantSignals: string[]
  cards: SavedReadingCard[]
}

export interface LegacySavedReadingRecord {
  id: string
  title: string
  category: TopicId
  tags: string[]
  createdAt: string
  question: string
  spreadTitle: string
  topicLabel: string
  tone: string
  summary: string
  dominantSignals: string[]
  cards: SavedReadingCard[]
  actionPlan: SavedActionPlanStep[]
  followUps: unknown[]
  dailyReflection?: DailyReflection
}
