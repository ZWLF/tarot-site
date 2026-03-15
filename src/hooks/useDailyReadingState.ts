import { useMemo, useState } from 'react'
import type { DailyReflection } from '../domain/tarot'
import { createDailyReading, formatDailyLabel } from '../lib/daily'
import { buildLocalDateKey } from '../lib/localDate'
import { useCurrentLocalDate } from './useCurrentLocalDate'

interface DailyClientState {
  message: string | null
  reflection: DailyReflection
  revealed: boolean
}

const createEmptyReflection = (): DailyReflection => ({
  morningIntent: '',
  eveningReview: '',
  resonance: null,
})

const createDefaultDailyState = (): DailyClientState => ({
  message: null,
  reflection: createEmptyReflection(),
  revealed: false,
})

export const useDailyReadingState = () => {
  const currentDate = useCurrentLocalDate()
  const [stateByDate, setStateByDate] = useState<Record<string, DailyClientState>>({})
  const dailyDateKey = buildLocalDateKey(currentDate)
  const currentState = stateByDate[dailyDateKey] ?? createDefaultDailyState()

  const dailyReading = useMemo(() => createDailyReading(currentDate), [currentDate])
  const dailyLabel = useMemo(() => formatDailyLabel(currentDate), [currentDate])

  const updateCurrentState = (
    updater: (current: DailyClientState) => DailyClientState,
  ) => {
    setStateByDate((current) => ({
      ...current,
      [dailyDateKey]: updater(current[dailyDateKey] ?? createDefaultDailyState()),
    }))
  }

  return {
    dailyDate: currentDate,
    dailyDateKey,
    dailyLabel,
    dailyMessage: currentState.message,
    dailyReading,
    dailyReflection: currentState.reflection,
    dailyRevealed: currentState.revealed,
    setDailyMessage: (message: string | null) =>
      updateCurrentState((current) => ({
        ...current,
        message,
      })),
    setDailyReflection: (reflection: DailyReflection) =>
      updateCurrentState((current) => ({
        ...current,
        reflection,
      })),
    setDailyRevealed: (revealed: boolean) =>
      updateCurrentState((current) => ({
        ...current,
        revealed,
      })),
  }
}
