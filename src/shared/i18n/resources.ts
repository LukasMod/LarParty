import { en } from '@/shared/i18n/locales/en'
import { pl } from '@/shared/i18n/locales/pl'

export const resources = {
  en,
  pl,
} as const

export const defaultNS = 'common'

export type AppResources = typeof resources
