import type { LegacySavedReadingRecord, SavedReadingEntry } from '../domain/history'
import type {
  DailyReflection,
  FollowUpRecord,
  ReadingPreferences,
  ReadingRecord,
  ReadingRecordV2,
  ReadingResult,
  SavedActionPlanStep,
} from '../domain/tarot'
import { TOPIC_BY_ID } from '../data/topics'
import { buildLocalDateKey } from '../lib/localDate'

const RECORDS_KEY = 'ukiyo-tarot.records-v3'
const V2_RECORDS_KEY = 'ukiyo-tarot.records-v2'
const GUIDE_DISMISSED_KEY = 'ukiyo-tarot.guide-dismissed'
const PREFERENCES_KEY = 'ukiyo-tarot.reading-preferences'
const LEGACY_SAVED_KEY = 'ukiyo-tarot.saved-readings'
const LEGACY_HISTORY_KEY = 'ukiyo-tarot:reading-history'
const MAX_RECORDS = 120

const DEFAULT_READING_PREFERENCES: ReadingPreferences = {
  deckPerformanceMode: 'auto',
  shuffleSpeed: 'normal',
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

const depthLevelRank = (level: ReadingRecord['depthLevel']) => {
  if (level === 'deep') {
    return 3
  }

  if (level === 'standard') {
    return 2
  }

  return 1
}

export const normalizeReadingRecords = (records: ReadingRecord[]) =>
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

const createDefaultDepthFields = (summary: string, dominantSignals: string[] = []) => ({
  depthLevel: 'standard' as const,
  depthSignals: dominantSignals.slice(0, 4),
  ruleHits: [] as string[],
  queryFlags: [] as string[],
  interpretationSummary: summary,
})

const migrateLegacySavedRecord = (record: LegacySavedReadingRecord): ReadingRecord => {
  const spreadMeta = getLegacySpreadMeta(undefined, record.spreadTitle, record.cards)

  return {
    version: 3,
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
    ...createDefaultDepthFields(record.summary, record.dominantSignals),
  }
}

const migrateLegacyHistoryEntry = (entry: SavedReadingEntry): ReadingRecord => {
  const spreadMeta = getLegacySpreadMeta(entry.spreadId, entry.spreadTitle, entry.cards)

  return {
    version: 3,
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
    ...createDefaultDepthFields(entry.summary, entry.dominantSignals),
  }
}

const migrateReadingRecordV2 = (record: ReadingRecordV2): ReadingRecord => ({
  ...record,
  version: 3,
  ...createDefaultDepthFields(record.summary, record.dominantSignals),
})

const migrateLegacyRecords = () => {
  const legacySaved = readJson<LegacySavedReadingRecord[]>(LEGACY_SAVED_KEY, [])
  const legacyHistory = readJson<SavedReadingEntry[]>(LEGACY_HISTORY_KEY, [])

  return mergeReadingRecords([
    ...legacySaved.map(migrateLegacySavedRecord),
    ...legacyHistory.map(migrateLegacyHistoryEntry),
  ])
}

export const toReadingRecord = (value: unknown): ReadingRecord | null => {
  if (isReadingRecordV3(value)) {
    return value
  }

  if (isReadingRecordV2(value)) {
    return migrateReadingRecordV2(value)
  }

  return null
}

export const mergeReadingRecords = (records: ReadingRecord[]) => {
  const map = new Map<string, ReadingRecord>()

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
      updatedAt: record.updatedAt > existing.updatedAt ? record.updatedAt : existing.updatedAt,
      depthLevel:
        depthLevelRank(record.depthLevel) >= depthLevelRank(existing.depthLevel)
          ? record.depthLevel
          : existing.depthLevel,
      depthSignals:
        record.depthSignals.length > 0 ? record.depthSignals : existing.depthSignals,
      ruleHits:
        record.ruleHits.length > 0
          ? Array.from(new Set([...existing.ruleHits, ...record.ruleHits]))
          : existing.ruleHits,
      queryFlags:
        record.queryFlags.length > 0
          ? Array.from(new Set([...existing.queryFlags, ...record.queryFlags]))
          : existing.queryFlags,
      interpretationSummary:
        record.interpretationSummary || existing.interpretationSummary || record.summary,
      version: 3,
    })
  }

  return normalizeReadingRecords(Array.from(map.values()))
}

export const loadReadingRecords = (): ReadingRecord[] => {
  const storedV3Records = readJson<ReadingRecord[]>(RECORDS_KEY, [])
  const normalizedV3 = storedV3Records
    .map((record) => toReadingRecord(record))
    .filter((record): record is ReadingRecord => record !== null)

  if (normalizedV3.length > 0) {
    return normalizeReadingRecords(normalizedV3)
  }

  const storedV2Records = readJson<ReadingRecordV2[]>(V2_RECORDS_KEY, [])
  const migratedV2 = storedV2Records.map(migrateReadingRecordV2)
  const migratedLegacy = migrateLegacyRecords()
  const migrated = mergeReadingRecords([...migratedV2, ...migratedLegacy])

  if (migrated.length > 0) {
    writeJson(RECORDS_KEY, migrated)
  }

  return migrated
}

