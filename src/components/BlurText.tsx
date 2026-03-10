import { motion, useReducedMotion } from 'motion/react'

interface BlurTextProps {
  className?: string
  delay?: number
  text: string
}

export function BlurText({ className, delay = 0.08, text }: BlurTextProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <p className={className}>{text}</p>
  }

  return (
    <motion.p
      className={className}
      initial={{ opacity: 0, filter: 'blur(16px)', y: 12 }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      transition={{ duration: 0.72, ease: [0.25, 0.46, 0.45, 0.94], delay }}
    >
      {text}
    </motion.p>
  )
}
