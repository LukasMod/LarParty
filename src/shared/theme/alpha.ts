export interface Rgb {
  r: number
  g: number
  b: number
}

// Expects a `#RRGGBB` string. Anything else yields NaN or shifted channels,
// which is loud enough in the rendered color to catch in review.
export function hexToRgb(hex: string): Rgb {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  }
}

export function withAlpha(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
