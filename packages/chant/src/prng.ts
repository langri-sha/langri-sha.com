/**
 * Mulberry32 seeded PRNG. Returns values in [0, 1).
 */
export function createPrng(seed: number): () => number {
  let t = seed | 0
  return () => {
    t = (t + 0x6d2b79f5) | 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function seededRand(
  random: () => number,
  min: number,
  max: number,
): number {
  return random() * (max - min) + min
}
