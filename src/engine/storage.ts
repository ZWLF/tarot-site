import type { LegacySavedReadingRecord, SavedReadingEntry } from '../domain/history'
import type {
  DailyReflection,
  FollowUpRecord,
  ReadingPreferences,
  ReadingRecordV2,
  ReadingResult,
  SavedActionPlanStep,
} from '../domain/tarot'
import { TOPIC_BY_ID } from '../data/topics'

const RECORDS_KEY = 'ukiyo-tarot.records-v2'
const GUIDE_DISMISSED_KEY = 'ukiyo-tarot.guide-dismissed'
const PREFERENCES_KEY = 'ukiyo-tarot.reading-preferences'
const LEGACY_SAVED_KEY = 'ukiyo-tarot.saved-readings'
const LEGACY_HISTORY_KEY = 'ukiyo-tarot:reading-history'
const MAX_RECORDS = 120

const DEFAULT_READING_PREFERENCES: ReadingPreferences = {
  shuffleSpeed: 'normal',
  shuffleIntensity: 'medium',
  orientationMode: 'random',
}

const canUseStorage = () =>
  typeof window !== 'undefined' && window.localStorage !== undefined

const readJson = <T>(key: string, fallback: T) => {
  if (!canUseStorage()) {
    return fallback
  }

  try {
    const rawValue = window.localStorage.getItem(key)

    if (!rawValue) {
      return fallback
    }

    return JSON.parse(rawValue) as T
  } catch {
    return fallback
  }
}

const writeJson = (key: string, value: unknown) => {
  if (!canUseStorage()) {
    return
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage write failures.
  }
}

const hashContent = (value: string) => {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }

  return hash.toString(36)
}

const normalizeRecords = (records: ReadingRecordV2[]) =>
  records
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, MAX_RECORDS)

const getLegacySpreadMeta = (
  spreadId: string | undefined,
  spreadTitle: string,
  cards: Array<{ positionLabel: string }>,
) => {
  if (
    spreadId === 'past-present-future' ||
    spreadTitle.includes('过去') ||
    cards.every((card) => ['过去', '现在', '未来'].includes(card.positionLabel))
  ) {
    return {
      spreadId: 'holy-triangle',
      spreadTitle: '圣三角',
      variantId: 'timeline',
      variantTitle: '过去 / 现在 / 未来',
    }
  }

  if (
    spreadId === 'situation-obstacle-advice' ||
    spreadTitle.includes('阻碍') ||
    cards.every((card) => ['现状', '阻碍', '建议'].includes(card.positionLabel))
  ) {
    return {
      spreadId: 'holy-triangle',
      spreadTitle: '圣三角',
      variantId: 'diagnostic',
      variantTitle: '现状 / 阻碍 / 建议',
    }
  }

  return {
    spreadId: spreadId ?? (cards.length === 1 ? 'single-guidance' : 'weekly-flow'),
    spreadTitle,
    variantId: undefined,
    variantTitle: undefined,
  }
}

const toSavedSteps = (
  actionPlan: SavedActionPlanStep[] | undefined,
): SavedActionPlanStep[] => actionPlan ?? []

const migrateLegacySavedRecord = (
  record: LegacySavedReadingRecord,
): ReadingRecordV2 => {
  const spreadMeta = getLegacySpreadMeta(undefined, record.spreadTitle, record.cards)

  return {
    version: 2,
    id: record.id,
    kind: 'reading',
    saved: true,
    createdAt: record.createdAt,
    updatedAt: record.createdAt,
    title: record.title,
    question: record.question,
    topicId: record.category,
    topicLabel: record.topicLabel || TOPIC_BY_ID[record.category].label,
    spreadId: spreadMeta.spreadId,
    spreadTitle: spreadMeta.spreadTitle,
    variantId: spreadMeta.variantId,
    variantTitle: spreadMeta.variantTitle,
    tone: record.tone,
    summary: record.summary,
    dominantSignals: record.dominantSignals,
    tags: record.tags,
    cards: record.cards.map((card, index) => ({
      positionLabel: card.positionLabel,
      cardId: `legacy-${record.id}-${index}`,
      cardName: card.cardName,
      orientation: card.orientation,
    })),
    actionPlan: toSavedSteps(record.actionPlan),
    followUps: (record.followUps as FollowUpRecord[]) ?? [],
    dailyReflection: {
      morningIntent: '',
      eveningReview: '',
      resonance: null,
    },
  }
}

