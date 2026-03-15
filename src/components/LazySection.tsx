import { useEffect, useRef, useState, type ReactNode } from 'react'

interface LazySectionProps {
  children: ReactNode
  fallback: ReactNode
  rootMargin?: string
}

export function LazySection({
  children,
  fallback,
  rootMargin = '240px 0px',
}: LazySectionProps) {
  const [shouldRender, setShouldRender] = useState(
    () => typeof IntersectionObserver === 'undefined',
  )
  const elementRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (shouldRender || typeof IntersectionObserver === 'undefined') {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRender(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [rootMargin, shouldRender])

  return <div ref={elementRef}>{shouldRender ? children : fallback}</div>
}
