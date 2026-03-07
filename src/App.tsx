import { useEffect, useRef, useState } from 'react'
import './App.css'
import { CardEncyclopedia } from './components/CardEncyclopedia'
import { GuidePanel } from './components/GuidePanel'
import { TarotCardButton } from './components/TarotCardButton'
import { SPREADS } from './data/spreads'
import { TOPICS, TOPIC_BY_ID } from './data/topics'
import type {
  FollowUpRecord,
  ReadingResult,
  SavedReadingRecord,
  TopicId,
} from './domain/tarot'
import { createReading } from './engine/reading'
import {
  loadGuideDismissed,
  loadSavedReadings,
  storeGuideDismissed,
  storeSavedReadings,
} from './engine/storage'

interface AppProps {
  shuffleDelayMs?: number
}

type HistoryFilter = TopicId | 'all'

const FOLLOW_UP_SUGGESTIONS = [
  '如果我选择 A，会怎样发展？',
  '我现在最该先做什么？',
  '这段关系还值得继续投入吗？',
]

const createId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

const createDefaultTitle = (question: string) => {
  const trimmed = question.trim()

  if (trimmed.length <= 18) {
    return trimmed
  }

  return `${trimmed.slice(0, 18)}…`
}

const parseTags = (rawValue: string) =>
  Array.from(
    new Set(
      rawValue
        .split(/[，,、\s]+/)
        .map((entry) => entry.trim())
        .filter(Boolean),
    ),
  )

const formatTimestamp = (iso: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))

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
  leadAdvice: reading.advice[0] ?? '先记录你最强烈的直觉，再决定下一步。',
  cards: reading.cards.map((entry) => ({
    positionLabel: entry.positionLabel,
    cardName: entry.card.nameZh,
    orientation: entry.drawn.orientation,
  })),
})

