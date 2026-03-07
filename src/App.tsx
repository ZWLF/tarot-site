import { useEffect, useRef, useState } from 'react'
import './App.css'
import { TarotCardButton } from './components/TarotCardButton'
import { SPREADS } from './data/spreads'
import { TOPICS, TOPIC_BY_ID } from './data/topics'
import type { SavedReadingEntry } from './domain/history'
import type { ReadingResult, TopicId } from './domain/tarot'
import { createReading } from './engine/reading'
import { createDailyReading, formatDailyLabel } from './lib/daily'
import {
  buildSavedReadingEntry,
  clearReadingHistory,
  loadReadingHistory,
  saveReadingHistoryEntry,
} from './lib/history'
import {
  buildReadingShareText,
  buildSavedReadingShareText,
  shareText,
} from './lib/share'

interface AppProps {
  shuffleDelayMs?: number
}

const formatHistoryTime = (value: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

function App({ shuffleDelayMs = 1200 }: AppProps) {
  const [question, setQuestion] = useState('')
  const [topic, setTopic] = useState<TopicId | null>(null)
  const [spreadId, setSpreadId] = useState<string | null>(null)
  const [reading, setReading] = useState<ReadingResult | null>(null)
  const [history, setHistory] = useState<SavedReadingEntry[]>(() => loadReadingHistory())
  const [historyExpandedId, setHistoryExpandedId] = useState<string | null>(null)
  const [isShuffling, setIsShuffling] = useState(false)
  const [revealedPositions, setRevealedPositions] = useState<string[]>([])
  const [dailyReading] = useState(() => createDailyReading())
  const [dailyLabel] = useState(() => formatDailyLabel())
  const [dailyRevealed, setDailyRevealed] = useState(false)
  const [resultShareMessage, setResultShareMessage] = useState<string | null>(null)
  const [dailyShareMessage, setDailyShareMessage] = useState<string | null>(null)
  const [historyShareMessage, setHistoryShareMessage] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)
  const lastSavedReadingIdRef = useRef<string | null>(null)

  const selectedTopic = TOPICS.find((entry) => entry.id === topic) ?? null
  const selectedSpread = SPREADS.find((entry) => entry.id === spreadId) ?? null
  const dailyCard = dailyReading.cards[0]
  const dailyInsight = dailyReading.positionReadings[0]
  const isLocked = isShuffling || reading !== null
  const canDraw =
    question.trim().length > 0 &&
    topic !== null &&
    spreadId !== null &&
    !isShuffling &&
    reading === null
  const allRevealed =
    reading !== null && revealedPositions.length === reading.cards.length

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  const persistCompletedReading = (
    nextReading: ReadingResult,
    nextRevealedPositions: string[],
  ) => {
    if (nextRevealedPositions.length !== nextReading.cards.length) {
      return
    }

    const entry = buildSavedReadingEntry(
      nextReading,
      TOPIC_BY_ID[nextReading.input.topic].label,
    )

    if (entry.id === lastSavedReadingIdRef.current) {
      return
    }

    setHistory(saveReadingHistoryEntry(entry))
    setHistoryExpandedId(entry.id)
    lastSavedReadingIdRef.current = entry.id
  }

  const handleDraw = () => {
    if (!canDraw || topic === null || spreadId === null) {
      return
    }

    setResultShareMessage(null)
    setHistoryShareMessage(null)
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
      setReading(nextReading)
      setIsShuffling(false)
      return
    }

    setIsShuffling(true)
    setRevealedPositions([])
    timerRef.current = window.setTimeout(() => {
      setReading(nextReading)
      setIsShuffling(false)
    }, shuffleDelayMs)
  }

  const handleReveal = (positionKey: string) => {
    if (reading === null || revealedPositions.includes(positionKey)) {
      return
    }

    const nextRevealedPositions = [...revealedPositions, positionKey]

    setRevealedPositions(nextRevealedPositions)
    persistCompletedReading(reading, nextRevealedPositions)
  }

  const handleRevealAll = () => {
    if (reading === null) {
      return
    }

    const nextRevealedPositions = reading.cards.map(
      (entry) => entry.drawn.positionKey,
    )

    setRevealedPositions(nextRevealedPositions)
    persistCompletedReading(reading, nextRevealedPositions)
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
    setResultShareMessage(null)
  }

  const handleShareReading = async () => {
    if (reading === null || !allRevealed) {
      return
    }

    try {
      const message = await shareText(
        '浮世占｜占卜结果',
        buildReadingShareText(reading, TOPIC_BY_ID[reading.input.topic].label),
      )
      setResultShareMessage(message)
    } catch (error) {
      setResultShareMessage(
        error instanceof Error ? error.message : '分享失败，请稍后再试。',
      )
    }
  }

  const handleShareDaily = async () => {
    if (!dailyRevealed) {
      return
    }

    try {
      const message = await shareText(
        '浮世占｜每日一张牌',
        buildReadingShareText(dailyReading, TOPIC_BY_ID.general.label),
      )
      setDailyShareMessage(message)
    } catch (error) {
      setDailyShareMessage(
        error instanceof Error ? error.message : '分享失败，请稍后再试。',
      )
    }
  }

  const handleShareHistory = async (entry: SavedReadingEntry) => {
    try {
      const message = await shareText(
        '浮世占｜历史记录',
        buildSavedReadingShareText(entry),
      )
      setHistoryShareMessage(message)
    } catch (error) {
      setHistoryShareMessage(
        error instanceof Error ? error.message : '分享失败，请稍后再试。',
      )
    }
  }

  const handleClearHistory = () => {
    clearReadingHistory()
    setHistory([])
    setHistoryExpandedId(null)
    setHistoryShareMessage('历史记录已清空。')
  }

  return (
    <div className="app-shell">
      <div className="app-shell__mist app-shell__mist--left" />
      <div className="app-shell__mist app-shell__mist--right" />

      <header className="hero panel">
        <div className="hero__seal">
          <span className="hero__seal-mark">浮世占</span>
          <span className="hero__seal-sub">Tarot Reading</span>
        </div>

        <div className="hero__copy">
          <p className="eyebrow">Ukiyo Tarot Salon</p>
          <h1>纸上星轨，问心抽牌</h1>
          <p className="hero__lede">
            以浮世绘风格展开一场中文塔罗体验。先写下问题，再让牌阵为你揭开当下的情绪、趋势与可执行建议。
          </p>

          <div className="hero__meta">
            <span>完整 78 张牌</span>
            <span>支持正位 / 逆位</span>
            <span>单张到五张牌阵</span>
            <span>每日一张与历史留存</span>
          </div>
        </div>
      </header>

      <main className="layout">
        <section className="panel section daily-panel">
          <div className="section__heading">
            <div>
              <p className="eyebrow">Daily Card</p>
              <h2>每日一张牌</h2>
            </div>
            <span className="section__count">{dailyLabel}</span>
          </div>

          <div className="daily-layout">
            <div className="daily-copy">
              <p className="selection-note">
                不写问题也可以先抽今天的一张牌，快速校准当天的情绪、节奏与行动重点。
              </p>

              <div className="signal-strip">
                <span>{dailyReading.spread.title}</span>
                <span>{dailyReading.tone}</span>
                <span>完整中文解读</span>
              </div>

              {dailyRevealed ? (
                <>
                  <div className="daily-copy__block">
                    <h3>今日提示</h3>
                    <p>{dailyInsight.message}</p>
                  </div>

                  <div className="daily-copy__block">
                    <h3>今日建议</h3>
                    <ul className="advice-list">
                      {dailyReading.advice.map((entry) => (
                        <li key={entry}>{entry}</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="selection-note">
                  先翻开牌面，再看今天的解读、关键词和行动建议。
                </p>
              )}

              <div className="draw-summary__actions">
                <button
                  className="primary-button"
                  disabled={dailyRevealed}
                  type="button"
                  onClick={() => setDailyRevealed(true)}
                >
                  {dailyRevealed ? '今日牌面已揭晓' : '揭晓今日能量'}
                </button>
                <button
                  className="ghost-button"
                  disabled={!dailyRevealed}
                  type="button"
                  onClick={() => void handleShareDaily()}
                >
                  分享今日抽牌
                </button>
              </div>

              {dailyShareMessage ? (
                <p className="selection-note">{dailyShareMessage}</p>
              ) : null}
            </div>

            <div className="daily-card-slot">
              <TarotCardButton
                entry={dailyCard}
                revealed={dailyRevealed}
                onReveal={() => setDailyRevealed(true)}
              />
            </div>
          </div>
        </section>

        <section className="panel section">
          <div className="section__heading">
            <div>
              <p className="eyebrow">Step 01</p>
              <h2>写下你的问卜之题</h2>
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
              {selectedTopic?.description ?? '主题会影响解读语气与建议方向。'}
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
                  {isShuffling ? '牌阵正在洗牌中' : '洗牌并抽牌'}
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
                只有在问题、主题、牌阵都完整时，牌阵才会回应。
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
              <button
                className="ghost-button"
                disabled={!allRevealed}
                type="button"
                onClick={() => void handleShareReading()}
              >
                分享这次结果
              </button>
            </div>

            {!allRevealed ? (
              <p className="selection-note">
                点击每张牌翻面，完整解读会在全部揭晓后浮现。
              </p>
            ) : (
              <div className="result-grid">
                <article className="result-panel">
                  <p className="eyebrow">Section 01</p>
                  <h3>问卜之题</h3>
                  <p className="question-echo">“{reading.input.question}”</p>
                  <div className="signal-strip">
                    <span>{selectedTopic?.label}</span>
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
                          {entry.card.nameZh} · {entry.drawn.orientation === 'up' ? '正位' : '逆位'}
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

            {allRevealed && resultShareMessage ? (
              <p className="selection-note">{resultShareMessage}</p>
            ) : null}
          </section>
        ) : null}

        <section className="panel section">
          <div className="section__heading">
            <div>
              <p className="eyebrow">Archive</p>
              <h2>本地历史记录</h2>
            </div>
            <span className="section__count">{history.length} 条</span>
          </div>

          <div className="history-toolbar">
            <p className="selection-note">
              每次完整揭晓后的结果都会自动保存在本地浏览器，方便回看与分享。
            </p>

            {history.length > 0 ? (
              <button
                className="ghost-button"
                type="button"
                onClick={handleClearHistory}
              >
                清空记录
              </button>
            ) : null}
          </div>

          {history.length === 0 ? (
            <p className="selection-note">
              还没有历史记录。完成一次完整占卜后，这里会自动出现回看卡片。
            </p>
          ) : (
            <div className="history-list">
              {history.map((entry) => {
                const isExpanded = entry.id === historyExpandedId

                return (
                  <article
                    key={entry.id}
                    className={`history-card ${isExpanded ? 'is-active' : ''}`}
                  >
                    <div className="history-card__meta">
                      <p className="eyebrow">Saved Reading</p>
                      <span className="section__count">
                        {formatHistoryTime(entry.createdAt)}
                      </span>
                    </div>

                    <h3>{entry.question}</h3>

                    <div className="signal-strip">
                      <span>{entry.topicLabel}</span>
                      <span>{entry.spreadTitle}</span>
                      <span>{entry.tone}</span>
                    </div>

                    <p>{entry.summary}</p>

                    <div className="draw-summary__actions">
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() =>
                          setHistoryExpandedId(isExpanded ? null : entry.id)
                        }
                      >
                        {isExpanded ? '收起详情' : '查看详情'}
                      </button>
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => void handleShareHistory(entry)}
                      >
                        分享记录
                      </button>
                    </div>

                    {isExpanded ? (
                      <div className="history-card__details">
                        <div className="history-card__block">
                          <h4>牌阵回看</h4>
                          <ul className="result-list">
                            {entry.cards.map((card) => (
                              <li
                                key={`${entry.id}-${card.positionLabel}-${card.cardName}`}
                              >
                                <strong>{card.positionLabel}</strong>
                                <span>
                                  {card.cardName} ·{' '}
                                  {card.orientation === 'up' ? '正位' : '逆位'}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="history-card__block">
                          <h4>行动建议</h4>
                          <ul className="advice-list">
                            {entry.advice.map((advice) => (
                              <li key={`${entry.id}-${advice}`}>{advice}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="history-card__block">
                          <h4>关键信号</h4>
                          <div className="signal-strip">
                            {entry.dominantSignals.map((signal) => (
                              <span key={`${entry.id}-${signal}`}>{signal}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </div>
          )}

          {historyShareMessage ? (
            <p className="selection-note">{historyShareMessage}</p>
          ) : null}
        </section>
      </main>
    </div>
  )
}

export default App
