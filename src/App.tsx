import { useEffect, useRef, useState, type CSSProperties } from 'react'
import './App.css'
import { BlurText } from './components/BlurText'
import { CardEncyclopedia } from './components/CardEncyclopedia'
import { DeckStage } from './components/DeckStage'
import { GuidePanel } from './components/GuidePanel'
import { RecordCenter, type RecordDateFilter } from './components/RecordCenter'
import { RevealText } from './components/RevealText'
import { SpreadLayoutBoard } from './components/SpreadLayoutBoard'
import { TarotCardButton } from './components/TarotCardButton'
import { SPREADS } from './data/spreads'
import { TOPICS, TOPIC_BY_ID } from './data/topics'
import type {
  DailyReflection,
  FollowUpRecord,
  ReadingPreferences,
  ReadingResult,
  TopicId,
} from './domain/tarot'
import { createReading, getSpreadPreviewPositions } from './engine/reading'
import {
  buildDailyRecord,
  buildReadingRecordFromReading,
  buildReadingRecordId,
  loadGuideDismissed,
  loadReadingPreferences,
  loadReadingRecords,
  saveReadingPreferences,
  saveReadingRecord,
  storeGuideDismissed,
} from './engine/storage'
import { createDailyReading, formatDailyLabel } from './lib/daily'
import { buildReadingShareText, downloadPosterPng, shareText } from './lib/share'

interface AppProps {
  shuffleDelayMs?: number
}

type RecordFilter = 'all' | 'saved' | 'auto' | 'daily'

const SHUFFLE_DELAY_BY_SPEED: Record<ReadingPreferences['shuffleSpeed'], number> = {
  fast: 480,
  normal: 980,
  slow: 1450,
}
const RE_DRAW_CONFIRM_WINDOW_MS = 30_000

const FOLLOW_UP_SUGGESTIONS = [
  '如果我主动推进一次，会发生什么？',
  '这件事最值得优先处理的动作是什么？',
  '我需要先停下来校准什么？',
]

const NAV_ITEMS = [
  { id: 'daily', label: '每日一张' },
  { id: 'reading', label: '开始占卜' },
  { id: 'result', label: '结果解读' },
  { id: 'records', label: '记录中心' },
  { id: 'encyclopedia', label: '牌卡百科' },
] as const

const createId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

const createDefaultTitle = (question: string) =>
  question.trim().length <= 18 ? question.trim() : `${question.trim().slice(0, 18)}…`

const parseTags = (value: string) =>
  Array.from(
    new Set(
        value
        .split(/[，,、\s]+/)
        .map((entry) => entry.trim())
        .filter(Boolean),
    ),
  )

const createEmptyReflection = (): DailyReflection => ({
  morningIntent: '',
  eveningReview: '',
  resonance: null,
})

const createFollowUpRecord = (
  question: string,
  reading: ReadingResult,
): FollowUpRecord => ({
  id: createId(),
  question,
  createdAt: new Date().toISOString(),
  summary: reading.summary,
  tone: reading.tone,
  dominantSignals: reading.dominantSignals,
  leadAdvice: reading.advice[0] ?? '先记录你此刻最强烈的直觉。',
  cards: reading.cards.map((entry) => ({
    positionLabel: entry.positionLabel,
    cardName: entry.card.nameZh,
    orientation: entry.drawn.orientation,
  })),
})

