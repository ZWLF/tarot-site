import type { SavedReadingEntry } from '../domain/history'
import type { ReadingResult } from '../domain/tarot'

export const buildReadingShareText = (
  reading: ReadingResult,
  topicLabel: string,
): string => {
  const cardsLine = reading.cards
    .map(
      (entry) =>
        `${entry.positionLabel}：${entry.card.nameZh}${entry.drawn.orientation === 'up' ? '（正位）' : '（逆位）'}`,
    )
    .join(' / ')

  return [
    `浮世占｜${reading.input.question}`,
    `主题：${topicLabel}`,
    `牌阵：${reading.spread.title}`,
    `牌面：${cardsLine}`,
    `结论：${reading.summary}`,
    `建议：${reading.advice.join('；')}`,
  ].join('\n')
}

export const buildSavedReadingShareText = (entry: SavedReadingEntry): string => {
  const cardsLine = entry.cards
    .map(
      (card) =>
        `${card.positionLabel}：${card.cardName}${card.orientation === 'up' ? '（正位）' : '（逆位）'}`,
    )
    .join(' / ')

  return [
    `浮世占｜${entry.question}`,
    `主题：${entry.topicLabel}`,
    `牌阵：${entry.spreadTitle}`,
    `牌面：${cardsLine}`,
    `结论：${entry.summary}`,
    `建议：${entry.advice.join('；')}`,
  ].join('\n')
}

export const shareText = async (title: string, text: string) => {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    await navigator.share({ title, text })
    return '已调用系统分享面板。'
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return '分享文案已复制到剪贴板。'
  }

  throw new Error('当前环境不支持系统分享或剪贴板复制。')
}
