import { useState } from 'react'

interface GuidePanelProps {
  dismissed: boolean
  onDismiss: () => void
  onRestore: () => void
}

const STEPS = [
  {
    title: '先写一个具体问题',
    detail:
      '尽量避免泛问。把问题写成“我接下来该如何处理 X”，解读会更可执行。',
  },
  {
    title: '选择主题与牌阵',
    detail:
      '主题决定阅读语境，牌阵决定信息结构。简单问题用 3 张，复杂问题用深度牌阵。',
  },
  {
    title: '先揭牌再看行动计划',
    detail:
      '建议先完整揭牌看全局，再根据行动计划逐步勾选执行，避免只盯单张牌。',
  },
  {
    title: '保存与复盘',
    detail:
      '把记录写入记录中心，并在每日一张里补晨间意图和晚间复盘，形成可追踪闭环。',
  },
]

export function GuidePanel({ dismissed, onDismiss, onRestore }: GuidePanelProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const currentStep = STEPS[stepIndex]
  const isLast = stepIndex === STEPS.length - 1

  const handleDismiss = () => {
    setStepIndex(0)
    onDismiss()
  }

  const handleRestore = () => {
    setStepIndex(0)
    onRestore()
  }

  return (
    <section className="panel section guide-panel">
      <div className="section__heading">
        <div>
          <p className="eyebrow">Onboarding</p>
          <h2>新手引导</h2>
        </div>
        {dismissed ? (
          <button className="ghost-button" type="button" onClick={handleRestore}>
            重新查看
          </button>
        ) : (
          <button className="ghost-button" type="button" onClick={handleDismiss}>
            关闭引导
          </button>
        )}
      </div>

      {dismissed ? (
        <p className="selection-note">
          引导已收起。你可以随时重新展开，快速回顾提问、选阵、抽牌与复盘的顺序。
        </p>
      ) : (
        <>
          <div className="guide-progress">
            <span className="section__count">
              第 {stepIndex + 1} / {STEPS.length} 步
            </span>
            <div
              className="guide-progress__bar"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={STEPS.length}
              aria-valuenow={stepIndex + 1}
            >
              <span style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }} />
            </div>
          </div>

          <article className="result-panel">
            <p className="eyebrow">Step {String(stepIndex + 1).padStart(2, '0')}</p>
            <h3>{currentStep.title}</h3>
            <p>{currentStep.detail}</p>
          </article>

          <div className="draw-summary__actions">
            <button
              className="ghost-button"
              type="button"
              onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
              disabled={stepIndex === 0}
            >
              上一步
            </button>
            {!isLast ? (
              <button
                className="primary-button"
                type="button"
                onClick={() =>
                  setStepIndex((current) => Math.min(STEPS.length - 1, current + 1))
                }
              >
                下一步
              </button>
            ) : (
              <button className="primary-button" type="button" onClick={handleDismiss}>
                完成引导
              </button>
            )}
          </div>
        </>
      )}
    </section>
  )
}
