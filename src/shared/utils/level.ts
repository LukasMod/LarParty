// Formats a signed level for display and for the generation prompt. A positive
// level carries an explicit `+` so "+2" reads as an intensifier at a glance,
// while 0 and negatives use the plain number. Language-agnostic (digits and a
// sign), so the same helper serves the UI and the localized prompt.
export function levelLabel(level: number) {
  return level > 0 ? `+${level}` : `${level}`
}
