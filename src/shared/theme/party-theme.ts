import { AppTheme, appThemes } from '@/shared/theme/unistyles'
import { ThemeCategory } from '@/features/parties/types'

const partyThemeByCategory: Record<ThemeCategory, AppTheme> = {
  fantasy: appThemes.fantasy,
  'sci-fi': appThemes['sci-fi'],
  horror: appThemes.horror,
}

export function getPartyTheme(themeCategory: ThemeCategory) {
  return partyThemeByCategory[themeCategory]
}
