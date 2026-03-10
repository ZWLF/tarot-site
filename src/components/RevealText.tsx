import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'

type RevealTextTag = 'h1' | 'h2' | 'h3' | 'span'

interface RevealTextProps {
  as?: RevealTextTag
  className?: string
  stepMs?: number
  text: string
}

const segmentText = (text: string) => {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    return Array.from(
      new Intl.Segmenter('zh-CN', { granularity: 'grapheme' }).segment(text),
      (entry) => entry.segment,
    )
  }

  return Array.from(text)
}

const joinClassNames = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(' ')

export function RevealText({
  as = 'span',
  className,
  stepMs = 42,
  text,
}: RevealTextProps) {
  const elementRef = useRef<HTMLHeadingElement | HTMLSpanElement | null>(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')
  const [reduceMotion, setReduceMotion] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  const segments = useMemo(() => segmentText(text), [text])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncPreference = () => setReduceMotion(mediaQuery.matches)

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncPreference)

      return () => mediaQuery.removeEventListener('change', syncPreference)
    }

    mediaQuery.addListener(syncPreference)

    return () => mediaQuery.removeListener(syncPreference)
  }, [])

  useEffect(() => {
    if (reduceMotion || visible) {
      return
    }

    if (typeof IntersectionObserver === 'undefined' || elementRef.current === null) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries

        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.2 },
    )

    observer.observe(elementRef.current)

    return () => observer.disconnect()
  }, [reduceMotion, visible])

  const Tag = as
  const setElementRef = (node: HTMLHeadingElement | HTMLSpanElement | null) => {
    elementRef.current = node
  }
  const content: ReactNode = reduceMotion ? (
    text
  ) : (
    <>
      {segments.map((segment, index) => (
        <span
          key={`${segment}-${index}`}
          aria-hidden="true"
          className={joinClassNames(
            'reveal-text__segment',
            segment.trim().length === 0 && 'is-space',
          )}
          style={{ '--segment-delay': `${index * stepMs}ms` } as CSSProperties}
        >
          {segment}
        </span>
      ))}
    </>
  )

  return (
    <Tag
      ref={setElementRef}
      aria-label={text}
      className={joinClassNames('reveal-text', visible && 'is-visible', className)}
    >
      {content}
    </Tag>
  )
}