const scrollToSection = (sectionId: string) => {
  const section = document.getElementById(sectionId)

  if (typeof section?.scrollIntoView !== 'function') {
    return
  }

  section.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

function App({ shuffleDelayMs }: AppProps) {
  const [navSection, setNavSection] =
    useState<(typeof NAV_ITEMS)[number]['id']>('daily')
  const [question, setQuestion] = useState('')
  const [topic, setTopic] = useState<TopicId | null>(null)
  const [spreadId, setSpreadId] = useState<string | null>(null)
  const [variantId, setVariantId] = useState<string | undefined>(undefined)
  const [reading, setReading] = useState<ReadingResult | null>(null)
  const [revealedPositions, setRevealedPositions] = useState<string[]>([])
  const [isShuffling, setIsShuffling] = useState(false)
  const [deckHighlights, setDeckHighlights] = useState<string[]>([])
  const [actionPlanDoneIds, setActionPlanDoneIds] = useState<string[]>([])
  const [followUpQuestion, setFollowUpQuestion] = useState('')
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>([])
  const [recordTitle, setRecordTitle] = useState('')
  const [recordTagsInput, setRecordTagsInput] = useState('')
  const [drawNotice, setDrawNotice] = useState<string | null>(null)
  const [recordNotice, setRecordNotice] = useState<string | null>(null)
  const [shareMessage, setShareMessage] = useState<string | null>(null)
  const [records, setRecords] = useState(() => loadReadingRecords())
  const [recordFilter, setRecordFilter] = useState<RecordFilter>('all')
  const [recordQuery, setRecordQuery] = useState('')
  const [recordTagFilter, setRecordTagFilter] = useState('')
  const [recordDateFilter, setRecordDateFilter] = useState<RecordDateFilter>('all')
  const [compareSelection, setCompareSelection] = useState<string[]>([])
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null)
  const [guideDismissed, setGuideDismissed] = useState(() => loadGuideDismissed())
  const [preferences, setPreferences] = useState(() => loadReadingPreferences())
  const [needsReDrawConfirm, setNeedsReDrawConfirm] = useState(false)
  const [dailyDate] = useState(() => new Date())
  const [dailyReading] = useState(() => createDailyReading(dailyDate))
  const [dailyLabel] = useState(() => formatDailyLabel(dailyDate))
  const [dailyRevealed, setDailyRevealed] = useState(false)
  const [dailyReflection, setDailyReflection] = useState<DailyReflection>(
    createEmptyReflection,
  )
  const [dailyMessage, setDailyMessage] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)
  const lastDrawRef = useRef<{ signature: string; timestamp: number } | null>(null)

  const selectedTopic = topic ? TOPIC_BY_ID[topic] : null
  const selectedSpread = spreadId
    ? SPREADS.find((entry) => entry.id === spreadId) ?? null
    : null
  const selectedVariant =
    selectedSpread?.variants?.find((entry) => entry.id === variantId) ?? null
  const currentRecord =
    currentRecordId !== null
      ? records.find((entry) => entry.id === currentRecordId) ?? null
      : reading
        ? records.find((entry) => entry.id === buildReadingRecordId(reading)) ?? null
        : null
  const canDraw =
    question.trim().length > 0 &&
    topic !== null &&
    spreadId !== null &&
    !isShuffling
  const effectiveShuffleDelayMs =
    shuffleDelayMs ?? SHUFFLE_DELAY_BY_SPEED[preferences.shuffleSpeed]
  const allRevealed =
    reading !== null && revealedPositions.length === reading.cards.length
  const featuredCardIds = Array.from(
    new Set([
      ...(reading?.cards.map((entry) => entry.card.id) ?? []),
      ...(dailyRevealed ? [dailyReading.cards[0].card.id] : []),
    ]),
  )

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    storeGuideDismissed(guideDismissed)
  }, [guideDismissed])

  useEffect(() => {
    saveReadingPreferences(preferences)
  }, [preferences])

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const active = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0]

        if (active?.target.id) {
          setNavSection(active.target.id as (typeof NAV_ITEMS)[number]['id'])
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.2, 0.45, 0.75] },
    )

    NAV_ITEMS.forEach((entry) => {
      const element = document.getElementById(entry.id)

      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [])

  const resetReDrawGuard = () => {
    setNeedsReDrawConfirm(false)
    setDrawNotice(null)
  }

  const persistReadingRecord = (
    saved: boolean,
    message: string | null = null,
    nextActionPlanDoneIds = actionPlanDoneIds,
    nextFollowUps = followUps,
  ) => {
    if (!reading) {
      return
    }

    const nextRecord = buildReadingRecordFromReading(reading, {
      recordId: currentRecord?.id ?? buildReadingRecordId(reading),
      saved: saved || currentRecord?.saved || false,
      title: recordTitle.trim() || currentRecord?.title || reading.input.question,
      tags: parseTags(recordTagsInput),
      actionPlanDoneIds: nextActionPlanDoneIds,
      followUps: nextFollowUps,
    })

    setRecords(saveReadingRecord(nextRecord))
    setCurrentRecordId(nextRecord.id)

    if (message) {
      setRecordNotice(message)
    }
  }

  const applyReading = (nextReading: ReadingResult) => {
    setReading(nextReading)
    setIsShuffling(false)
    setRevealedPositions([])
    setActionPlanDoneIds([])
    setFollowUps([])
    setFollowUpQuestion('')
    setCurrentRecordId(null)
    setRecordTitle(createDefaultTitle(nextReading.input.question))
    setRecordTagsInput(
      `${TOPIC_BY_ID[nextReading.input.topic].label} ${nextReading.spread.title}`,
    )
    setRecordNotice(null)
    setShareMessage(null)
    setNavSection('result')
    window.requestAnimationFrame(() => scrollToSection('result'))
  }

  const handleSelectSpread = (nextSpreadId: string) => {
    const nextSpread = SPREADS.find((entry) => entry.id === nextSpreadId)
    resetReDrawGuard()
    setSpreadId(nextSpreadId)
    setVariantId(nextSpread?.variants?.[0]?.id)
  }

  const handleDraw = () => {
    if (!canDraw || topic === null || spreadId === null) {
      return
    }

    const signature = `${question.trim()}|${topic}|${spreadId}|${variantId ?? 'base'}`
    const now = Date.now()
    const previous = lastDrawRef.current

    if (
      !needsReDrawConfirm &&
      previous !== null &&
      previous.signature === signature &&
      now - previous.timestamp <= RE_DRAW_CONFIRM_WINDOW_MS
    ) {
      setNeedsReDrawConfirm(true)
      setDrawNotice('30 秒内重复抽牌，请再次点击“洗牌并抽牌”确认重抽。')
      return
    }

    setNeedsReDrawConfirm(false)
    setDrawNotice(null)
    lastDrawRef.current = { signature, timestamp: now }

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
    }

    const nextReading = createReading(
      {
        question: question.trim(),
        topic,
        spreadId,
        variantId,
      },
      {
        seed: `${now}-${question.trim()}-${topic}-${spreadId}-${variantId ?? 'base'}`,
        orientationMode: preferences.orientationMode,
      },
    )

    setReading(null)
    setRevealedPositions([])
    setDeckHighlights(nextReading.cards.map((entry) => entry.card.id))
    setRecordNotice(null)
    setShareMessage(null)

    if (effectiveShuffleDelayMs <= 0) {
      applyReading(nextReading)
      return
    }

    setIsShuffling(true)
    timerRef.current = window.setTimeout(
      () => applyReading(nextReading),
      effectiveShuffleDelayMs,
    )
  }

  const handleReveal = (positionKey: string) => {
    if (!reading || revealedPositions.includes(positionKey)) {
      return
    }

    const nextRevealedPositions = [...revealedPositions, positionKey]
    setRevealedPositions(nextRevealedPositions)

    if (nextRevealedPositions.length === reading.cards.length) {
      persistReadingRecord(false, '本次解读已自动归档。')
    }
  }

  const handleRevealAll = () => {
    if (!reading) {
      return
    }

    setRevealedPositions(reading.cards.map((entry) => entry.drawn.positionKey))
    persistReadingRecord(false, '本次解读已自动归档。')
  }

  const handleToggleActionPlan = (stepId: string) => {
    const nextActionPlanDoneIds = actionPlanDoneIds.includes(stepId)
      ? actionPlanDoneIds.filter((id) => id !== stepId)
      : [...actionPlanDoneIds, stepId]

    setActionPlanDoneIds(nextActionPlanDoneIds)

    if (reading && allRevealed) {
      persistReadingRecord(false, null, nextActionPlanDoneIds)
    }
  }

  const handleFollowUp = () => {
    if (!reading || followUpQuestion.trim().length === 0) {
      return
    }

    const nextFollowUps = [
      createFollowUpRecord(followUpQuestion.trim(), reading),
      ...followUps,
    ].slice(0, 6)

    setFollowUps(nextFollowUps)
    setFollowUpQuestion('')
    setRecordNotice('已记录新的追问线索。')

    if (allRevealed) {
      persistReadingRecord(false, null, actionPlanDoneIds, nextFollowUps)
    }
  }

  const handleSaveReading = () => {
    if (!reading) {
      return
    }

    persistReadingRecord(true, '已加入收藏。')
  }

  const handleShareReading = async () => {
    if (!reading) {
      return
    }

    try {
      const message = await shareText(
        '浮世塔罗',
        buildReadingShareText(reading, TOPIC_BY_ID[reading.input.topic].label),
      )
      setShareMessage(message)
    } catch (error) {
      setShareMessage(error instanceof Error ? error.message : '分享失败。')
    }
  }

  const handleDownloadReadingPoster = async () => {
    if (!reading) {
      return
    }

    try {
      const title = recordTitle.trim() || reading.input.question
      const message = await downloadPosterPng(
        {
          title,
          question: reading.input.question,
          spreadTitle: `${reading.spread.title}${
            reading.spread.activeVariantTitle ? ` · ${reading.spread.activeVariantTitle}` : ''
          }`,
          summary: reading.summary,
          cards: reading.cards.map((entry) => ({
            label: entry.positionLabel,
            cardName: entry.card.nameZh,
            orientation: entry.drawn.orientation,
          })),
        },
        `${title.replaceAll(/\s+/g, '-')}.png`,
      )
      setShareMessage(message)
    } catch (error) {
      setShareMessage(error instanceof Error ? error.message : '海报导出失败。')
    }
  }

  const handleSaveDaily = () => {
    const nextRecord = buildDailyRecord(dailyReading, dailyDate, dailyReflection)
    setRecords(saveReadingRecord(nextRecord))
    setDailyMessage('今日记录已写入记录中心。')
  }

  const handleShareDaily = async () => {
    try {
      const message = await shareText(
        '浮世塔罗 · 每日一张',
        buildReadingShareText(dailyReading, TOPIC_BY_ID.general.label),
      )
      setDailyMessage(message)
    } catch (error) {
      setDailyMessage(error instanceof Error ? error.message : '分享失败。')
    }
  }

  const handleDownloadDailyPoster = async () => {
    try {
      const message = await downloadPosterPng(
        {
          title: `每日一张 · ${dailyLabel}`,
          question: dailyReading.input.question,
          spreadTitle: dailyReading.spread.title,
          summary: dailyReading.summary,
          cards: dailyReading.cards.map((entry) => ({
            label: entry.positionLabel,
            cardName: entry.card.nameZh,
            orientation: entry.drawn.orientation,
          })),
        },
        `daily-${dailyDate.toISOString().slice(0, 10)}.png`,
      )
      setDailyMessage(message)
    } catch (error) {
      setDailyMessage(error instanceof Error ? error.message : '海报导出失败。')
    }
  }

  const handleToggleCompare = (recordId: string) => {
    setCompareSelection((current) => {
      const validCurrent = current.filter((id) =>
        records.some((record) => record.id === id),
      )

      if (validCurrent.includes(recordId)) {
        return validCurrent.filter((id) => id !== recordId)
      }

      if (validCurrent.length >= 2) {
        return validCurrent
      }

      return [...validCurrent, recordId]
    })
  }

  const handleClearCompare = () => {
    setCompareSelection([])
  }

  const normalizedCompareSelection = compareSelection.filter((id) =>
    records.some((record) => record.id === id),
  )

  return (
    <div className="app-shell">
      <header className="hero panel">
        <div className="hero__seal">
          <span className="hero__seal-mark">浮世</span>
          <span className="hero__seal-sub">UKIYO TAROT</span>
        </div>
        <div className="hero__copy">
          <p className="eyebrow">Tarot Salon</p>
          <RevealText
            as="h1"
            className="hero__title"
            text="把抽到的 78 张牌，真正铺上桌面。"
          />
          <p className="hero__lede">
            浮世塔罗把每日一张、深度牌阵、记录归档、追问与分享海报接成一条完整的解读动线。
          </p>
          <div className="hero__meta">
            <span>78 张独立牌面</span>
            <span>11 套牌阵</span>
            <span>本地记录中心</span>
            <span>PNG 海报导出</span>
          </div>
        </div>
      </header>

      <div className="layout">
        <nav className="panel section step-nav" aria-label="页面导航">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              aria-label={`跳转到 ${item.label}`}
              className={`pill ${navSection === item.id ? 'is-active' : ''}`}
              type="button"
              onClick={() => {
                setNavSection(item.id)
                scrollToSection(item.id)
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <section className="panel section daily-panel" id="daily">
          <div className="section__heading">
            <div>
              <p className="eyebrow">Daily Card</p>
              <RevealText as="h2" text="每日一张与复盘" />
            </div>
            <span className="section__count">{dailyLabel}</span>
          </div>

          <div className="daily-layout">
            <div className="daily-copy">
              <p className="section__lede">
                先看今天最值得留意的能量，再补上晨间意图与晚间复盘，把一次抽牌变成可回看的记录。
              </p>

              <div className="draw-summary__actions">
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => setDailyRevealed(true)}
                >
                  揭晓今日能量
                </button>
                <button className="ghost-button" type="button" onClick={handleShareDaily}>
                  分享今日卡面
                </button>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={handleDownloadDailyPoster}
                >
                  下载今日海报
                </button>
              </div>

              <label className="inline-input">
                <span>晨间意图</span>
                <input
                  aria-label="晨间意图"
                  placeholder="今天想稳住什么，或想练习什么？"
                  type="text"
                  value={dailyReflection.morningIntent}
                  onChange={(event) =>
                    setDailyReflection((current) => ({
                      ...current,
                      morningIntent: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="inline-input">
                <span>晚间复盘</span>
                <textarea
                  aria-label="晚间复盘"
                  placeholder="晚上回看时，这张牌和你的现实有没有对上？"
                  value={dailyReflection.eveningReview}
                  onChange={(event) =>
                    setDailyReflection((current) => ({
                      ...current,
                      eveningReview: event.target.value,
                    }))
                  }
                />
              </label>

              <div className="utility-toggle utility-toggle--wrap">
                <button
                  className={`pill ${
                    dailyReflection.resonance === 'strong' ? 'is-active' : ''
                  }`}
                  type="button"
                  onClick={() =>
                    setDailyReflection((current) => ({ ...current, resonance: 'strong' }))
                  }
                >
                  强共鸣
                </button>
                <button
                  className={`pill ${
                    dailyReflection.resonance === 'mixed' ? 'is-active' : ''
                  }`}
                  type="button"
                  onClick={() =>
                    setDailyReflection((current) => ({ ...current, resonance: 'mixed' }))
                  }
                >
                  一般
                </button>
                <button
                  className={`pill ${
                    dailyReflection.resonance === 'low' ? 'is-active' : ''
                  }`}
                  type="button"
                  onClick={() =>
                    setDailyReflection((current) => ({ ...current, resonance: 'low' }))
                  }
                >
                  不共鸣
                </button>
              </div>

              <div className="draw-summary__actions">
                <button className="primary-button" type="button" onClick={handleSaveDaily}>
                  保存今日记录
                </button>
                {dailyMessage ? <p className="selection-note">{dailyMessage}</p> : null}
              </div>
            </div>

            <div className="daily-card-slot">
              <TarotCardButton
                entry={dailyReading.cards[0]}
                onReveal={() => setDailyRevealed(true)}
                revealed={dailyRevealed}
              />
            </div>
          </div>
        </section>

        <GuidePanel
          dismissed={guideDismissed}
          onDismiss={() => setGuideDismissed(true)}
          onRestore={() => setGuideDismissed(false)}
        />

        <section className="panel section" id="reading">
          <div className="section__heading">
            <div>
              <p className="eyebrow">Reading Studio</p>
              <RevealText as="h2" text="问题、主题与牌阵" />
            </div>
            <span className="section__count">
              {selectedSpread ? `${selectedSpread.cardCount} 张牌` : '先选好问题'}
            </span>
          </div>

          <label className="question-field">
            <span>占卜问题</span>
            <textarea
              aria-label="占卜问题"
              placeholder="把问题写得更具体，例如：我接下来该怎样处理这段关系？"
              value={question}
              onChange={(event) => {
                resetReDrawGuard()
                setQuestion(event.target.value)
              }}
            />
          </label>

          <div className="topic-selector utility-row">
            <div className="pill-grid">
              {TOPICS.map((entry) => (
                <button
                  key={entry.id}
                  aria-label={entry.label}
                  className={`pill ${topic === entry.id ? 'is-active' : ''}`}
                  type="button"
                  onClick={() => {
                    resetReDrawGuard()
                    setTopic(entry.id)
                  }}
                >
                  <span>{entry.label}</span>
                  <small>{entry.motto}</small>
                </button>
              ))}
            </div>
            {selectedTopic ? <p className="selection-note">{selectedTopic.framing}</p> : null}
          </div>

          <div className="spread-grid">
            {SPREADS.map((spread) => {
              const previewPositions = getSpreadPreviewPositions(
                spread.layoutId,
                spread.id === selectedSpread?.id && selectedVariant
                  ? selectedVariant.positions
                  : spread.variants?.[0]?.positions ?? spread.positions,
              )

              return (
                <button
                  key={spread.id}
                  aria-label={spread.id === 'daily-energy' ? '每日一张牌阵' : spread.title}
                  className={`spread-card ${spreadId === spread.id ? 'is-active' : ''}`}
                  type="button"
                  onClick={() => handleSelectSpread(spread.id)}
                >
                  <div className="spread-card__topline">
                    <span>{spread.cardCount} 张</span>
                    <span>{spread.layoutId}</span>
                  </div>
                  <h3>{spread.title}</h3>
                  <p>{spread.description}</p>
                  <div className={`spread-preview spread-preview--${spread.layoutId}`}>
                    {previewPositions.map((position) => (
                      <span
                        key={`${spread.id}-${position.key}`}
                        className="spread-preview__dot"
                        style={
                          {
                            '--preview-x': `${position.x}%`,
                            '--preview-y': `${position.y}%`,
                          } as CSSProperties
                        }
                      />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>

          {selectedSpread?.variants ? (
            <div className="utility-row utility-row--stack">
              <div className="section__heading section__heading--compact">
                <div>
                  <p className="eyebrow">Spread Mode</p>
                  <RevealText as="h2" text={`${selectedSpread.title}模式`} />
                </div>
              </div>
              <div className="utility-toggle utility-toggle--wrap">
                {selectedSpread.variants.map((entry) => (
                  <button
                    key={entry.id}
                    className={`pill ${variantId === entry.id ? 'is-active' : ''}`}
                    type="button"
                    onClick={() => {
                      resetReDrawGuard()
                      setVariantId(entry.id)
                    }}
                  >
                    {entry.title}
                  </button>
                ))}
              </div>
              {selectedVariant ? (
                <p className="selection-note">{selectedVariant.description}</p>
              ) : null}
            </div>
          ) : null}

          <div className="draw-summary">
            <div className="draw-summary__row">
              <span>当前组合</span>
              <p>
                {selectedTopic?.label ?? '未选主题'} · {selectedSpread?.title ?? '未选牌阵'}
                {selectedVariant ? ` · ${selectedVariant.title}` : ''}
              </p>
            </div>

            <div className="draw-preferences">
              <label className="inline-input">
                <span>洗牌速度</span>
                <select
                  value={preferences.shuffleSpeed}
                  onChange={(event) =>
                    setPreferences((current) => ({
                      ...current,
                      shuffleSpeed: event.target.value as ReadingPreferences['shuffleSpeed'],
                    }))
                  }
                >
                  <option value="fast">快</option>
                  <option value="normal">中</option>
                  <option value="slow">慢</option>
                </select>
              </label>
              <label className="inline-input">
                <span>翻牌模式</span>
                <select
                  value={preferences.orientationMode}
                  onChange={(event) =>
                    setPreferences((current) => ({
                      ...current,
                      orientationMode: event.target.value as ReadingPreferences['orientationMode'],
                    }))
                  }
                >
                  <option value="random">随机正逆位</option>
                  <option value="up-only">仅正位</option>
                </select>
              </label>
            </div>

            <div className="draw-summary__actions">
              <button
                className="primary-button"
                disabled={!canDraw}
                type="button"
                onClick={handleDraw}
              >
                {needsReDrawConfirm ? '再次点击确认重抽' : '洗牌并抽牌'}
              </button>
            </div>
            {drawNotice ? <p className="selection-note">{drawNotice}</p> : null}
            <p className="selection-note">
              重抽规则：同一问题在 30 秒内重复抽牌时，会先提示确认，避免无意识反复重抽。
            </p>
          </div>
        </section>

        <DeckStage
          highlightedCardIds={deckHighlights}
          isShuffling={isShuffling}
        />

        <section className="panel section" id="result">
          <div className="section__heading">
            <div>
              <p className="eyebrow">Result</p>
              <RevealText as="h2" text={reading ? '结果解读' : '等待抽牌'} />
            </div>
            {reading ? <span className="section__count">{reading.tone}</span> : null}
          </div>

          {reading ? (
            <>
              <p className="question-echo">{reading.input.question}</p>
              <div className="signal-strip">
                <span>{TOPIC_BY_ID[reading.input.topic].label}</span>
                <span>{reading.spread.title}</span>
                {reading.spread.activeVariantTitle ? (
                  <span>{reading.spread.activeVariantTitle}</span>
                ) : null}
                {reading.dominantSignals.map((signal) => (
                  <span key={signal}>{signal}</span>
                ))}
              </div>

              <div className="result-actions">
                <button className="primary-button" type="button" onClick={handleRevealAll}>
                  全部揭晓
                </button>
                <button className="ghost-button" type="button" onClick={handleShareReading}>
                  分享文案
                </button>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={handleDownloadReadingPoster}
                >
                  下载海报
                </button>
              </div>

              <SpreadLayoutBoard
                cards={reading.cards}
                onReveal={handleReveal}
                revealedPositions={revealedPositions}
                spread={reading.spread}
              />

              <div className="result-grid">
                <article className="result-panel">
                  <p className="eyebrow">Summary</p>
                  <RevealText as="h3" text="整体结论" />
                  <BlurText className="result-panel__summary" text={reading.summary} />
                </article>

                <article className="result-panel">
                  <p className="eyebrow">Advice</p>
                  <RevealText as="h3" text="行动建议" />
                  <ul className="advice-list">
                    {reading.advice.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>

                <article className="result-panel result-panel--wide">
                  <p className="eyebrow">Action Plan</p>
                  <RevealText as="h3" text="落地动作" />
                  <div className="action-plan-list">
                    {reading.actionPlan.map((step) => {
                      const checked = actionPlanDoneIds.includes(step.id)

                      return (
                        <label
                          key={step.id}
                          className={`check-card ${checked ? 'is-done' : ''}`}
                        >
                          <input
                            checked={checked}
                            type="checkbox"
                            onChange={() => handleToggleActionPlan(step.id)}
                          />
                          <div>
                            <strong>{step.title}</strong>
                            <p>{step.detail}</p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </article>

                <article className="result-panel result-panel--wide">
                  <p className="eyebrow">Follow Up</p>
                  <RevealText as="h3" text="追问延伸" />
                  <div className="suggestion-row">
                    {FOLLOW_UP_SUGGESTIONS.map((item) => (
                      <button
                        key={item}
                        className="pill"
                        type="button"
                        onClick={() => setFollowUpQuestion(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <label className="question-field question-field--compact">
                    <span>继续追问</span>
                    <textarea
                      placeholder="围绕当前牌面继续追问，例如：我最该先处理哪一个卡点？"
                      value={followUpQuestion}
                      onChange={(event) => setFollowUpQuestion(event.target.value)}
                    />
                  </label>
                  <div className="result-actions">
                    <button className="ghost-button" type="button" onClick={handleFollowUp}>
                      记录追问
                    </button>
                  </div>
                  {followUps.length > 0 ? (
                    <div className="follow-up-thread">
                      {followUps.map((entry) => (
                        <article key={entry.id} className="follow-up-card">
                          <strong>{entry.question}</strong>
                          <p>{entry.summary}</p>
                        </article>
                      ))}
                    </div>
                  ) : null}
                </article>

                <article className="result-panel result-panel--wide">
                  <p className="eyebrow">Record</p>
                  <RevealText as="h3" text="保存到记录中心" />
                  <div className="save-history-layout">
                    <label className="inline-input">
                      <span>记录标题</span>
                      <input
                        aria-label="记录标题"
                        type="text"
                        value={recordTitle}
                        onChange={(event) => setRecordTitle(event.target.value)}
                      />
                    </label>
                    <label className="inline-input">
                      <span>记录标签</span>
                      <input
                        aria-label="记录标签"
                        placeholder="关系 决策 长期"
                        type="text"
                        value={recordTagsInput}
                        onChange={(event) => setRecordTagsInput(event.target.value)}
                      />
                    </label>
                  </div>
                  <div className="result-actions">
                    <button className="primary-button" type="button" onClick={handleSaveReading}>
                      加入收藏
                    </button>
                    {recordNotice ? <p className="selection-note">{recordNotice}</p> : null}
                    {shareMessage ? <p className="selection-note">{shareMessage}</p> : null}
                  </div>
                </article>
              </div>
            </>
          ) : (
            <p className="selection-note">
              选好问题、主题与牌阵后开始抽牌。抽中的牌会先在 78 张牌桌里亮起，再落入对应布局。
            </p>
          )}
        </section>

        <RecordCenter
          filter={recordFilter}
          onFilterChange={setRecordFilter}
          onQueryChange={setRecordQuery}
          onTagFilterChange={setRecordTagFilter}
          onDateFilterChange={setRecordDateFilter}
          onToggleCompare={handleToggleCompare}
          onClearCompare={handleClearCompare}
          query={recordQuery}
          tagFilter={recordTagFilter}
          dateFilter={recordDateFilter}
          compareSelection={normalizedCompareSelection}
          records={records}
        />

        <section id="encyclopedia">
          <CardEncyclopedia featuredCardIds={featuredCardIds} />
        </section>
      </div>
    </div>
  )
}

export default App

