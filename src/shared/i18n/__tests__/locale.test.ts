import {
  isSupportedLanguageCode,
  resolveAppLanguage,
  resolveLanguageFromTag,
  supportedLanguageCodes,
} from '@/shared/i18n/locale'

describe('isSupportedLanguageCode', () => {
  it('accepts every supported code', () => {
    for (const code of supportedLanguageCodes) {
      expect(isSupportedLanguageCode(code)).toBe(true)
    }
  })

  it('rejects an unsupported code', () => {
    expect(isSupportedLanguageCode('de')).toBe(false)
  })

  it('rejects null and undefined', () => {
    expect(isSupportedLanguageCode(null)).toBe(false)
    expect(isSupportedLanguageCode(undefined)).toBe(false)
  })
})

describe('resolveLanguageFromTag', () => {
  it('maps a plain language code', () => {
    expect(resolveLanguageFromTag('pl')).toBe('pl')
  })

  // Device tags arrive region- and script-qualified, so only the leading
  // subtag may decide the language.
  it('reduces a qualified tag to its language subtag', () => {
    expect(resolveLanguageFromTag('pl-PL')).toBe('pl')
    expect(resolveLanguageFromTag('zh-Hans-CN')).toBe('en')
  })

  it('lowercases before matching', () => {
    expect(resolveLanguageFromTag('EN-US')).toBe('en')
    expect(resolveLanguageFromTag('PL')).toBe('pl')
  })

  it('falls back to English for an unsupported language', () => {
    expect(resolveLanguageFromTag('de-DE')).toBe('en')
  })

  it('falls back to English for a missing tag', () => {
    expect(resolveLanguageFromTag(null)).toBe('en')
    expect(resolveLanguageFromTag(undefined)).toBe('en')
    expect(resolveLanguageFromTag('')).toBe('en')
  })
})

describe('resolveAppLanguage', () => {
  it('honors an explicit language over the device', () => {
    expect(resolveAppLanguage('pl', 'en-US')).toBe('pl')
    expect(resolveAppLanguage('pl', null)).toBe('pl')
  })

  it('follows the device when the preference is system', () => {
    expect(resolveAppLanguage('system', 'pl-PL')).toBe('pl')
  })

  it('falls back to English on system with no usable device tag', () => {
    expect(resolveAppLanguage('system', undefined)).toBe('en')
    expect(resolveAppLanguage('system', 'es-MX')).toBe('en')
  })
})
