import 'intl-pluralrules'

import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'

import {
  resolveDeviceLanguage,
  supportedLanguageCodes,
} from '@/shared/i18n/locale'
import { defaultNS, resources } from '@/shared/i18n/resources'

export const i18n = createInstance()

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: resolveDeviceLanguage(),
  fallbackLng: 'en',
  supportedLngs: [...supportedLanguageCodes],
  defaultNS,
  resources,
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
})
