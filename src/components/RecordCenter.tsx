import { useMemo, type CSSProperties } from 'react'
import type { ReadingRecord } from '../domain/tarot'
import { CARD_IMAGE_ASSET_BY_ID } from '../data/cardImages'
import { layoutParagraphLines } from '../lib/textLayout'
import { RevealText } from './RevealText'
import { StatusMessage } from './StatusMessage'

export type RecordDateFilter = 'all' | '7d' | '30d'

interface RecordCenterProps {
  compareSelection: string[]
  dateFilter: RecordDateFilter
  filter: 'all' | 'saved' | 'auto' | 'daily'
  onClearCompare: () => void
  onDateFilterChange: (value: RecordDateFilter) => void
  onExportRecords: () => void
  onFilterChange: (filter: 'all' | 'saved' | 'auto' | 'daily') => void
  onImportRecords: () => void
  onQueryChange: (value: string) => void
  onTagFilterChange: (value: string) => void
  onToggleCompare: (recordId: string) => void
  query: string
  records: ReadingRecord[]
  recordsMessage: string | null
  sectionId?: string
  storageBackend: 'indexeddb' | 'localstorage'
  storageReady: boolean
  tagFilter: string
}

type ReviewSummaryItem = {
  label: string
  value: string
}

type PreviewReviewItem = ReviewSummaryItem & {
  previewHeight: number
  previewValue: string
}

type RecordPreviewLayout = {
  analysisHeight: number
  reviewItems: PreviewReviewItem[]
  summaryHeight: number
  summaryText: string
}

const PREVIEW_TEXT_WIDTH = 280
const PREVIEW_SUMMARY_FONT = '500 16px Inter, "PingFang SC", "Noto Sans SC", sans-serif'
const PREVIEW_SUMMARY_LINE_HEIGHT = 26
const PREVIEW_SUMMARY_MAX_LINES = 3
const PREVIEW_REVIEW_FONT = '400 15px Inter, "PingFang SC", "Noto Sans SC", sans-serif'
const PREVIEW_REVIEW_LINE_HEIGHT = 23
const PREVIEW_REVIEW_MAX_LINES = 2

const clampNumber = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const matchesRecord = (record: ReadingRecord, query: string) => {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  return [
    record.title,
    record.question,
    record.summary,
    record.tags.join(' '),
    record.topicLabel,
    record.spreadTitle,
  ]
    .join(' ')
    .toLowerCase()
    .includes(normalizedQuery)
}

const withinDateRange = (iso: string, filter: RecordDateFilter) => {
  if (filter === 'all') {
    return true
  }

  const now = Date.now()
  const time = new Date(iso).getTime()
  const days = filter === '7d' ? 7 : 30

  return now - time <= days * 24 * 60 * 60 * 1000
}

const formatRecordTime = (iso: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))

const getRecordSummary = (record: ReadingRecord) =>
  record.reportSections.coreConclusion.trim() || record.summary

const getReviewSummary = (record: ReadingRecord): ReviewSummaryItem[] => [
  {
    label: '当时主线',
    value: record.reportSections.coreConclusion.trim() || record.summary,
  },
  {
    label: '风险提醒',
    value:
      record.reportSections.riskAlert.trim() ||
      record.reportSections.currentState.trim() ||
      '先回看当时最明显的阻力和触发点。',
  },
  {
    label: '现在回看',
    value:
      record.reportSections.reviewPrompt.trim() ||
      '现在回看：这次阅读里真正值得继续验证的变化是什么？',
  },
]

const layoutPreviewParagraph = ({
  font,
  lineHeight,
  maxLines,
  text,
}: {
  font: string
  lineHeight: number
  maxLines: number
  text: string
}) => {
  const measured = layoutParagraphLines({
    font,
    lineHeight,
    maxLines,
    maxWidth: PREVIEW_TEXT_WIDTH,
    text,
  })

  return {
    height: measured.height,
    text: measured.lines.join(' '),
  }
}