function App({ shuffleDelayMs = 1200 }: AppProps) {
  const [question, setQuestion] = useState('')
  const [topic, setTopic] = useState<TopicId | null>(null)
  const [spreadId, setSpreadId] = useState<string | null>(null)
  const [reading, setReading] = useState<ReadingResult | null>(null)
  const [isShuffling, setIsShuffling] = useState(false)
  const [revealedPositions, setRevealedPositions] = useState<string[]>([])
  const [actionPlanDoneIds, setActionPlanDoneIds] = useState<string[]>([])
  const [followUpQuestion, setFollowUpQuestion] = useState('')
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>([])
  const [saveTitle, setSaveTitle] = useState('')
  const [saveCategory, setSaveCategory] = useState<TopicId>('general')
  const [saveTagsInput, setSaveTagsInput] = useState('')
  const [saveNotice, setSaveNotice] = useState<string | null>(null)
  const [savedReadings, setSavedReadings] = useState<SavedReadingRecord[]>(
    () => loadSavedReadings(),
  )
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all')
  const [historyQuery, setHistoryQuery] = useState('')
  const [guideDismissed, setGuideDismissed] = useState(() => loadGuideDismissed())
  const timerRef = useRef<number | null>(null)

  const selectedTopic = TOPICS.find((entry) => entry.id === topic) ?? null
  const selectedSpread = SPREADS.find((entry) => entry.id === spreadId) ?? null
  const isLocked = isShuffling || reading !== null
  const canDraw =
    question.trim().length > 0 &&
    topic !== null &&
    spreadId !== null &&
    !isShuffling &&
    reading === null
  const allRevealed =
    reading !== null && revealedPositions.length === reading.cards.length

  const filteredHistory = savedReadings.filter((entry) => {
    const matchesCategory =
      historyFilter === 'all' || entry.category === historyFilter
    const normalizedQuery = historyQuery.trim().toLowerCase()

    if (!matchesCategory) {
      return false
    }

    if (normalizedQuery.length === 0) {
      return true
    }

    return [
      entry.title,
      entry.question,
      entry.summary,
      entry.tags.join(' '),
      entry.topicLabel,
    ]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery)
  })

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    storeSavedReadings(savedReadings)
  }, [savedReadings])

  useEffect(() => {
    storeGuideDismissed(guideDismissed)
  }, [guideDismissed])

  const applyReading = (nextReading: ReadingResult) => {
    setReading(nextReading)
    setActionPlanDoneIds([])
    setFollowUpQuestion('')
    setFollowUps([])
    setSaveCategory(nextReading.input.topic)
    setSaveTitle(createDefaultTitle(nextReading.input.question))
    setSaveTagsInput(
      `${TOPIC_BY_ID[nextReading.input.topic].label}, ${nextReading.spread.title}`,
    )
    setSaveNotice(null)
  }

  const handleDraw = () => {
    if (!canDraw || topic === null || spreadId === null) {
      return
    }

    setRevealedPositions([])

    const nextReading = createReading(
      {
        question: question.trim(),
        topic,
        spreadId,
      },
      { seed: `${Date.now()}-${question.trim()}-${topic}-${spreadId}` },
    )

    if (shuffleDelayMs <= 0) {
      applyReading(nextReading)
      setIsShuffling(false)
      return
    }

    setIsShuffling(true)
    timerRef.current = window.setTimeout(() => {
      applyReading(nextReading)
      setIsShuffling(false)
    }, shuffleDelayMs)
  }

  const handleReveal = (positionKey: string) => {
    setRevealedPositions((current) =>
      current.includes(positionKey) ? current : [...current, positionKey],
    )
  }

  const handleRevealAll = () => {
    if (reading === null) {
      return
    }

    setRevealedPositions(reading.cards.map((entry) => entry.drawn.positionKey))
  }

  const handleReset = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }

    setQuestion('')
    setTopic(null)
    setSpreadId(null)
    setReading(null)
    setIsShuffling(false)
    setRevealedPositions([])
    setActionPlanDoneIds([])
    setFollowUpQuestion('')
    setFollowUps([])
    setSaveTitle('')
    setSaveCategory('general')
    setSaveTagsInput('')
    setSaveNotice(null)
  }

  const handleToggleActionPlan = (stepId: string) => {
    setActionPlanDoneIds((current) =>
      current.includes(stepId)
        ? current.filter((entry) => entry !== stepId)
        : [...current, stepId],
    )
  }

  const handleFollowUp = () => {
    if (reading === null || !allRevealed) {
      return
    }

    const nextQuestion = followUpQuestion.trim()

    if (nextQuestion.length === 0) {
      return
    }

    const followUpReading = createReading(
      {
        question: nextQuestion,
        topic: reading.input.topic,
        spreadId: reading.input.spreadId,
      },
      { seed: `${Date.now()}-${nextQuestion}-${followUps.length}` },
    )

    setFollowUps((current) => [
      ...current,
      createFollowUpRecord(nextQuestion, followUpReading),
    ])
    setFollowUpQuestion('')
  }

  const handleSaveReading = () => {
    if (reading === null || !allRevealed) {
      return
    }

    const normalizedTitle = saveTitle.trim() || createDefaultTitle(reading.input.question)
    const normalizedTags = parseTags(saveTagsInput)

    const record: SavedReadingRecord = {
      id: createId(),
      title: normalizedTitle,
      category: saveCategory,
      tags: normalizedTags,
      createdAt: new Date().toISOString(),
      question: reading.input.question,
      spreadTitle: reading.spread.title,
      topicLabel: TOPIC_BY_ID[saveCategory].label,
      tone: reading.tone,
      summary: reading.summary,
      dominantSignals: reading.dominantSignals,
      cards: reading.cards.map((entry) => ({
        positionLabel: entry.positionLabel,
        cardName: entry.card.nameZh,
        orientation: entry.drawn.orientation,
      })),
      actionPlan: reading.actionPlan.map((step) => ({
        ...step,
        done: actionPlanDoneIds.includes(step.id),
      })),
      followUps,
    }

    setSavedReadings((current) => [record, ...current])
    setSaveTitle(normalizedTitle)
    setSaveTagsInput(normalizedTags.join('、'))
    setSaveNotice('已保存到历史占卜，可以按分类和标签回看。')
  }

  return (
    <div className="app-shell">
      <div className="app-shell__mist app-shell__mist--left" />
      <div className="app-shell__mist app-shell__mist--right" />

      <header className="hero panel">
        <div className="hero__seal">
          <span className="hero__seal-mark">浮世塔罗</span>
          <span className="hero__seal-sub">Tarot Reading</span>
        </div>

        <div className="hero__copy">
          <p className="eyebrow">Ukiyo Tarot Salon</p>
          <h1>纸上星轨，问心抽牌</h1>
          <p className="hero__lede">
            以浮世绘风格展开一场中文塔罗体验。除了完成占卜，你还可以继续追问、查看牌卡百科、
            生成行动计划，并把结果保存成真正可回看的历史记录。
          </p>

          <div className="hero__meta">
            <span>完整 78 张牌</span>
            <span>支持正位 / 逆位</span>
            <span>占后行动计划</span>
            <span>追问与历史保存</span>
          </div>
        </div>
      </header>

      <main className="layout">
        <GuidePanel
          dismissed={guideDismissed}
          onDismiss={() => setGuideDismissed(true)}
          onRestore={() => setGuideDismissed(false)}
        />

        <section className="panel section">
          <div className="section__heading">
            <div>
              <p className="eyebrow">Step 01</p>
              <h2>写下你的占卜问题</h2>
            </div>
            <span className="section__count">{question.trim().length} 字</span>
          </div>

          <label className="question-field">
            <span>占卜问题</span>
            <textarea
              aria-label="占卜问题"
              disabled={isLocked}
              maxLength={120}
              placeholder="例如：我接下来三个月是否适合转换职业方向？"
              rows={4}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />
          </label>

          <div className="topic-selector">
            <div className="section__heading section__heading--compact">
              <div>
                <p className="eyebrow">Step 02</p>
                <h2>选择问题主题</h2>
              </div>
            </div>

            <div className="pill-grid">
              {TOPICS.map((entry) => (
                <button
                  key={entry.id}
                  className={`pill ${entry.id === topic ? 'is-active' : ''}`}
                  disabled={isLocked}
                  type="button"
                  onClick={() => setTopic(entry.id)}
                >
                  <span>{entry.label}</span>
                  <small>{entry.motto}</small>
                </button>
              ))}
            </div>

            <p className="selection-note">
              {selectedTopic?.description ?? '主题会影响解读语气、重点和行动建议的方向。'}
            </p>
          </div>
        </section>

        <section className="panel section">
          <div className="section__heading">
            <div>
              <p className="eyebrow">Step 03</p>
              <h2>挑选你的牌阵</h2>
            </div>
          </div>

          <div className="spread-grid">
            {SPREADS.map((spread) => (
              <button
                key={spread.id}
                className={`spread-card ${spread.id === spreadId ? 'is-active' : ''}`}
                disabled={isLocked}
                type="button"
                onClick={() => setSpreadId(spread.id)}
              >
                <div className="spread-card__topline">
                  <span>{spread.cardCount} 张牌</span>
                  <span>{spread.positions.map((item) => item.label).join(' / ')}</span>
                </div>
                <h3>{spread.title}</h3>
                <p>{spread.description}</p>
              </button>
            ))}
          </div>
        </section>

        <section className={`panel section panel-draw ${isShuffling ? 'is-shuffling' : ''}`}>
          <div className="section__heading">
            <div>
              <p className="eyebrow">Step 04</p>
              <h2>洗牌与抽牌</h2>
            </div>
            {selectedSpread !== null ? (
              <span className="section__count">{selectedSpread.title}</span>
            ) : null}
          </div>

          <div className="draw-layout">
            <div className="deck-fan" aria-hidden="true">
              <span className="deck-fan__card deck-fan__card--one" />
              <span className="deck-fan__card deck-fan__card--two" />
              <span className="deck-fan__card deck-fan__card--three" />
            </div>

            <div className="draw-summary">
              <div className="draw-summary__row">
                <span>问题</span>
                <p>{question.trim() || '尚未写下问题'}</p>
              </div>
              <div className="draw-summary__row">
                <span>主题</span>
                <p>{selectedTopic?.label ?? '尚未选择'}</p>
              </div>
              <div className="draw-summary__row">
                <span>牌阵</span>
                <p>{selectedSpread?.title ?? '尚未选择'}</p>
              </div>

              <div className="draw-summary__actions">
                <button
                  className="primary-button"
                  disabled={!canDraw}
                  type="button"
                  onClick={handleDraw}
                >
                  {isShuffling ? '牌阵正在洗牌中…' : '洗牌并抽牌'}
                </button>

                <button
                  className="ghost-button"
                  disabled={isShuffling}
                  type="button"
                  onClick={handleReset}
                >
                  重新占卜
                </button>
              </div>

              <p className="selection-note">
                只有在问题、主题、牌阵都完整时，牌阵才会给出更具体的回应。
              </p>
            </div>
          </div>
        </section>

        {reading !== null ? (
          <section className="panel section">
            <div className="section__heading">
              <div>
                <p className="eyebrow">Step 05</p>
                <h2>翻开牌面</h2>
              </div>
              <span className="section__count">
                {revealedPositions.length} / {reading.cards.length}
              </span>
            </div>

            <div className="card-grid">
              {reading.cards.map((entry) => (
                <TarotCardButton
                  key={entry.drawn.positionKey}
                  entry={entry}
                  revealed={revealedPositions.includes(entry.drawn.positionKey)}
                  onReveal={() => handleReveal(entry.drawn.positionKey)}
                />
              ))}
            </div>

            <div className="result-actions">
              <button
                className="primary-button"
                disabled={allRevealed}
                type="button"
                onClick={handleRevealAll}
              >
                全部揭晓
              </button>
              <button className="ghost-button" type="button" onClick={handleReset}>
                开启新一轮占卜
              </button>
            </div>

            {!allRevealed ? (
              <p className="selection-note">
                点击每张牌翻面，完整解读会在全部揭晓后呈现。
              </p>
            ) : (
              <div className="result-grid">
                <article className="result-panel">
                  <p className="eyebrow">Section 01</p>
                  <h3>占卜之问</h3>
                  <p className="question-echo">“{reading.input.question}”</p>
                  <div className="signal-strip">
                    <span>{TOPIC_BY_ID[reading.input.topic].label}</span>
                    <span>{reading.spread.title}</span>
                    <span>{reading.tone}</span>
                  </div>
                </article>

                <article className="result-panel">
                  <p className="eyebrow">Section 02</p>
                  <h3>牌阵揭晓</h3>
                  <ul className="result-list">
                    {reading.cards.map((entry) => (
                      <li key={entry.drawn.positionKey}>
                        <strong>{entry.positionLabel}</strong>
                        <span>
                          {entry.card.nameZh} ·{' '}
                          {entry.drawn.orientation === 'up' ? '正位' : '逆位'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>

                <article className="result-panel result-panel--wide">
                  <p className="eyebrow">Section 03</p>
                  <h3>逐张解读</h3>
                  <div className="reading-entries">
                    {reading.positionReadings.map((entry) => (
                      <article key={entry.positionKey} className="reading-entry">
                        <div className="reading-entry__title">
                          <strong>{entry.label}</strong>
                          <span>{entry.cardName}</span>
                        </div>
                        <p>{entry.message}</p>
                        <div className="signal-strip">
                          {entry.keywords.map((keyword) => (
                            <span key={keyword}>{keyword}</span>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </article>

                <article className="result-panel">
                  <p className="eyebrow">Section 04</p>
                  <h3>综合结论</h3>
                  <p>{reading.summary}</p>
                  <div className="signal-strip">
                    {reading.dominantSignals.map((signal) => (
                      <span key={signal}>{signal}</span>
                    ))}
                  </div>
                </article>

                <article className="result-panel">
                  <p className="eyebrow">Section 05</p>
                  <h3>行动建议</h3>
                  <ul className="advice-list">
                    {reading.advice.map((entry) => (
                      <li key={entry}>{entry}</li>
                    ))}
                  </ul>
                </article>
              </div>
            )}
          </section>
        ) : null}

        {reading !== null && allRevealed ? (
          <>
            <section className="panel section">
              <div className="section__heading">
                <div>
                  <p className="eyebrow">Step 06</p>
                  <h2>占卜后行动计划</h2>
                </div>
                <span className="section__count">
                  {actionPlanDoneIds.length} / {reading.actionPlan.length}
                </span>
              </div>

              <p className="selection-note">
                把解读落成 3 个可执行步骤。你可以边做边勾选，确认自己是否真的往前走了。
              </p>

              <div className="action-plan-list">
                {reading.actionPlan.map((step, index) => {
                  const isDone = actionPlanDoneIds.includes(step.id)

                  return (
                    <label
                      key={step.id}
                      className={`check-card ${isDone ? 'is-done' : ''}`}
                    >
                      <input
                        checked={isDone}
                        type="checkbox"
                        onChange={() => handleToggleActionPlan(step.id)}
                      />
                      <div>
                        <span className="eyebrow">Step 0{index + 1}</span>
                        <strong>{step.title}</strong>
                        <p>{step.detail}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </section>

            <section className="panel section">
              <div className="section__heading">
                <div>
                  <p className="eyebrow">Step 07</p>
                  <h2>追问模式</h2>
                </div>
                <span className="section__count">{followUps.length} 条追问</span>
              </div>

              <div className="follow-up-layout">
                <article className="result-panel">
                  <h3>基于上一轮继续追问</h3>
                  <p>
                    追问会继承这次占卜的主题和牌阵，让你围绕“如果我选择 A 会怎样”
                    这类问题继续往下探索。
                  </p>

                  <div className="suggestion-row">
                    {FOLLOW_UP_SUGGESTIONS.map((entry) => (
                      <button
                        key={entry}
                        className="pill"
                        type="button"
                        onClick={() => setFollowUpQuestion(entry)}
                      >
                        <span>{entry}</span>
                        <small>一键填入</small>
                      </button>
                    ))}
                  </div>

                  <label className="question-field question-field--compact">
                    <span>你的追问</span>
                    <textarea
                      aria-label="追问问题"
                      placeholder="例如：如果我先保持距离，这段关系会发生什么变化？"
                      rows={3}
                      value={followUpQuestion}
                      onChange={(event) => setFollowUpQuestion(event.target.value)}
                    />
                  </label>

                  <button
                    className="primary-button"
                    type="button"
                    onClick={handleFollowUp}
                  >
                    生成追问解读
                  </button>
                </article>

                <div className="follow-up-thread">
                  {followUps.length > 0 ? (
                    followUps.map((entry, index) => (
                      <article key={entry.id} className="follow-up-card">
                        <div className="reading-entry__title">
                          <strong>追问 {index + 1}</strong>
                          <span>{formatTimestamp(entry.createdAt)}</span>
                        </div>
                        <p className="question-echo">“{entry.question}”</p>
                        <p>{entry.summary}</p>
                        <div className="signal-strip">
                          <span>{entry.tone}</span>
                          {entry.dominantSignals.map((signal) => (
                            <span key={`${entry.id}-${signal}`}>{signal}</span>
                          ))}
                        </div>
                        <p className="selection-note">行动提示：{entry.leadAdvice}</p>
                      </article>
                    ))
                  ) : (
                    <article className="result-panel">
                      <h3>连续解读会出现在这里</h3>
                      <p>第一次追问后，这里会形成一个轻量的对话式记录，帮助你继续比较不同选择。</p>
                    </article>
                  )}
                </div>
              </div>
            </section>

            <section className="panel section">
              <div className="section__heading">
                <div>
                  <p className="eyebrow">Step 08</p>
                  <h2>结果保存命名 / 分类</h2>
                </div>
                <span className="section__count">{savedReadings.length} 条历史</span>
              </div>

              <div className="save-history-layout">
                <article className="result-panel">
                  <h3>保存这次占卜</h3>

                  <label className="inline-input">
                    <span>标题</span>
                    <input
                      aria-label="保存标题"
                      placeholder="例如：三月职业转向判断"
                      type="text"
                      value={saveTitle}
                      onChange={(event) => setSaveTitle(event.target.value)}
                    />
                  </label>

                  <label className="inline-input">
                    <span>分类</span>
                    <select
                      aria-label="保存分类"
                      value={saveCategory}
                      onChange={(event) => setSaveCategory(event.target.value as TopicId)}
                    >
                      {TOPICS.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="inline-input">
                    <span>标签</span>
                    <input
                      aria-label="保存标签"
                      placeholder="例如：转职, 决策, 四月"
                      type="text"
                      value={saveTagsInput}
                      onChange={(event) => setSaveTagsInput(event.target.value)}
                    />
                  </label>

                  <button
                    className="primary-button"
                    type="button"
                    onClick={handleSaveReading}
                  >
                    保存到历史
                  </button>

                  {saveNotice ? <p className="selection-note">{saveNotice}</p> : null}
                </article>

                <article className="result-panel">
                  <h3>历史记录</h3>

                  <div className="utility-row utility-row--stack">
                    <div className="utility-toggle utility-toggle--wrap">
                      <button
                        className={`pill ${historyFilter === 'all' ? 'is-active' : ''}`}
                        type="button"
                        onClick={() => setHistoryFilter('all')}
                      >
                        <span>全部</span>
                        <small>查看所有记录</small>
                      </button>
                      {TOPICS.map((entry) => (
                        <button
                          key={entry.id}
                          className={`pill ${historyFilter === entry.id ? 'is-active' : ''}`}
                          type="button"
                          onClick={() => setHistoryFilter(entry.id)}
                        >
                          <span>{entry.label}</span>
                          <small>{entry.motto}</small>
                        </button>
                      ))}
                    </div>

                    <label className="inline-input">
                      <span>搜索历史</span>
                      <input
                        aria-label="搜索历史"
                        placeholder="标题、问题、标签"
                        type="text"
                        value={historyQuery}
                        onChange={(event) => setHistoryQuery(event.target.value)}
                      />
                    </label>
                  </div>

                  <div className="history-list">
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((entry) => (
                        <details key={entry.id} className="history-card">
                          <summary>
                            <div>
                              <strong>{entry.title}</strong>
                              <small>
                                {entry.topicLabel} · {entry.spreadTitle} ·{' '}
                                {formatTimestamp(entry.createdAt)}
                              </small>
                            </div>
                            <span>{entry.tags.length} 个标签</span>
                          </summary>

                          <p className="question-echo">“{entry.question}”</p>
                          <p>{entry.summary}</p>

                          <div className="signal-strip">
                            <span>{entry.tone}</span>
                            {entry.tags.map((tag) => (
                              <span key={`${entry.id}-${tag}`}>#{tag}</span>
                            ))}
                          </div>

                          <div className="history-meta">
                            <div>
                              <h4>行动计划</h4>
                              <ul className="advice-list">
                                {entry.actionPlan.map((step) => (
                                  <li key={step.id}>
                                    {step.done ? '已完成' : '待完成'} · {step.title}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4>追问记录</h4>
                              {entry.followUps.length > 0 ? (
                                <ul className="advice-list">
                                  {entry.followUps.map((followUp) => (
                                    <li key={followUp.id}>{followUp.question}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="selection-note">这次没有继续追问。</p>
                              )}
                            </div>
                          </div>
                        </details>
                      ))
                    ) : (
                      <p className="selection-note">
                        还没有匹配的历史记录。保存这次占卜后，就可以按分类和标签回看了。
                      </p>
                    )}
                  </div>
                </article>
              </div>
            </section>

            <CardEncyclopedia featuredCardIds={reading.cards.map((entry) => entry.card.id)} />
          </>
        ) : null}
      </main>
    </div>
  )
}

export default App
