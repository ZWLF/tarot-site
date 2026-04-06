import type { Orientation, ReadingRecord, ReadingResult } from '../domain/tarot'
import { layoutParagraphLines } from './textLayout'

interface PosterCard {
  label: string
  cardName: string
  orientation: Orientation
}

interface PosterPayload {
  title: string
  question: string
  spreadTitle: string
  summary: string
  cards: PosterCard[]
}

const SVG_FONT_TOKEN_CSS = `
  :root {
    --font-display: 'Baskerville Old Face', 'Times New Roman', 'Songti SC', serif;
    --font-accent: 'Cormorant Garamond', 'Baskerville Old Face', 'Times New Roman', serif;
  }
`
const POSTER_TEXT_FONT = `400 18px "Baskerville Old Face", "Times New Roman", "Songti SC", serif`
const POSTER_SUMMARY_FONT = `400 22px "Baskerville Old Face", "Times New Roman", "Songti SC", serif`
const POSTER_QUESTION_MAX_WIDTH = 652
const POSTER_SUMMARY_MAX_WIDTH = 652
const POSTER_QUESTION_LINE_HEIGHT = 28
const POSTER_SUMMARY_LINE_HEIGHT = 38
const POSTER_QUESTION_MAX_LINES = 2
const POSTER_SUMMARY_MAX_LINES = 4

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

const renderPosterParagraph = ({
  fill,
  fontFamily,
  fontSize,
  lineHeight,
  lines,
  x,
  y,
}: {
  fill: string
  fontFamily: string
  fontSize: number
  lineHeight: number
  lines: string[]
  x: number
  y: number
}) =>
  lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * lineHeight}" fill="${fill}" font-size="${fontSize}" font-family="${fontFamily}">${escapeXml(line)}</text>`,
    )
    .join('')

export const buildReadingShareText = (
  reading: ReadingResult,
  topicLabel: string,
): string => {
  const cardsLine = reading.cards
    .map(
      (entry) =>
        `${entry.positionLabel}: ${entry.card.nameZh}${
          entry.drawn.orientation === 'up'
            ? ' (正位)'
            : ' (逆位)'
        }`,
    )
    .join(' / ')

  return [
    `浮世占 / ${reading.input.question}`,
    `主题: ${topicLabel}`,
    `牌阵: ${reading.spread.title}`,
    reading.spread.activeVariantTitle
      ? `模式: ${reading.spread.activeVariantTitle}`
      : null,
    `牌面: ${cardsLine}`,
    `结论: ${reading.summary}`,
    `建议: ${reading.advice.join('；')}`,
  ]
    .filter(Boolean)
    .join('\n')
}

export const buildRecordShareText = (record: ReadingRecord): string => {
  const cardsLine = record.cards
    .map(
      (card) =>
        `${card.positionLabel}: ${card.cardName}${
          card.orientation === 'up'
            ? ' (正位)'
            : ' (逆位)'
        }`,
    )
    .join(' / ')

  return [
    `浮世占 / ${record.title || record.question}`,
    `主题: ${record.topicLabel}`,
    `牌阵: ${record.spreadTitle}`,
    record.variantTitle ? `模式: ${record.variantTitle}` : null,
    `牌面: ${cardsLine}`,
    `结论: ${record.summary}`,
  ]
    .filter(Boolean)
    .join('\n')
}

