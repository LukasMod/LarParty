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

  it('rejects an empty string', () => {
    expect(isSupportedLanguageCode('')).toBe(false)
  })

  it('rejects null and undefined', () => {
    expect(isSupportedLanguageCode(null)).toBe(false)
    expect(isSupportedLanguageCode(undefined)).toBe(false)
  })

  it('is case sensitive', () => {
    expect(isSupportedLanguageCode('EN')).toBe(false)
  })
})

describe('resolveLanguageFromTag', () => {
  it('maps a plain language code', () => {
    expect(resolveLanguageFromTag('pl')).toBe('pl')
  })

  it('maps a region-qualified tag', () => {
    expect(resolveLanguageFromTag('pl-PL')).toBe('pl')
  })

  it('maps a script-qualified tag', () => {
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

  it('never returns a region subtag', () => {
    expect(resolveLanguageFromTag('en-GB')).toBe('en')
  })
})

describe('resolveAppLanguage', () => {
  it('honors an explicit language over the device', () => {
    expect(resolveAppLanguage('pl', 'en-US')).toBe('pl')
    expect(resolveAppLanguage('en', 'pl-PL')).toBe('en')
  })

  it('follows the device when the preference is system', () => {
    expect(resolveAppLanguage('system', 'pl-PL')).toBe('pl')
  })

  it('falls back to English on system with no device tag', () => {
    expect(resolveAppLanguage('system', undefined)).toBe('en')
    expect(resolveAppLanguage('system', null)).toBe('en')
  })

  it('falls back to English on an unsupported device language', () => {
    expect(resolveAppLanguage('system', 'es-MX')).toBe('en')
  })

  it('ignores the device tag entirely for an explicit choice', () => {
    expect(resolveAppLanguage('pl', null)).toBe('pl')
  })
})