const migrateLegacyHistoryEntry = (
  entry: SavedReadingEntry,
): ReadingRecordV2 => {
  const spreadMeta = getLegacySpreadMeta(entry.spreadId, entry.spreadTitle, entry.cards)

  return {
    version: 2,
    id: entry.id,
    kind: 'reading',
    saved: false,
    createdAt: entry.createdAt,
    updatedAt: entry.createdAt,
    title: entry.question,
    question: entry.question,
    topicId: entry.topicId,
    topicLabel: entry.topicLabel,
    spreadId: spreadMeta.spreadId,
    spreadTitle: spreadMeta.spreadTitle,
    variantId: spreadMeta.variantId,
    variantTitle: spreadMeta.variantTitle,
    tone: entry.tone,
    summary: entry.summary,
    dominantSignals: entry.dominantSignals,
    tags: [],
    cards: entry.cards.map((card, index) => ({
      positionLabel: card.positionLabel,
      cardId: `legacy-${entry.id}-${index}`,
      cardName: card.cardName,
      orientation: card.orientation,
    })),
    actionPlan: [],
    followUps: [],
    dailyReflection: {
      morningIntent: '',
      eveningReview: '',
      resonance: null,
    },
  }
}

const mergeRecords = (records: ReadingRecordV2[]) => {
  const map = new Map<string, ReadingRecordV2>()

  for (const record of records) {
    const existing = map.get(record.id)

    if (!existing) {
      map.set(record.id, record)
      continue
    }

    map.set(record.id, {
      ...existing,
      ...record,
      saved: existing.saved || record.saved,
      title:
        record.saved && record.title
          ? record.title
          : existing.saved && existing.title
            ? existing.title
            : record.title || existing.title,
      tags: record.tags.length > 0 ? record.tags : existing.tags,
      actionPlan:
        record.saved && record.actionPlan.length > 0
          ? record.actionPlan
          : existing.saved && existing.actionPlan.length > 0
            ? existing.actionPlan
            : record.actionPlan.length > 0
              ? record.actionPlan
              : existing.actionPlan,
      followUps: record.followUps.length > 0 ? record.followUps : existing.followUps,
      dailyReflection:
        record.dailyReflection.morningIntent ||
        record.dailyReflection.eveningReview ||
        record.dailyReflection.resonance
          ? record.dailyReflection
          : existing.dailyReflection,
      updatedAt:
        record.updatedAt > existing.updatedAt ? record.updatedAt : existing.updatedAt,
    })
  }

  return normalizeRecords(Array.from(map.values()))
}

const migrateLegacyRecords = () => {
  const legacySaved = readJson<LegacySavedReadingRecord[]>(LEGACY_SAVED_KEY, [])
  const legacyHistory = readJson<SavedReadingEntry[]>(LEGACY_HISTORY_KEY, [])

  return mergeRecords([
    ...legacySaved.map(migrateLegacySavedRecord),
    ...legacyHistory.map(migrateLegacyHistoryEntry),
  ])
}

export const loadReadingRecords = (): ReadingRecordV2[] => {
  const storedRecords = readJson<ReadingRecordV2[]>(RECORDS_KEY, [])

  if (storedRecords.length > 0) {
    return normalizeRecords(storedRecords)
  }

  const migrated = migrateLegacyRecords()

  if (migrated.length > 0) {
    writeJson(RECORDS_KEY, migrated)
  }

  return migrated
}

export const storeReadingRecords = (records: ReadingRecordV2[]) => {
  writeJson(RECORDS_KEY, normalizeRecords(records))
}

export const saveReadingRecord = (record: ReadingRecordV2) => {
  const records = mergeRecords([record, ...loadReadingRecords()])
  storeReadingRecords(records)
  return records
}

export const buildReadingRecordId = (reading: ReadingResult) =>
  `reading-${hashContent(
    [
      reading.input.question.trim(),
      reading.input.topic,
      reading.spread.id,
      reading.spread.activeVariantId ?? '',
      ...reading.cards.map(
        (entry) =>
          `${entry.drawn.positionKey}:${entry.card.id}:${entry.drawn.orientation}`,
      ),
    ].join('|'),
  )}`

export const buildDailyRecordId = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `daily-${year}-${month}-${day}`
}

