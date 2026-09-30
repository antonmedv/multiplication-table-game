/** Numberblocks-style colour for each number 1–10, tuned for a dark background. */
export const NUMBER_COLORS: Readonly<Record<number, string>> = {
  1: '#ff3d3d', // red
  2: '#ff8a1f', // orange
  3: '#ffd21f', // yellow
  4: '#3ddc5a', // green
  5: '#4fc9ff', // light blue
  6: '#6d5dff', // indigo
  7: '#b45cff', // violet
  8: '#ff4fb0', // pink
  9: '#b8c0cc', // grey
  10: '#ffffff', // white
}

export const NUMBERS = Object.keys(NUMBER_COLORS).map(Number)

export const FALLBACK_COLOR = '#8a93a3'

export function colorOf(n: number): string {
  return NUMBER_COLORS[n] ?? FALLBACK_COLOR
}
