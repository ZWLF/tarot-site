import type { CSSProperties } from 'react'
import { StatusMessage } from '../components/StatusMessage'
import { RevealText } from '../components/RevealText'
import { SPREADS } from '../data/spreads'
import { TOPICS } from '../data/topics'
import type { ResolvedSpreadDefinition, TopicId } from '../domain/tarot'
import { getSpreadPreviewPositions } from '../engine/reading'

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

const QUESTION_SUGGESTIONS: Record<TopicId, string[]> = {
  general: [
    '我接下来最该看清的整体趋势是什么？',
    '当前局面里我最容易忽略的信号是什么？',
    '未来三个月我需要注意什么能量？',
  ],
  love: [
    '这段关系的下一步走向是什么？',
    '我该怎样处理这段关系里的不安感？',
    '眼前这份心动值得继续投入吗？',
  ],
  career: [
    '我在当前工作中的核心卡点在哪里？',
    '我该如何推进这个项目或机会？',
    '现在适合我主动争取新的职业变化吗？',
  ],
  relationships: [
    '我该怎样调整和这个人的互动边界？',
    '这段关系里真正需要被说开的是什么？',
    '我现在最该修复的是哪一层人际张力？',
  ],
  growth: [
    '我正在重复的内在课题是什么？',
    '我该如何停止消耗，回到自己的节奏？',
    '当下最值得培养的内在力量是什么？',
  ],
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
  question,
  selectedSpread,
  selectedTopic,
  selectedVariant,
  spreadId,
  topic,
  variantId,
}: ReadingStudioSectionProps) {
  const selectedSpreadDefinition = selectedSpread
    ? SPREADS.find((entry) => entry.id === selectedSpread.id)
    : null
  const selectedVariants = selectedSpreadDefinition?.variants ?? []
  const questionSuggestions = QUESTION_SUGGESTIONS[topic ?? 'general']

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

      <div className="question-suggestions" data-testid="question-suggestions">
        <span className="question-suggestions__label">试试这样问</span>
        <div className="question-suggestions__list">
          {questionSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              className="pill question-suggestions__pill"
              type="button"
              onClick={() => onQuestionChange(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

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

      {selectedSpread && selectedVariants.length > 0 ? (
        <div className="utility-row utility-row--stack">
          <div className="section__heading section__heading--compact">
            <div>
              <p className="eyebrow">Spread Mode</p>
              <RevealText as="h2" text={`${selectedSpread.title}模式`} />
            </div>
          </div>
          <div className="utility-toggle utility-toggle--wrap">
            {selectedVariants.map((entry) => (
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
      ) : null}

      <div className="draw-summary">
        <div className="draw-summary__row">
          <span>当前组合</span>
          <p>
            {selectedTopic?.label ?? '未选主题'} / {selectedSpread?.title ?? '未选牌阵'}
            {selectedVariant ? ` / ${selectedVariant.title}` : ''}
          </p>
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