export const buildReadingPosterSvg = (payload: PosterPayload) => {
  const questionLayout = layoutParagraphLines({
    font: POSTER_TEXT_FONT,
    lineHeight: POSTER_QUESTION_LINE_HEIGHT,
    maxLines: POSTER_QUESTION_MAX_LINES,
    maxWidth: POSTER_QUESTION_MAX_WIDTH,
    text: payload.question,
  })
  const summaryLayout = layoutParagraphLines({
    font: POSTER_SUMMARY_FONT,
    lineHeight: POSTER_SUMMARY_LINE_HEIGHT,
    maxLines: POSTER_SUMMARY_MAX_LINES,
    maxWidth: POSTER_SUMMARY_MAX_WIDTH,
    text: payload.summary,
  })
  const cardRows = payload.cards
    .slice(0, 10)
    .map((card, index) => {
      const row = Math.floor(index / 2)
      const column = index % 2
      const x = 54 + column * 328
      const y = 268 + row * 86

      return `
        <g transform="translate(${x} ${y})">
          <rect width="284" height="58" rx="18" fill="rgba(255,255,255,0.08)" stroke="rgba(255,232,184,0.16)" />
          <text x="20" y="23" fill="#e4c98a" font-size="14" font-family="var(--font-accent)">${escapeXml(card.label)}</text>
          <text x="20" y="42" fill="#f7f0de" font-size="20" font-family="var(--font-display)">${escapeXml(card.cardName)}</text>
          <text x="242" y="37" fill="#cfd7e8" font-size="12" text-anchor="end" font-family="var(--font-accent)">${card.orientation === 'up' ? '正位' : '逆位'}</text>
        </g>
      `
    })
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="980" viewBox="0 0 760 980" fill="none">
    <defs>
      <linearGradient id="poster-bg" x1="120" y1="60" x2="660" y2="920" gradientUnits="userSpaceOnUse">
        <stop stop-color="#19324a"/>
        <stop offset="0.45" stop-color="#0f1c29"/>
        <stop offset="1" stop-color="#1d1015"/>
      </linearGradient>
      <radialGradient id="poster-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(620 120) rotate(142) scale(280 240)">
        <stop stop-color="#d7a34f" stop-opacity="0.34"/>
        <stop offset="1" stop-color="#d7a34f" stop-opacity="0"/>
      </radialGradient>
      <style><![CDATA[${SVG_FONT_TOKEN_CSS}]]></style>
    </defs>
    <rect width="760" height="980" rx="34" fill="url(#poster-bg)"/>
    <rect width="760" height="980" rx="34" fill="url(#poster-glow)"/>
    <rect x="28" y="28" width="704" height="924" rx="28" stroke="rgba(255,238,205,0.18)"/>
    <text x="54" y="84" fill="#e4c98a" font-size="20" font-family="var(--font-accent)" letter-spacing="4">UKIYO TAROT SALON</text>
    <text x="54" y="144" fill="#f7f0de" font-size="42" font-family="var(--font-display)">${escapeXml(payload.title)}</text>
    <text x="54" y="190" fill="#cad5e5" font-size="18" font-family="var(--font-display)">${escapeXml(payload.spreadTitle)}</text>
    ${renderPosterParagraph({
      fill: '#dfe8f8',
      fontFamily: 'var(--font-display)',
      fontSize: 18,
      lineHeight: POSTER_QUESTION_LINE_HEIGHT,
      lines: questionLayout.lines,
      x: 54,
      y: 236,
    })}
    ${cardRows}
    <text x="54" y="734" fill="#e4c98a" font-size="18" font-family="var(--font-accent)" letter-spacing="3">SUMMARY</text>
    ${renderPosterParagraph({
      fill: '#f8f2e5',
      fontFamily: 'var(--font-display)',
      fontSize: 22,
      lineHeight: POSTER_SUMMARY_LINE_HEIGHT,
      lines: summaryLayout.lines,
      x: 54,
      y: 782,
    })}
    <text x="54" y="932" fill="#bfc9d9" font-size="16" font-family="var(--font-display)">浮世塔罗 · 以牌为镜，以行动落地</text>
  </svg>`
}

export const shareText = async (title: string, text: string) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return '分享文案已复制到剪贴板。'
  }

  if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
    window.prompt(`${title}：请手动复制以下内容`, text)
    return '当前环境不支持剪贴板，已打开手动复制面板。'
  }

  throw new Error('当前环境不支持剪贴板复制。为保护隐私，已禁用系统分享。')
}

export const downloadPosterPng = async (
  payload: PosterPayload,
  fileName: string,
) => {
  const svg = buildReadingPosterSvg(payload)
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image()
      nextImage.onload = () => resolve(nextImage)
      nextImage.onerror = () => reject(new Error('海报图像生成失败。'))
      nextImage.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = 760
    canvas.height = 980
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('当前环境不支持海报导出。')
    }

    context.drawImage(image, 0, 0)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png'),
    )

    if (!blob) {
      throw new Error('PNG 海报生成失败。')
    }

    const blobUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = blobUrl
    anchor.download = fileName
    anchor.click()
    URL.revokeObjectURL(blobUrl)
    return 'PNG 海报已开始下载。'
  } finally {
    URL.revokeObjectURL(url)
  }
}
