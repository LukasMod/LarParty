import { readFileSync } from 'node:fs'

// The palette lives in TypeScript next to the Unistyles config. This script is
// plain Node so it runs without a bundler, a test runner, or ts-node.
const SOURCE = new URL('../src/shared/theme/unistyles.ts', import.meta.url)
const HEX = /^#[0-9a-fA-F]{6}$/

function readPalettes(file) {
  const source = readFileSync(file, 'utf8')
  const palettes = {}
  const themeRe = /^ {2}'?([\w-]+)'?: createTheme\({([\s\S]*?)^ {2}\}\),$/gm

  for (const [, themeName, body] of source.matchAll(themeRe)) {
    const colors = Object.fromEntries(
      [...body.matchAll(/(\w+): '(#[0-9a-fA-F]{6})'/g)].map(
        ([, token, hex]) => [token, hex.toUpperCase()],
      ),
    )
    palettes[themeName] = colors
  }

  return palettes
}

const relativeLuminance = (hex) => {
  const channels = [0, 2, 4].map(
    (i) => parseInt(hex.slice(i + 1, i + 3), 16) / 255,
  )
  const linear = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

const contrastRatio = (a, b) => {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  )
  return (hi + 0.05) / (lo + 0.05)
}

// One rule set for every theme. Foreground must clear `min` against each background
// it can actually sit on: 4.5 for body text, 3 for large text and UI boundaries.
const RULES = [
  ['text', ['background', 'surface', 'surfaceSelected'], 4.5],
  ['textSecondary', ['background', 'surface'], 4.5],
  ['primaryText', ['primary'], 4.5],
  ['primary', ['background'], 4.5],
  ['primary', ['surface'], 3],
  ['border', ['background', 'surface'], 3],
  ['accent', ['background', 'surface'], 3],
]

const REQUIRED_TOKENS = [
  'text',
  'textSecondary',
  'background',
  'surface',
  'surfaceSelected',
  'border',
  'primary',
  'primaryText',
  'accent',
]

// Party themes share one neutral base, so their per-theme tokens are the only thing
// that varies. Read the base and the theme list straight from the same file.
function readPartyBase(file) {
  const source = readFileSync(file, 'utf8')
  const base = source.match(
    /export const partyThemeBaseColors = \{([\s\S]*?)\} as const/,
  )
  const names = source.match(
    /export const partyThemeNames = \[([^\]]*)\] as const/,
  )
  if (!base || !names) return null

  return {
    names: [...names[1].matchAll(/'([^']+)'/g)].map(([, name]) => name),
    colors: Object.fromEntries(
      [...base[1].matchAll(/(\w+): '(#[0-9a-fA-F]{6})'/g)].map(([, k, hex]) => [
        k,
        hex.toUpperCase(),
      ]),
    ),
  }
}

const failures = []
const palettes = readPalettes(SOURCE)
const partyBase = readPartyBase(SOURCE)

if (!Object.keys(palettes).length) {
  console.error(
    `No palettes parsed from ${SOURCE.pathname}. The parser and unistyles.ts have drifted — fix the script.`,
  )
  process.exit(1)
}

for (const [themeName, colors] of Object.entries(palettes)) {
  const missing = REQUIRED_TOKENS.filter((token) => !(token in colors))
  const extra = Object.keys(colors).filter(
    (token) => !REQUIRED_TOKENS.includes(token),
  )
  if (missing.length) {
    failures.push(`${themeName}: missing tokens ${missing.join(', ')}`)
    continue
  }
  if (extra.length) {
    failures.push(
      `${themeName}: unexpected tokens ${extra.join(', ')} — every theme declares the same ${REQUIRED_TOKENS.length}`,
    )
  }

  const bad = Object.entries(colors).filter(([, hex]) => !HEX.test(hex))
  for (const [token, hex] of bad) {
    failures.push(`${themeName}.${token}: "${hex}" is not a 6-digit hex color`)
  }

  for (const [foreground, backgrounds, min] of RULES) {
    for (const background of backgrounds) {
      const ratio = contrastRatio(colors[foreground], colors[background])
      if (ratio < min) {
        failures.push(
          `${themeName}: ${foreground} on ${background} is ${ratio.toFixed(2)}, needs ${min}`,
        )
      }
    }
  }

  if (partyBase?.names.includes(themeName)) {
    for (const [token, hex] of Object.entries(partyBase.colors)) {
      if (colors[token] !== hex) {
        failures.push(
          `${themeName}.${token}: ${colors[token]} differs from the shared party base ${hex}`,
        )
      }
    }
  }
}

for (const [themeName, colors] of Object.entries(palettes)) {
  const summary = [
    ['text', 'background'],
    ['textSecondary', 'background'],
    ['primaryText', 'primary'],
    ['primary', 'surface'],
    ['border', 'surface'],
    ['accent', 'surface'],
  ].map(
    ([fg, bg]) =>
      `${fg}/${bg} ${contrastRatio(colors[fg], colors[bg]).toFixed(2)}`,
  )
  console.log(`${themeName}: ${summary.join('  ')}`)
}

if (failures.length) {
  console.error(`\n${failures.length} contrast failure(s):`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log(
  `\nAll ${Object.keys(palettes).length} themes pass every contrast rule.`,
)
