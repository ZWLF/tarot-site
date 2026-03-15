import type { CSSProperties } from 'react'
import { SPREADS } from '../data/spreads'
import { TOPICS } from '../data/topics'
import type {
  ReadingPreferences,
  ResolvedSpreadDefinition,
  TopicId,
} from '../domain/tarot'
import { getSpreadPreviewPositions } from '../engine/reading'
import { RevealText } from '../components/RevealText'
import { StatusMessage } from '../components/StatusMessage'

interface ReadingStudioSectionProps {
  canDraw: boolean
  drawNotice: string | null
  isShuffling: boolean
  needsReDrawConfirm: boolean
  onDraw: () => void
  onQuestionChange: (value: string) => void
  onSelectSpread: (spreadId: string) => void
  onSelectTopic: (topicId: TopicId) => void
  onSelectVariant: (variantId: string) => void
  onUpdatePreferences: (nextPreferences: ReadingPreferences) => void
  preferences: ReadingPreferences
  question: string
  selectedSpread: ResolvedSpreadDefinition | null
  selectedTopic: {
    framing: string
    label: string
  } | null
  selectedVariant: {
    description: string
    id: string
    title: string
  } | null
  spreadId: string | null
  topic: TopicId | null
  variantId?: string
}

export function ReadingStudioSection({
  canDraw,
  drawNotice,
  isShuffling,
  needsReDrawConfirm,
  onDraw,
  onQuestionChange,
  onSelectSpread,
  onSelectTopic,
  onSelectVariant,
  onUpdatePreferences,
  preferences,
  question,
  selectedSpread,
  selectedTopic,
  selectedVariant,
  spreadId,
  topic,
  variantId,
}: ReadingStudioSectionProps) {
  return (
    <section aria-busy={isShuffling} className="panel section" id="reading">
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
          onChange={(event) => onQuestionChange(event.target.value)}
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
              onClick={() => onSelectTopic(entry.id)}
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
              ? spread.variants?.find((entry) => entry.id === selectedVariant.id)?.positions ??
                spread.positions
              : spread.variants?.[0]?.positions ?? spread.positions,
          )

          return (
            <button
              key={spread.id}
              aria-label={spread.id === 'daily-energy' ? '每日一张牌阵' : spread.title}
              className={`spread-card ${spreadId === spread.id ? 'is-active' : ''}`}
              type="button"
              onClick={() => onSelectSpread(spread.id)}
            >
              <div className="spread-card__topline">
                <span>{spread.cardCount} 张</span>
                <span>{spread.layoutId}</span>
              </div>
              <div className="spread-card__body">
                <div className="spread-card__info">
                  <h3>{spread.title}</h3>
                  <p>{spread.description}</p>
                </div>
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
              </div>
            </button>
          )
        })}
      </div>

      {selectedSpread?.activeVariantId !== undefined || selectedSpread?.positions ? (
        selectedSpread && SPREADS.find((entry) => entry.id === selectedSpread.id)?.variants ? (
          <div className="utility-row utility-row--stack">
            <div className="section__heading section__heading--compact">
              <div>
                <p className="eyebrow">Spread Mode</p>
                <RevealText as="h2" text={`${selectedSpread.title}模式`} />
              </div>
            </div>
            <div className="utility-toggle utility-toggle--wrap">
              {SPREADS.find((entry) => entry.id === selectedSpread.id)?.variants?.map((entry) => (
                <button
                  key={entry.id}
                  className={`pill ${variantId === entry.id ? 'is-active' : ''}`}
                  type="button"
                  onClick={() => onSelectVariant(entry.id)}
                >
                  {entry.title}
                </button>
              ))}
            </div>
            {selectedVariant ? (
              <p className="selection-note">{selectedVariant.description}</p>
            ) : null}
          </div>
        ) : null
      ) : null}

      <div className="draw-summary">
        <div className="draw-summary__row">
          <span>当前组合</span>
          <p>
            {selectedTopic?.label ?? '未选主题'} 路 {selectedSpread?.title ?? '未选牌阵'}
            {selectedVariant ? ` 路 ${selectedVariant.title}` : ''}
          </p>
        </div>

        <div className="draw-preferences">
          <label className="inline-input">
            <span>洗牌速度</span>
            <select
              value={preferences.shuffleSpeed}
              onChange={(event) =>
                onUpdatePreferences({
                  ...preferences,
                  shuffleSpeed: event.target.value as ReadingPreferences['shuffleSpeed'],
                })
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
                onUpdatePreferences({
                  ...preferences,
                  orientationMode: event.target.value as ReadingPreferences['orientationMode'],
                })
              }
            >
              <option value="random">随机正逆位</option>
              <option value="up-only">仅正位</option>
            </select>
          </label>
          <label className="inline-input">
            <span>牌阵舞台</span>
            <select
              value={preferences.deckPerformanceMode}
              onChange={(event) =>
                onUpdatePreferences({
                  ...preferences,
                  deckPerformanceMode:
                    event.target.value as ReadingPreferences['deckPerformanceMode'],
                })
              }
            >
              <option value="auto">自动</option>
              <option value="full">完整视觉</option>
              <option value="lite">轻量模式</option>
            </select>
          </label>
        </div>

        <div className="draw-summary__actions">
          <button className="primary-button" disabled={!canDraw} type="button" onClick={onDraw}>
            {needsReDrawConfirm ? '再次点击确认重抽' : '洗牌并抽牌'}
          </button>
        </div>
        <StatusMessage message={drawNotice} />
        <p className="selection-note">
          重抽规则：同一问题在 30 秒内重复抽牌时，会先提示确认，避免无意识反复重抽。
        </p>
      </div>
    </section>
  )
}