const buildRecordPreviewLayout = (record: ReadingRecord): RecordPreviewLayout => {
  const summary = layoutPreviewParagraph({
    font: PREVIEW_SUMMARY_FONT,
    lineHeight: PREVIEW_SUMMARY_LINE_HEIGHT,
    maxLines: PREVIEW_SUMMARY_MAX_LINES,
    text: getRecordSummary(record),
  })

  const reviewItems = getReviewSummary(record).map((item) => {
    const review = layoutPreviewParagraph({
      font: PREVIEW_REVIEW_FONT,
      lineHeight: PREVIEW_REVIEW_LINE_HEIGHT,
      maxLines: PREVIEW_REVIEW_MAX_LINES,
      text: item.value,
    })

    return {
      ...item,
      previewHeight: review.height,
      previewValue: review.text,
    }
  })

  const reviewBlocksHeight = reviewItems.reduce(
    (sum, item) => sum + 20 + 6 + item.previewHeight,
    0,
  )
  const reviewGap = Math.max(0, reviewItems.length - 1) * 12

  return {
    analysisHeight: Math.round(summary.height + 12 + reviewBlocksHeight + reviewGap),
    reviewItems,
    summaryHeight: summary.height,
    summaryText: summary.text,
  }
}

const RecordCardThumbs = ({ record }: { record: ReadingRecord }) => (
  <div className="record-card__thumbs">
    {record.cards.slice(0, 6).map((card) => {
      const imageAsset = CARD_IMAGE_ASSET_BY_ID[card.cardId]

      return imageAsset ? (
        <picture key={`${record.id}-${card.cardId}-${card.positionLabel}`}>
          <source srcSet={imageAsset.thumbnailWebpUrl} type="image/webp" />
          <img
            src={imageAsset.thumbnailJpgUrl}
            alt={`${card.cardName}牌面`}
            height={160}
            loading="lazy"
            width={96}
          />
        </picture>
      ) : null
    })}
  </div>
)

const ReviewSummary = ({
  layout,
  prefix,
  record,
}: {
  layout?: RecordPreviewLayout
  prefix: string
  record: ReadingRecord
}) => (
  <div className="record-card__details">
    {layout
      ? layout.reviewItems.map((section) => (
          <div key={`${prefix}-${section.label}`}>
            <h4>{section.label}</h4>
            <p
              className="record-card__review-value"
              style={{ '--record-review-min-height': `${section.previewHeight}px` } as CSSProperties}
            >
              {section.previewValue}
            </p>
          </div>
        ))
      : getReviewSummary(record).map((section) => (
          <div key={`${prefix}-${section.label}`}>
            <h4>{section.label}</h4>
            <p className="record-card__review-value">{section.value}</p>
          </div>
        ))}
  </div>
)

