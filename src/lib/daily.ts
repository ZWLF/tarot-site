import type { ReadingResult } from '../domain/tarot'
import { createReading } from '../engine/reading'

export const buildDailySeed = (date: Date = new Date()) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `daily-${year}-${month}-${day}`
}

export const formatDailyLabel = (date: Date = new Date()) =>
  new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date)

export const createDailyReading = (date: Date = new Date()): ReadingResult =>
  createReading(
    {
      question: '今天最值得留意的能量是什么？',
      topic: 'general',
      spreadId: 'daily-energy',
    },
    { seed: buildDailySeed(date) },
  )
