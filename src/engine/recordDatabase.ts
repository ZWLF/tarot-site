import { openDB } from 'idb'
import type { ReadingRecordV2 } from '../domain/tarot'
import {
  loadReadingRecords,
  normalizeReadingRecords,
  storeReadingRecords,
} from './storage'

const DATABASE_NAME = 'ukiyo-tarot'
const DATABASE_VERSION = 1
const STORE_NAME = 'app-state'
const RECORDS_KEY = 'records'

export type RecordDatabaseBackend = 'indexeddb' | 'localstorage'

interface PersistedRecordsPayload {
  records: ReadingRecordV2[]
  updatedAt: string
}

interface HydratedRecordsResult {
  backend: RecordDatabaseBackend
  records: ReadingRecordV2[]
}

const canUseIndexedDb = () =>
  typeof indexedDB !== 'undefined' && indexedDB !== null

const getDatabase = () =>
  openDB(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME)
      }
    },
  })

export const persistReadingRecordsToDatabase = async (
  records: ReadingRecordV2[],
): Promise<HydratedRecordsResult> => {
  const normalizedRecords = storeReadingRecords(records)

  if (!canUseIndexedDb()) {
    return {
      backend: 'localstorage',
      records: normalizedRecords,
    }
  }

  try {
    const database = await getDatabase()
    const payload: PersistedRecordsPayload = {
      records: normalizedRecords,
      updatedAt: new Date().toISOString(),
    }

    await database.put(STORE_NAME, payload, RECORDS_KEY)

    return {
      backend: 'indexeddb',
      records: normalizedRecords,
    }
  } catch {
    return {
      backend: 'localstorage',
      records: normalizedRecords,
    }
  }
}

export const hydrateReadingRecordsFromDatabase = async (): Promise<HydratedRecordsResult> => {
  const localRecords = loadReadingRecords()

  if (!canUseIndexedDb()) {
    return {
      backend: 'localstorage',
      records: localRecords,
    }
  }

  try {
    const database = await getDatabase()
    const storedPayload = await database.get(
      STORE_NAME,
      RECORDS_KEY,
    ) as PersistedRecordsPayload | undefined

    if (Array.isArray(storedPayload?.records) && storedPayload.records.length > 0) {
      const normalizedRecords = normalizeReadingRecords(storedPayload.records)
      storeReadingRecords(normalizedRecords)

      return {
        backend: 'indexeddb',
        records: normalizedRecords,
      }
    }

    if (localRecords.length > 0) {
      await database.put(
        STORE_NAME,
        {
          records: localRecords,
          updatedAt: new Date().toISOString(),
        } satisfies PersistedRecordsPayload,
        RECORDS_KEY,
      )
    }

    return {
      backend: 'indexeddb',
      records: localRecords,
    }
  } catch {
    return {
      backend: 'localstorage',
      records: localRecords,
    }
  }
}