interface RecordOptions {
  recordId?: string
  saved: boolean
  title: string
  tags: string[]
  actionPlanDoneIds: string[]
  followUps: FollowUpRecord[]
}

const createBaseReflection = (): DailyReflection => ({
  morningIntent: '',
  eveningReview: '',
  resonance: null,
})

export const buildReadingRecordFromReading = (
  reading: ReadingResult,
  options: RecordOptions,
): ReadingRecordV2 => {
  const now = new Date().toISOString()

  return {
    version: 2,
    id: options.recordId ?? buildReadingRecordId(reading),
    kind: 'reading',
    saved: options.saved,
    createdAt: now,
    updatedAt: now,
    title: options.title || reading.input.question,
    question: reading.input.question,
    topicId: reading.input.topic,
    topicLabel: TOPIC_BY_ID[reading.input.topic].label,
    spreadId: reading.spread.id,
    spreadTitle: reading.spread.title,
    variantId: reading.spread.activeVariantId,
    variantTitle: reading.spread.activeVariantTitle,
    tone: reading.tone,
    summary: reading.summary,
    dominantSignals: reading.dominantSignals,
    tags: options.tags,
    cards: reading.cards.map((entry) => ({
      positionLabel: entry.positionLabel,
      cardId: entry.card.id,
      cardName: entry.card.nameZh,
      orientation: entry.drawn.orientation,
    })),
    actionPlan: reading.actionPlan.map((step) => ({
      ...step,
      done: options.actionPlanDoneIds.includes(step.id),
    })),
    followUps: options.followUps,
    dailyReflection: createBaseReflection(),
  }
}

export const buildDailyRecord = (
  reading: ReadingResult,
  date: Date,
  reflection: DailyReflection,
): ReadingRecordV2 => {
  const iso = date.toISOString()

  return {
    version: 2,
    id: buildDailyRecordId(date),
    kind: 'daily',
    saved: false,
    createdAt: iso,
    updatedAt: iso,
    title: `每日一张 · ${new Intl.DateTimeFormat('zh-CN', {
      month: 'numeric',
      day: 'numeric',
    }).format(date)}`,
    question: reading.input.question,
    topicId: 'general',
    topicLabel: TOPIC_BY_ID.general.label,
    spreadId: reading.spread.id,
    spreadTitle: reading.spread.title,
    variantId: reading.spread.activeVariantId,
    variantTitle: reading.spread.activeVariantTitle,
    tone: reading.tone,
    summary: reading.summary,
    dominantSignals: reading.dominantSignals,
    tags: ['每日一张'],
    cards: reading.cards.map((entry) => ({
      positionLabel: entry.positionLabel,
      cardId: entry.card.id,
      cardName: entry.card.nameZh,
      orientation: entry.drawn.orientation,
    })),
    actionPlan: reading.actionPlan.map((step) => ({
      ...step,
      done: false,
    })),
    followUps: [],
    dailyReflection: reflection,
  }
}

export const loadGuideDismissed = () => readJson<boolean>(GUIDE_DISMISSED_KEY, false)

export const storeGuideDismissed = (value: boolean) => {
  writeJson(GUIDE_DISMISSED_KEY, value)
}

const sanitizePreferences = (
  value: Partial<ReadingPreferences> | null | undefined,
): ReadingPreferences => ({
  shuffleSpeed:
    value?.shuffleSpeed === 'fast' ||
    value?.shuffleSpeed === 'normal' ||
    value?.shuffleSpeed === 'slow'
      ? value.shuffleSpeed
      : DEFAULT_READING_PREFERENCES.shuffleSpeed,
  shuffleIntensity:
    value?.shuffleIntensity === 'low' ||
    value?.shuffleIntensity === 'medium' ||
    value?.shuffleIntensity === 'high'
      ? value.shuffleIntensity
      : DEFAULT_READING_PREFERENCES.shuffleIntensity,
  orientationMode:
    value?.orientationMode === 'up-only' || value?.orientationMode === 'random'
      ? value.orientationMode
      : DEFAULT_READING_PREFERENCES.orientationMode,
})

export const loadReadingPreferences = () =>
  sanitizePreferences(readJson<Partial<ReadingPreferences>>(PREFERENCES_KEY, {}))

export const saveReadingPreferences = (value: ReadingPreferences) => {
  writeJson(PREFERENCES_KEY, sanitizePreferences(value))
}
