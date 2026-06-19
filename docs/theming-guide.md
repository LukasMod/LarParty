# Theming Guide

This document describes how theming should work in LarParty and what patterns we should follow when building themed UI.

## Goals

- Keep one source of truth for theme definitions.
- Reuse semantic theme tokens instead of hardcoding colors.
- Use Unistyles in the intended way.
- Support both the active app theme and party-scoped theme presentation.
- Avoid creating parallel theme systems.

## Source of truth

All app theme definitions live in:

- `src/shared/theme/unistyles.ts`

The `appThemes` object is the canonical source for:

- colors
- spacing
- radius
- fonts

Theme tokens should be added and maintained there.

## Theme categories and party themes

Party theme selection is based on `ThemeCategory`.

To map a party category to an actual theme object, use:

- `src/shared/theme/party-theme.ts`

This helper returns one of the existing `appThemes` entries. It should stay thin and should not duplicate color definitions.

## Preferred primitives

For themed UI, prefer these shared primitives:

- `src/components/themed-text.tsx`
- `src/components/themed-view.tsx`

They support two modes:

1. **Default app theme**
   - Uses the active current theme from `useTheme()`.
2. **Theme override**
   - Uses `themeOverride` when a component needs to render with a specific party theme.

### Examples

```tsx
<ThemedText>Default themed text</ThemedText>
<ThemedText themeColor="textSecondary">Secondary text</ThemedText>

<ThemedView type="surface" />
```

Party-scoped override:

```tsx
const partyTheme = getPartyTheme(party.themeCategory)

<ThemedView themeOverride={partyTheme} type="surface" />
<ThemedText themeOverride={partyTheme}>
  Party themed title
</ThemedText>
<ThemedText themeOverride={partyTheme} themeColor="textSecondary">
  Party themed metadata
</ThemedText>
```

## Semantic tokens first

Always prefer semantic theme tokens over raw color values.

Good examples:

- `text`
- `textSecondary`
- `background`
- `backgroundMuted`
- `surface`
- `surfaceSelected`
- `border`
- `primary`
- `cardPreviewAccent`

Avoid building UI around direct hex values or ad hoc color names in feature code.

## Unistyles guidelines we should follow

LarParty uses **react-native-unistyles v3** patterns.

### Prefer `StyleSheet.create`

Component styling should live in `StyleSheet.create(...)` whenever possible.

### Prefer dynamic style functions for prop-driven styles

If a style depends on props like:

- party theme
- selected state
- accepted vs draft state
- display mode

prefer dynamic functions inside the stylesheet.

Example:

```tsx
const styles = StyleSheet.create(theme => ({
  card: (isAccepted: boolean) => ({
    borderRadius: theme.radius.control,
    borderWidth: 1,
    backgroundColor: isAccepted
      ? theme.colors.surfaceSelected
      : theme.colors.surface,
  }),
}))
```

### Use variants for stable component variants

Variants are a good fit for well-defined option sets like:

- `primary | secondary`
- `small | medium | large`
- `selected | default`

If the styling is mostly based on runtime theme objects or list-item-specific values, dynamic functions are usually a better fit.

### Avoid ad hoc inline styling when it is part of the component design

Try to avoid patterns like:

```tsx
style={{ color: someTheme.colors.text }}
style={[styles.card, { backgroundColor: someTheme.colors.surface }]}
```

when the same behavior can live in Unistyles.

Inline styles are acceptable for one-off cases, but should not become the default theming strategy.

## Do not create a parallel theme layer

Do not duplicate the same color definitions in a second helper file if they already exist in `appThemes`.

### Prefer

- `appThemes` as the source of truth
- `getPartyTheme(themeCategory)` as a thin mapper
- `ThemedText` / `ThemedView` with `themeOverride`

### Avoid

- extra files that re-list the same theme colors
- passing many separate props like `accentColor`, `textColor`, `borderColor`
- manual theme reconstruction in feature code

## Recommended workflow when building themed UI

1. Check whether the needed semantic token already exists in `appThemes`.
2. If yes, use it through `ThemedText` / `ThemedView`.
3. If party-scoped styling is needed, get the theme with `getPartyTheme(...)` and pass it as `themeOverride`.
4. Keep layout and structural styles in `StyleSheet.create(...)`.
5. Use Unistyles dynamic functions or variants for prop-driven styling.
6. Only add new tokens to `unistyles.ts` when the design system truly needs them.

## Practical do / don't

### Do

```tsx
const partyTheme = getPartyTheme(party.themeCategory)

<ThemedView themeOverride={partyTheme} type="surface" style={styles.card}>
  <ThemedText themeOverride={partyTheme}>
    {party.title}
  </ThemedText>
  <ThemedText themeOverride={partyTheme} themeColor="textSecondary">
    Metadata
  </ThemedText>
</ThemedView>
```

### Don't

```tsx
const colors = {
  background: '#123456',
  text: '#ffffff',
}

<View style={{ backgroundColor: colors.background }}>
  <Text style={{ color: colors.text }}>Title</Text>
</View>
```

### Don't

```tsx
<PartyCard
  accentColor={...}
  textColor={...}
  borderColor={...}
  backgroundColor={...}
/>
```

Instead, pass the theme or the theme category and derive semantic styling from the shared theme system.

## When to add a new theme token

Add a new token to `src/shared/theme/unistyles.ts` when:

- the color role is semantic and reused
- multiple components need the same design meaning
- the current tokens cannot express the UI clearly

Do not add a token just to avoid a single local styling decision.

## Summary

The theming rules for LarParty are:

- `appThemes` in `src/shared/theme/unistyles.ts` is the single source of truth.
- Use `getPartyTheme(...)` to map a party category to an existing theme.
- Prefer `ThemedText` and `ThemedView` for color application.
- Use `themeOverride` for party-scoped UI.
- Follow Unistyles v3 patterns: `StyleSheet.create`, dynamic functions, and variants.
- Avoid duplicate theme layers and scattered raw color props.
