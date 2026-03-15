interface StatusMessageProps {
  className?: string
  message: string | null
}

export function StatusMessage({
  className = 'selection-note',
  message,
}: StatusMessageProps) {
  if (!message) {
    return null
  }

  return (
    <p aria-live="polite" className={className} role="status">
      {message}
    </p>
  )
}
