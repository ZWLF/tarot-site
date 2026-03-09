import { useEffect, useRef } from 'react'

interface ParticleLayerProps {
  intensity?: 'low' | 'medium' | 'high'
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  radius: number
  hue: number
}

const BASE_COUNT: Record<NonNullable<ParticleLayerProps['intensity']>, number> = {
  low: 22,
  medium: 34,
  high: 46,
}

export function ParticleLayer({ intensity = 'medium' }: ParticleLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarsePointer =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches

    if (prefersReduced || coarsePointer) {
      return
    }

    const context = canvas.getContext('2d')

    if (!context) {
      return
    }

    const particles: Particle[] = []
    const maxParticles = BASE_COUNT[intensity]
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, moving: false }
    let rafId = 0
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))

    const setSize = () => {
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const spawn = (x: number, y: number, force = false) => {
      const burst = force ? 3 : 2

      for (let index = 0; index < burst; index += 1) {
        const hue = 205 + ((x / Math.max(window.innerWidth, 1)) * 36 + index * 12) % 36

        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 1.4,
          vy: (Math.random() - 0.5) * 1.4 - 0.1,
          life: 0,
          maxLife: 28 + Math.random() * 20,
          radius: 1 + Math.random() * 2.6,
          hue,
        })
      }

      if (particles.length > maxParticles) {
        particles.splice(0, particles.length - maxParticles)
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.moving = true
      spawn(pointer.x, pointer.y)
    }

    const onPointerDown = (event: PointerEvent) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      spawn(pointer.x, pointer.y, true)
    }

    const render = () => {
      context.fillStyle = 'rgba(5, 10, 18, 0.18)'
      context.fillRect(0, 0, window.innerWidth, window.innerHeight)
      context.globalCompositeOperation = 'lighter'

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index]
        particle.life += 1

        if (particle.life >= particle.maxLife) {
          particles.splice(index, 1)
          continue
        }

        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += 0.01

        const alpha = 1 - particle.life / particle.maxLife
        const radius = particle.radius * (0.75 + alpha)

        context.beginPath()
        context.fillStyle = `hsla(${particle.hue}, 85%, 72%, ${alpha * 0.75})`
        context.arc(particle.x, particle.y, radius, 0, Math.PI * 2)
        context.fill()
      }

      context.globalCompositeOperation = 'source-over'

      if (!pointer.moving && particles.length < maxParticles * 0.35) {
        spawn(pointer.x + (Math.random() - 0.5) * 24, pointer.y + (Math.random() - 0.5) * 24)
      }

      pointer.moving = false
      rafId = window.requestAnimationFrame(render)
    }

    setSize()
    context.clearRect(0, 0, window.innerWidth, window.innerHeight)
    window.addEventListener('resize', setSize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    rafId = window.requestAnimationFrame(render)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('resize', setSize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [intensity])

  return <canvas ref={canvasRef} className="particle-layer" aria-hidden="true" />
}

