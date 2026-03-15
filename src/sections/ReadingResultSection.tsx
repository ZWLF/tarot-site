import { BlurText } from '../components/BlurText'
import { RevealText } from '../components/RevealText'
import { SpreadLayoutBoard } from '../components/SpreadLayoutBoard'
import { StatusMessage } from '../components/StatusMessage'
import type { ReadingResult } from '../domain/tarot'
import { TOPIC_BY_ID } from '../data/topics'

interface ReadingResultSectionProps {
  actionPlanDoneIds: string[]
  followUpQuestion: string
  followUpSuggestions: string[]
  followUps: Array<{
    id: string
    question: string
    summary: string
  }>
  onDownloadPoster: () => void
  onFollowUpQuestionChange: (value: string) => void
  onRecordTagsChange: (value: string) => void
  onRecordTitleChange: (value: string) => void
  onReveal: (positionKey: string) => void
  onRevealAll: () => void
  onSaveReading: () => void
  onShareReading: () => void
  onSubmitFollowUp: () => void
  onToggleActionPlan: (stepId: string) => void
  reading: ReadingResult | null
  recordNotice: string | null
  recordTagsInput: string
  recordTitle: string
  revealedPositions: string[]
  shareMessage: string | null
}

export function ReadingResultSection({
  actionPlanDoneIds,
  followUpQuestion,
  followUpSuggestions,
  followUps,
  onDownloadPoster,
  onFollowUpQuestionChange,
  onRecordTagsChange,
  onRecordTitleChange,
  onReveal,
  onRevealAll,
  onSaveReading,
  onShareReading,
  onSubmitFollowUp,
  onToggleActionPlan,
  reading,
  recordNotice,
  recordTagsInput,
  recordTitle,
  revealedPositions,
  shareMessage,
}: ReadingResultSectionProps) {
  return (
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
            {reading.dominantSignals.map((signal, index) => (
              <span key={`signal-${index}-${signal}`}>{signal}</span>
            ))}
          </div>

          <div className="result-actions">
            <button className="primary-button" type="button" onClick={onRevealAll}>
              全部揭晓
            </button>
            <button className="ghost-button" type="button" onClick={onShareReading}>
              分享文案
            </button>
            <button className="ghost-button" type="button" onClick={onDownloadPoster}>
              下载海报
            </button>
          </div>

          <SpreadLayoutBoard
            cards={reading.cards}
            onReveal={onReveal}
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
                    <label key={step.id} className={`check-card ${checked ? 'is-done' : ''}`}>
                      <input
                        checked={checked}
                        type="checkbox"
                        onChange={() => onToggleActionPlan(step.id)}
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
                {followUpSuggestions.map((item) => (
                  <button
                    key={item}
                    className="pill"
                    type="button"
                    onClick={() => onFollowUpQuestionChange(item)}
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
                  onChange={(event) => onFollowUpQuestionChange(event.target.value)}
                />
              </label>
              <div className="result-actions">
                <button className="ghost-button" type="button" onClick={onSubmitFollowUp}>
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
                    onChange={(event) => onRecordTitleChange(event.target.value)}
                  />
                </label>
                <label className="inline-input">
                  <span>记录标签</span>
                  <input
                    aria-label="记录标签"
                    placeholder="关系 决策 长期"
                    type="text"
                    value={recordTagsInput}
                    onChange={(event) => onRecordTagsChange(event.target.value)}
                  />
                </label>
              </div>
              <div className="result-actions">
                <button className="primary-button" type="button" onClick={onSaveReading}>
                  加入收藏
                </button>
                <StatusMessage message={recordNotice} />
                <StatusMessage message={shareMessage} />
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
  )
}
