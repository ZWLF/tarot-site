import {
  type PreparedText,
  type PreparedTextWithSegments,
  layout,
  layoutWithLines,
  prepare,
  prepareWithSegments,
  walkLineRanges,
} from '@chenglou/pretext'

type WhiteSpaceMode = 'normal' | 'pre-wrap'

export interface TextLayoutInput {
  font: string
  lineHeight: number
  maxWidth: number
  maxLines?: number
  text: string
  whiteSpace?: WhiteSpaceMode
}

export interface TextMeasureResult {
  height: number
  lineCount: number
  measured: 'fallback' | 'pretext'
  truncated: boolean
}

export interface TextLinesResult extends TextMeasureResult {
  lines: string[]
}

const preparedCache = new Map<string, PreparedText>()
const preparedSegmentsCache = new Map<string, PreparedTextWithSegments>()

const PREPARE_OPTIONS_DEFAULT: {
  whiteSpace: WhiteSpaceMode
} = {
  whiteSpace: 'normal',
}

const safeMaxWidth = (width: number) => Math.max(1, Math.round(width))

const normalizeText = (text: string, whiteSpace: WhiteSpaceMode) =>
  whiteSpace === 'pre-wrap' ? text : text.replaceAll(/\s+/g, ' ').trim()

const getFontSizeFromShorthand = (font: string) => {
  const match = font.match(/(\d+(?:\.\d+)?)px/)
  return match ? Number.parseFloat(match[1]!) : 16
}

const buildCacheKey = (
  text: string,
  font: string,
  whiteSpace: WhiteSpaceMode,
  mode: 'basic' | 'segments',
) => `${font}::${whiteSpace}::${mode}::${text}`

const getPrepared = (
  text: string,
  font: string,
  whiteSpace: WhiteSpaceMode,
) => {
  const key = buildCacheKey(text, font, whiteSpace, 'basic')
  const cached = preparedCache.get(key)

  if (cached) {
    return cached
  }

  const prepared = prepare(text, font, { whiteSpace })
  preparedCache.set(key, prepared)
  return prepared
}

const getPreparedWithSegments = (
  text: string,
  font: string,
  whiteSpace: WhiteSpaceMode,
) => {
  const key = buildCacheKey(text, font, whiteSpace, 'segments')
  const cached = preparedSegmentsCache.get(key)

  if (cached) {
    return cached
  }

  const prepared = prepareWithSegments(text, font, { whiteSpace })
  preparedSegmentsCache.set(key, prepared)
  return prepared
}

const fallbackLineWrap = (text: string, maxWidth: number, font: string) => {
  const normalized = normalizeText(text, PREPARE_OPTIONS_DEFAULT.whiteSpace)
  if (!normalized) {
    return ['']
  }

  const fontSize = getFontSizeFromShorthand(font)
  const approxCharWidth = Math.max(6, fontSize * 0.56)
  const maxChars = Math.max(1, Math.floor(maxWidth / approxCharWidth))
  const lines: string[] = []

  for (let index = 0; index < normalized.length; index += maxChars) {
    lines.push(normalized.slice(index, index + maxChars))
  }

  return lines
}

const applyMaxLines = (
  lines: string[],
  maxLines: number | undefined,
): { lines: string[]; truncated: boolean } => {
  if (!maxLines || lines.length <= maxLines) {
    return { lines, truncated: false }
  }

  const visible = lines.slice(0, maxLines)
  const last = visible[visible.length - 1] ?? ''
  visible[visible.length - 1] = `${last.replace(/[.。！？!?,，;；:：\s]+$/u, '')}…`

  return {
    lines: visible,
    truncated: true,
  }
}

export const measureParagraph = ({
  font,
  lineHeight,
  maxLines,
  maxWidth,
  text,
  whiteSpace = PREPARE_OPTIONS_DEFAULT.whiteSpace,
}: TextLayoutInput): TextMeasureResult => {
  const normalizedText = normalizeText(text, whiteSpace)
  const width = safeMaxWidth(maxWidth)

  try {
    const prepared = getPrepared(normalizedText, font, whiteSpace)
    const measured = layout(prepared, width, lineHeight)
    const cappedLineCount = maxLines
      ? Math.min(measured.lineCount, maxLines)
      : measured.lineCount

    return {
      height: Math.max(lineHeight, cappedLineCount * lineHeight),
      lineCount: Math.max(1, cappedLineCount),
      measured: 'pretext',
      truncated: Boolean(maxLines && measured.lineCount > maxLines),
    }
  } catch {
    const lines = fallbackLineWrap(normalizedText, width, font)
    const capped = applyMaxLines(lines, maxLines)

    return {
      height: Math.max(lineHeight, capped.lines.length * lineHeight),
      lineCount: Math.max(1, capped.lines.length),
      measured: 'fallback',
      truncated: capped.truncated,
    }
  }
}

export const layoutParagraphLines = ({
  font,
  lineHeight,
  maxLines,
  maxWidth,
  text,
  whiteSpace = PREPARE_OPTIONS_DEFAULT.whiteSpace,
}: TextLayoutInput): TextLinesResult => {
  const normalizedText = normalizeText(text, whiteSpace)
  const width = safeMaxWidth(maxWidth)

  try {
    const prepared = getPreparedWithSegments(
      normalizedText,
      font,
      whiteSpace,
    )
    const measured = layoutWithLines(prepared, width, lineHeight)
    const rawLines = measured.lines.map((entry) => entry.text)
    const capped = applyMaxLines(rawLines, maxLines)

    return {
      height: Math.max(lineHeight, capped.lines.length * lineHeight),
      lineCount: Math.max(1, capped.lines.length),
      lines: capped.lines,
      measured: 'pretext',
      truncated: capped.truncated,
    }
  } catch {
    const wrapped = fallbackLineWrap(normalizedText, width, font)
    const capped = applyMaxLines(wrapped, maxLines)

    return {
      height: Math.max(lineHeight, capped.lines.length * lineHeight),
      lineCount: Math.max(1, capped.lines.length),
      lines: capped.lines,
      measured: 'fallback',
      truncated: capped.truncated,
    }
  }
}

export const measureNaturalTextWidth = ({
  font,
  text,
  whiteSpace = PREPARE_OPTIONS_DEFAULT.whiteSpace,
}: Pick<TextLayoutInput, 'font' | 'text' | 'whiteSpace'>) => {
  const normalizedText = normalizeText(text, whiteSpace)

  try {
    const prepared = getPreparedWithSegments(
      normalizedText,
      font,
      whiteSpace,
    )
    let maxWidth = 0
    walkLineRanges(prepared, 1_000_000, (line) => {
      maxWidth = Math.max(maxWidth, line.width)
    })
    return {
      measured: 'pretext' as const,
      width: Math.max(1, maxWidth),
    }
  } catch {
    const fontSize = getFontSizeFromShorthand(font)
    const approx = Math.max(1, normalizedText.length * Math.max(6, fontSize * 0.56))
    return {
      measured: 'fallback' as const,
      width: approx,
    }
  }
}
