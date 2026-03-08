import type { ReadingRecordV2 } from '../domain/tarot'

interface RecordCenterProps {
  records: ReadingRecordV2[]
  filter: 'all' | 'saved' | 'auto' | 'daily'
  query: string
  onFilterChange: (filter: 'all' | 'saved' | 'auto' | 'daily') => void
  onQueryChange: (value: string) => void
}

const matchesRecord = (record: ReadingRecordV2, query: string) => {
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

export function RecordCenter({
  records,
  filter,
  query,
  onFilterChange,
  onQueryChange,
}: RecordCenterProps) {
  const filteredRecords = records.filter((record) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'saved'
          ? record.saved
          : filter === 'daily'
            ? record.kind === 'daily'
            : record.kind === 'reading' && !record.saved

    return matchesFilter && matchesRecord(record, query)
  })

  return (
    <section className="panel section" id="records">
      <div className="section__heading">
        <div>
          <p className="eyebrow">Record Center</p>
          <h2>记录中心</h2>
        </div>
        <span className="section__count">{records.length} 条</span>
      </div>

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
            <small>带复盘记录</small>
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

      <div className="record-grid">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <article key={record.id} className="record-card">
              <div className="record-card__meta">
                <p className="eyebrow">{record.kind === 'daily' ? 'Daily' : 'Reading'}</p>
                <span>{new Intl.DateTimeFormat('zh-CN', {
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(record.updatedAt))}</span>
              </div>

              <h3>{record.title}</h3>
              <p className="record-card__question">“{record.question}”</p>

              <div className="signal-strip">
                <span>{record.topicLabel}</span>
                <span>{record.spreadTitle}</span>
                <span>{record.tone}</span>
                {record.saved ? <span>已收藏</span> : null}
              </div>

              <p>{record.summary}</p>

              {record.tags.length > 0 ? (
                <div className="signal-strip">
                  {record.tags.map((tag) => (
                    <span key={`${record.id}-${tag}`}>#{tag}</span>
                  ))}
                </div>
              ) : null}

              {record.kind === 'daily' ? (
                <div className="record-card__details">
                  <div>
                    <h4>晨间意图</h4>
                    <p>{record.dailyReflection.morningIntent || '未填写'}</p>
                  </div>
                  <div>
                    <h4>晚间复盘</h4>
                    <p>{record.dailyReflection.eveningReview || '未填写'}</p>
                  </div>
                </div>
              ) : (
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
              )}
            </article>
          ))
        ) : (
          <p className="selection-note">暂时没有匹配的记录。</p>
        )}
      </div>
    </section>
  )
}
