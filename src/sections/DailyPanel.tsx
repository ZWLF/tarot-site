import type { DailyReflection, ReadingCardView } from '../domain/tarot'
import { RevealText } from '../components/RevealText'
import { StatusMessage } from '../components/StatusMessage'
import { TarotCardButton } from '../components/TarotCardButton'

interface DailyPanelProps {
  dailyLabel: string
  dailyMessage: string | null
  dailyReflection: DailyReflection
  dailyRevealed: boolean
  entry: ReadingCardView
  onDownloadPoster: () => void
  onReflectionChange: (value: DailyReflection) => void
  onReveal: () => void
  onSave: () => void
  onShare: () => void
}

export function DailyPanel({
  dailyLabel,
  dailyMessage,
  dailyReflection,
  dailyRevealed,
  entry,
  onDownloadPoster,
  onReflectionChange,
  onReveal,
  onSave,
  onShare,
}: DailyPanelProps) {
  return (
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
            <button className="primary-button" type="button" onClick={onReveal}>
              揭晓今日能量
            </button>
            <button className="ghost-button" type="button" onClick={onShare}>
              分享今日卡面
            </button>
            <button className="ghost-button" type="button" onClick={onDownloadPoster}>
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
                onReflectionChange({
                  ...dailyReflection,
                  morningIntent: event.target.value,
                })
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
                onReflectionChange({
                  ...dailyReflection,
                  eveningReview: event.target.value,
                })
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
                onReflectionChange({
                  ...dailyReflection,
                  resonance: 'strong',
                })
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
                onReflectionChange({
                  ...dailyReflection,
                  resonance: 'mixed',
                })
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
                onReflectionChange({
                  ...dailyReflection,
                  resonance: 'low',
                })
              }
            >
              不共鸣
            </button>
          </div>

          <div className="draw-summary__actions">
            <button className="primary-button" type="button" onClick={onSave}>
              保存今日记录
            </button>
            <StatusMessage message={dailyMessage} />
          </div>
        </div>

        <div className="daily-card-slot">
          <TarotCardButton entry={entry} onReveal={onReveal} revealed={dailyRevealed} />
        </div>
      </div>
    </section>
  )
}
