export const createSeededRandom = (seed: string | number) => {
  let state = hashSeed(seed)

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

const hashSeed = (seed: string | number) => {
  const source = String(seed)
  let hash = 2166136261

  for (const char of source) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}
