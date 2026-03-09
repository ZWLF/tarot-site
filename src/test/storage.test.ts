import { beforeEach, describe, expect, it } from 'vitest'
import { createReading } from '../engine/reading'
import {
  buildDailyRecord,
  buildReadingRecordFromReading,
  loadReadingPreferences,
  loadReadingRecords,
  saveReadingPreferences,
  saveReadingRecord,
} from '../engine/storage'

describe('reading storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('migrates legacy saved readings and history into the v2 record store', () => {
    window.localStorage.setItem(
      'ukiyo-tarot.saved-readings',
      JSON.stringify([
        {
          id: 'legacy-saved',
          title: '旧收藏',
          category: 'love',
          tags: ['关系'],
          createdAt: '2026-03-08T08:00:00.000Z',
          question: '这段关系值得继续吗？',
          spreadTitle: '过去 / 现在 / 未来',
          topicLabel: '爱情',
          tone: '情绪流动',
          summary: '旧的收藏记录。',
          dominantSignals: ['主题：爱情'],
          cards: [
            { positionLabel: '过去', cardName: '恋人', orientation: 'up' },
            { positionLabel: '现在', cardName: '力量', orientation: 'down' },
            { positionLabel: '未来', cardName: '太阳', orientation: 'up' },
          ],
          actionPlan: [],
          followUps: [],
        },
      ]),
    )
    window.localStorage.setItem(
      'ukiyo-tarot:reading-history',
      JSON.stringify([
        {
          id: 'legacy-history',
          createdAt: '2026-03-07T08:00:00.000Z',
          question: '我该如何做选择？',
          topicId: 'career',
          topicLabel: '事业',
          spreadId: 'situation-obstacle-advice',
          spreadTitle: '现状 / 阻碍 / 建议',
          tone: '锋利辨析',
          summary: '旧自动归档。',
          advice: ['先厘清标准'],
          dominantSignals: ['主题：事业'],
          cards: [
            { positionLabel: '现状', cardName: '战车', orientation: 'up' },
            { positionLabel: '阻碍', cardName: '隐士', orientation: 'down' },
            { positionLabel: '建议', cardName: '皇帝', orientation: 'up' },
          ],
        },
      ]),
    )

    const records = loadReadingRecords()

    expect(records).toHaveLength(2)
    expect(records[0].version).toBe(2)
    expect(records.find((entry) => entry.id === 'legacy-saved')?.saved).toBe(true)
    expect(
      records.find((entry) => entry.id === 'legacy-history')?.variantId,
    ).toBe('diagnostic')
    expect(window.localStorage.getItem('ukiyo-tarot.records-v2')).not.toBeNull()
  })

  it('updates the same record when a reading is saved after auto-archive', () => {
    const reading = createReading(
      {
        question: '我该如何推进这个项目？',
        topic: 'career',
        spreadId: 'holy-triangle',
        variantId: 'diagnostic',
      },
      { seed: 'record-upsert' },
    )

    const autoRecord = buildReadingRecordFromReading(reading, {
      recordId: 'reading-1',
      saved: false,
      title: '',
      tags: [],
      actionPlanDoneIds: [],
      followUps: [],
    })

    saveReadingRecord(autoRecord)

    const savedRecord = buildReadingRecordFromReading(reading, {
      recordId: 'reading-1',
      saved: true,
      title: '项目推进占卜',
      tags: ['项目', '决策'],
      actionPlanDoneIds: [reading.actionPlan[0].id],
      followUps: [],
    })

    const records = saveReadingRecord(savedRecord)

    expect(records).toHaveLength(1)
    expect(records[0].saved).toBe(true)
    expect(records[0].title).toBe('项目推进占卜')
    expect(records[0].tags).toEqual(['项目', '决策'])
    expect(records[0].actionPlan[0].done).toBe(true)
  })

  it('creates stable daily records for the same date', () => {
    const daily = createReading(
      {
        question: '今天最值得留意的能量是什么？',
        topic: 'general',
        spreadId: 'daily-energy',
      },
      { seed: 'daily-2026-03-08' },
    )

    const first = buildDailyRecord(
      daily,
      new Date('2026-03-08T08:00:00+08:00'),
      {
        morningIntent: '保持专注',
        eveningReview: '',
        resonance: 'strong',
      },
    )
    const second = buildDailyRecord(
      daily,
      new Date('2026-03-08T21:00:00+08:00'),
      {
        morningIntent: '保持专注',
        eveningReview: '确实有帮助。',
        resonance: 'strong',
      },
    )

    expect(first.id).toBe(second.id)
    expect(second.dailyReflection.eveningReview).toContain('帮助')
  })
  it('stores and reads drawing preferences with safe defaults', () => {
    saveReadingPreferences({
      shuffleSpeed: 'slow',
      shuffleIntensity: 'high',
      orientationMode: 'up-only',
    })

    expect(loadReadingPreferences()).toEqual({
      shuffleSpeed: 'slow',
      shuffleIntensity: 'high',
      orientationMode: 'up-only',
    })

    window.localStorage.setItem(
      'ukiyo-tarot.reading-preferences',
      JSON.stringify({ shuffleSpeed: 'bad-value' }),
    )

    expect(loadReadingPreferences()).toEqual({
      shuffleSpeed: 'normal',
      shuffleIntensity: 'medium',
      orientationMode: 'random',
    })
  })
})

