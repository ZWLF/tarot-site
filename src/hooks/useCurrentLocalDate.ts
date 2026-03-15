import { useEffect, useState } from 'react'
import { getMillisecondsUntilNextLocalDay } from '../lib/localDate'

export const useCurrentLocalDate = () => {
  const [currentDate, setCurrentDate] = useState(() => new Date())

  useEffect(() => {
    let timeoutId: number | null = null

    const scheduleRollover = () => {
      timeoutId = window.setTimeout(() => {
        setCurrentDate(new Date())
        scheduleRollover()
      }, getMillisecondsUntilNextLocalDay(new Date()) + 50)
    }

    scheduleRollover()

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [])

  return currentDate
}
