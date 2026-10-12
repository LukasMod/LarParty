// Native/async boundaries that pure-logic tests never need to exercise.
// Kept minimal: anything a util imports transitively has to be stubbed here.
// Factories stay self-contained because jest hoists `jest.mock` calls above
// module scope.

jest.mock('react-native-mmkv', () => {
  const createStore = () => {
    const backing = new Map<string, string>()

    return {
      set: (key: string, value: string) => {
        backing.set(key, value)
      },
      getString: (key: string) => backing.get(key),
      remove: (key: string) => {
        backing.delete(key)
      },
      clearAll: () => {
        backing.clear()
      },
      getAllKeys: () => [...backing.keys()],
      contains: (key: string) => backing.has(key),
    }
  }

  return { createMMKV: () => createStore(), MMKV: createStore() }
})

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageTag: 'en-US', languageCode: 'en' }],
  useLocales: () => [{ languageTag: 'en-US', languageCode: 'en' }],
}))

// Unistyles resolves its stylesheet through a Nitro turbo module on import, which
// has no host in Jest. The replacement keeps the shapes components use: the theme
// builder passed to `StyleSheet.create` is called with a token stand-in, and a
// variant function inside it is invoked once so the result is a plain style object.
// `mock`-prefixed module scope helpers are the sanctioned way to reach a hoisted
// `jest.mock` factory.

// Spacing and radius tokens must read as numbers, color and font tokens as strings.
const mockNumericTokenGroups = ['spacing', 'radius', 'breakpoints']

function mockThemeGroup(_target: unknown, key: string | symbol) {
  const numeric =
    typeof key === 'string' && mockNumericTokenGroups.includes(key)

  return new Proxy(Object.create(null), {
    get: () => (numeric ? 8 : '#000000'),
  })
}

const mockUnistylesTheme = new Proxy(Object.create(null), {
  get: mockThemeGroup,
})

function mockResolveUnistylesStyles(styles: unknown) {
  const built =
    typeof styles === 'function'
      ? (styles as (theme: unknown) => Record<string, unknown>)(
          mockUnistylesTheme,
        )
      : (styles as Record<string, unknown>)

  return Object.fromEntries(
    Object.entries(built).map(([key, value]) => [
      key,
      typeof value === 'function'
        ? (value as (theme: unknown) => unknown)(mockUnistylesTheme)
        : value,
    ]),
  )
}

jest.mock('react-native-unistyles', () => ({
  StyleSheet: {
    configure: () => undefined,
    create: (styles: unknown) => mockResolveUnistylesStyles(styles),
    absoluteFill: {},
    hairlineWidth: 1,
  },
  useUnistyles: () => ({
    theme: mockUnistylesTheme,
    themeName: 'default',
    breakpoint: 'xs',
    colorScheme: 'dark',
    initials: 'default',
  }),
}))