export const storeReadingRecords = (records: ReadingRecord[]) => {
  const normalizedRecords = normalizeReadingRecords(records)
  writeJson(RECORDS_KEY, normalizedRecords)
  return normalizedRecords
}

export const saveReadingRecord = (record: ReadingRecord) => {
  const records = mergeReadingRecords([record, ...loadReadingRecords()])
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
  return `daily-${buildLocalDateKey(date)}`
}

interface RecordOptions {
  recordId?: string
  createdAt?: string
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
): ReadingRecord => {
  const now = new Date().toISOString()
  const createdAt = options.createdAt ?? now

  return {
    version: 3,
    id: options.recordId ?? buildReadingRecordId(reading),
    kind: 'reading',
    saved: options.saved,
    createdAt,
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
    depthLevel: reading.depthLevel,
    depthSignals: reading.interpretation.depthSignals,
    ruleHits: reading.interpretation.ruleHits,
    queryFlags: reading.interpretation.queryFlags,
    interpretationSummary: reading.summary,
  }
}

export const buildDailyRecord = (
  reading: ReadingResult,
  date: Date,
  reflection: DailyReflection = createBaseReflection(),
): ReadingRecord => {
  const iso = date.toISOString()

  return {
    version: 3,
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
    depthLevel: reading.depthLevel,
    depthSignals: reading.interpretation.depthSignals,
    ruleHits: reading.interpretation.ruleHits,
    queryFlags: reading.interpretation.queryFlags,
    interpretationSummary: reading.summary,
  }
}

export const loadGuideDismissed = () => readJson<boolean>(GUIDE_DISMISSED_KEY, false)

export const storeGuideDismissed = (value: boolean) => {
  writeJson(GUIDE_DISMISSED_KEY, value)
}

const sanitizePreferences = (
  value: Partial<ReadingPreferences> | null | undefined,
): ReadingPreferences => ({
  deckPerformanceMode:
    value?.deckPerformanceMode === 'auto' ||
    value?.deckPerformanceMode === 'full' ||
    value?.deckPerformanceMode === 'lite'
      ? value.deckPerformanceMode
      : DEFAULT_READING_PREFERENCES.deckPerformanceMode,
  shuffleSpeed:
    value?.shuffleSpeed === 'fast' ||
    value?.shuffleSpeed === 'normal' ||
    value?.shuffleSpeed === 'slow'
      ? value.shuffleSpeed
      : DEFAULT_READING_PREFERENCES.shuffleSpeed,
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

const isReadingRecordV2 = (value: unknown): value is ReadingRecordV2 => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Partial<ReadingRecordV2>

  return (
    record.version === 2 &&
    typeof record.id === 'string' &&
    (record.kind === 'reading' || record.kind === 'daily') &&
    typeof record.question === 'string' &&
    Array.isArray(record.cards) &&
    Array.isArray(record.tags) &&
    Array.isArray(record.followUps) &&
    Array.isArray(record.actionPlan)
  )
}

const isReadingRecordV3 = (value: unknown): value is ReadingRecord => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Partial<ReadingRecord>

  return (
    record.version === 3 &&
    typeof record.id === 'string' &&
    (record.kind === 'reading' || record.kind === 'daily') &&
    typeof record.question === 'string' &&
    Array.isArray(record.cards) &&
    Array.isArray(record.tags) &&
    Array.isArray(record.followUps) &&
    Array.isArray(record.actionPlan) &&
    (record.depthLevel === 'shallow' ||
      record.depthLevel === 'standard' ||
      record.depthLevel === 'deep') &&
    Array.isArray(record.depthSignals) &&
    Array.isArray(record.ruleHits) &&
    Array.isArray(record.queryFlags)
  )
}

export const exportReadingRecordsJson = (records: ReadingRecord[]) =>
  JSON.stringify(
    {
      version: 2,
      exportedAt: new Date().toISOString(),
      recordCount: records.length,
      records: normalizeReadingRecords([...records]),
    },
    null,
    2,
  )

export const parseReadingRecordsJson = (raw: string) => {
  const parsed = JSON.parse(raw) as
    | { records?: unknown }
    | Array<ReadingRecord | ReadingRecordV2>
    | undefined

  const rawRecords = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.records)
      ? parsed.records
      : []

  return normalizeReadingRecords(
    rawRecords
      .map((record) => toReadingRecord(record))
      .filter((record): record is ReadingRecord => record !== null),
  )
}
