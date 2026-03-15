import { beforeEach, describe, expect, it } from 'vitest'
import { createReading } from '../engine/reading'
import {
  hydrateReadingRecordsFromDatabase,
  persistReadingRecordsToDatabase,
} from '../engine/recordDatabase'
import { buildReadingRecordFromReading } from '../engine/storage'

describe('record database persistence', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('persists reading records into indexeddb and hydrates them back', async () => {
    const reading = createReading(
      {
        question: '这次合作的关键是什么？',
        topic: 'career',
        spreadId: 'holy-triangle',
        variantId: 'diagnostic',
      },
      { seed: 'indexeddb-record' },
    )

    const records = [
      buildReadingRecordFromReading(reading, {
        recordId: 'indexeddb-record',
        saved: true,
        title: '合作判断',
        tags: ['合作', '事业'],
        actionPlanDoneIds: [],
        followUps: [],
      }),
    ]

    const persisted = await persistReadingRecordsToDatabase(records)
    const hydrated = await hydrateReadingRecordsFromDatabase()

    expect(persisted.backend).toBe('indexeddb')
    expect(hydrated.backend).toBe('indexeddb')
    expect(hydrated.records).toHaveLength(1)
    expect(hydrated.records[0].id).toBe('indexeddb-record')
    expect(window.localStorage.getItem('ukiyo-tarot.records-v2')).not.toBeNull()
  })
})