export function RecordCenter({
  compareSelection,
  dateFilter,
  filter,
  onClearCompare,
  onDateFilterChange,
  onExportRecords,
  onFilterChange,
  onImportRecords,
  onQueryChange,
  onTagFilterChange,
  onToggleCompare,
  query,
  records,
  recordsMessage,
  sectionId = 'records',
  storageBackend,
  storageReady,
  tagFilter,
}: RecordCenterProps) {
  const availableTags = Array.from(new Set(records.flatMap((record) => record.tags))).sort()
  const filteredRecords = records.filter((record) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'saved'
          ? record.saved
          : filter === 'daily'
            ? record.kind === 'daily'
            : record.kind === 'reading' && !record.saved
    const matchesTag = tagFilter.length === 0 ? true : record.tags.includes(tagFilter)
    const matchesDate = withinDateRange(record.updatedAt, dateFilter)

    return matchesFilter && matchesTag && matchesDate && matchesRecord(record, query)
  })

  const compareRecords = compareSelection
    .map((id) => records.find((record) => record.id === id))
    .filter((record): record is ReadingRecord => record !== undefined)
  const previewByRecordId = useMemo(
    () =>
      Object.fromEntries(
        records.map((record) => [record.id, buildRecordPreviewLayout(record)]),
      ),
    [records],
  )
  const recordAnalysisBaselineHeight = useMemo(() => {
    const heights = filteredRecords
      .map((record) => previewByRecordId[record.id]?.analysisHeight ?? 0)
      .filter((height) => height > 0)

    if (heights.length === 0) {
      return 0
    }

    return clampNumber(Math.max(...heights), 220, 360)
  }, [filteredRecords, previewByRecordId])

  return (
    <section className="panel section stitch-panel stitch-panel--records" id={sectionId}>
      <div className="section__heading">
        <div>
          <p className="eyebrow">Record Center</p>
          <RevealText as="h2" text="记录中心" />
        </div>
        <span className="section__count">
          {records.length} 条 · {storageReady ? storageBackend : '同步中'}
        </span>
      </div>

      <div className="record-controls">
        <button className="ghost-button" type="button" onClick={onExportRecords}>
          导出记录
        </button>
        <button className="ghost-button" type="button" onClick={onImportRecords}>
          导入记录
        </button>
      </div>
      <StatusMessage message={recordsMessage} />

      <div className="utility-row">
        <div className="utility-toggle">
          <button
            aria-label="全部"
            className={`pill ${filter === 'all' ? 'is-active' : ''}`}
            type="button"
            onClick={() => onFilterChange('all')}
          >
            <span>全部</span>
            <small>所有记录</small>
          </button>
          <button
            aria-label="收藏"
            className={`pill ${filter === 'saved' ? 'is-active' : ''}`}
            type="button"
            onClick={() => onFilterChange('saved')}
          >
            <span>收藏</span>
            <small>手动收藏</small>
          </button>
          <button
            aria-label="自动归档"
            className={`pill ${filter === 'auto' ? 'is-active' : ''}`}
            type="button"
            onClick={() => onFilterChange('auto')}
          >
            <span>自动归档</span>
            <small>完整揭晓后生成</small>
          </button>
          <button
            aria-label="每日一张"
            className={`pill ${filter === 'daily' ? 'is-active' : ''}`}
            type="button"
            onClick={() => onFilterChange('daily')}
          >
            <span>每日一张</span>
            <small>系统回看摘要</small>
          </button>
        </div>

        <label className="inline-input">
          <span>搜索记录</span>
          <input
            aria-label="搜索记录"
            placeholder="标题、问题、标签"
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>
      </div>

      <div className="record-controls">
        <label className="inline-input">
          <span>标签筛选</span>
          <select value={tagFilter} onChange={(event) => onTagFilterChange(event.target.value)}>
            <option value="">全部标签</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-input">
          <span>时间筛选</span>
          <select
            value={dateFilter}
            onChange={(event) => onDateFilterChange(event.target.value as RecordDateFilter)}
          >
            <option value="all">全部时间</option>
            <option value="7d">最近 7 天</option>
            <option value="30d">最近 30 天</option>
          </select>
        </label>
      </div>

      <div className="compare-toolbar">
        <p className="selection-note">对比模式：已选择 {compareSelection.length}/2 条</p>
        <button
          className="ghost-button"
          disabled={compareSelection.length === 0}
          type="button"
          onClick={onClearCompare}
        >
          清空对比
        </button>
      </div>

      {compareRecords.length > 0 ? (
        <div className="compare-panel">
          {compareRecords.map((record) => {
            const preview = previewByRecordId[record.id]

            return (
              <article key={`compare-${record.id}`} className="result-panel">
                <p className="eyebrow">对比项</p>
                <h3>{record.title}</h3>
                <p className="record-card__question">“{record.question}”</p>
                <div className="signal-strip">
                  <span>{record.topicLabel}</span>
                  <span>{record.spreadTitle}</span>
                  <span>{record.tone}</span>
                </div>
                <div className="record-card__analysis">
                  <p
                    className="record-card__summary"
                    style={
                      preview
                        ? ({ '--record-summary-min-height': `${preview.summaryHeight}px` } as CSSProperties)
                        : undefined
                    }
                  >
                    {preview?.summaryText ?? getRecordSummary(record)}
                  </p>
                  <ReviewSummary
                    layout={preview}
                    prefix={`compare-${record.id}`}
                    record={record}
                  />
                </div>
                <RecordCardThumbs record={record} />
                <div className="record-card__details">
                  <div>
                    <h4>牌位</h4>
                    <ul className="advice-list">
                      {record.cards.map((card) => (
                        <li key={`${record.id}-${card.positionLabel}-${card.cardId}`}>
                          {card.positionLabel} · {card.cardName} ·{' '}
                          {card.orientation === 'up' ? '正位' : '逆位'}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4>行动计划</h4>
                    <ul className="advice-list">
                      {record.actionPlan.map((step) => (
                        <li key={`${record.id}-${step.id}`}>
                          {step.done ? '已完成' : '待完成'} · {step.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : null}

      <div className="record-grid">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => {
            const selected = compareSelection.includes(record.id)
            const disabled = !selected && compareSelection.length >= 2
            const preview = previewByRecordId[record.id]

            return (
              <article
                key={record.id}
                className="record-card"
                style={
                  recordAnalysisBaselineHeight > 0
                    ? ({ '--record-analysis-min-height': `${recordAnalysisBaselineHeight}px` } as CSSProperties)
                    : undefined
                }
              >
                <div className="record-card__meta">
                  <p className="eyebrow">{record.kind === 'daily' ? 'Daily' : 'Reading'}</p>
                  <span>{formatRecordTime(record.updatedAt)}</span>
                </div>

                <h3>{record.title}</h3>
                <p className="record-card__question">“{record.question}”</p>

                <div className="signal-strip">
                  <span>{record.topicLabel}</span>
                  <span>{record.spreadTitle}</span>
                  <span>{record.tone}</span>
                  {record.saved ? <span>已收藏</span> : null}
                </div>

                <div className="record-card__analysis">
                  <p
                    className="record-card__summary"
                    style={
                      preview
                        ? ({ '--record-summary-min-height': `${preview.summaryHeight}px` } as CSSProperties)
                        : undefined
                    }
                  >
                    {preview?.summaryText ?? getRecordSummary(record)}
                  </p>
                  <ReviewSummary layout={preview} prefix={record.id} record={record} />
                </div>
                <RecordCardThumbs record={record} />

                {record.tags.length > 0 ? (
                  <div className="signal-strip">
                    {record.tags.map((tag) => (
                      <span key={`${record.id}-${tag}`}>#{tag}</span>
                    ))}
                  </div>
                ) : null}

                <div className="record-card__actions">
                  <button
                    aria-label={selected ? 'remove from compare' : 'add to compare'}
                    className={`pill ${selected ? 'is-active' : ''}`}
                    disabled={disabled}
                    type="button"
                    onClick={() => onToggleCompare(record.id)}
                  >
                    {selected ? '已加入对比' : '加入对比'}
                  </button>
                </div>

                {record.kind === 'reading' ? (
                  <div className="record-card__details">
                    <div>
                      <h4>行动计划</h4>
                      <ul className="advice-list">
                        {record.actionPlan.map((step) => (
                          <li key={`${record.id}-${step.id}`}>
                            {step.done ? '已完成' : '待完成'} · {step.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4>追问</h4>
                      {record.followUps.length > 0 ? (
                        <ul className="advice-list">
                          {record.followUps.map((entry) => (
                            <li key={entry.id}>{entry.question}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>暂无追问</p>
                      )}
                    </div>
                  </div>
                ) : null}
              </article>
            )
          })
        ) : (
          <p className="selection-note">暂时没有匹配的记录。</p>
        )}
      </div>
    </section>
  )
}
