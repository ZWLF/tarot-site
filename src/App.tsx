import { useEffect, useRef, useState } from 'react'
import './App.css'
import { TarotCardButton } from './components/TarotCardButton'
import { SPREADS } from './data/spreads'
import { TOPICS } from './data/topics'
import type { ReadingResult, TopicId } from './domain/tarot'
import { createReading } from './engine/reading'

interface AppProps {
  shuffleDelayMs?: number
}

function App({ shuffleDelayMs = 1200 }: AppProps) {
  const [question, setQuestion] = useState('')
  const [topic, setTopic] = useState<TopicId | null>(null)
  const [spreadId, setSpreadId] = useState<string | null>(null)
  const [reading, setReading] = useState<ReadingResult | null>(null)
  const [isShuffling, setIsShuffling] = useState(false)
  const [revealedPositions, setRevealedPositions] = useState<string[]>([])
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

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

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
            <span>单张与三张牌阵</span>
          </div>
        </div>
      </header>

      <main className="layout">
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
          </section>
        ) : null}
      </main>
    </div>
  )
}

export default App
