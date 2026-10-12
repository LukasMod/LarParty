export function hashCode(value: string) {
  let hash = 0

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }

  return Math.abs(hash)
}

// Maps a seed onto the [0, 1) range so repeated animations can run out of sync.
export function seedOffset(seed: string, buckets = 1000) {
  return (hashCode(seed) % buckets) / buckets
}
