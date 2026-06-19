import { AppTheme, appThemes } from '@/shared/theme/unistyles'
import { ThemeCategory } from '@/features/parties/types'

const partyThemeByCategory: Record<ThemeCategory, AppTheme> = {
  fantasy: appThemes.fantasy,
  'sci-fi': appThemes['sci-fi'],
  horror: appThemes.horror,
  magic: appThemes.magic,
  casual: appThemes.casual,
  corporation: appThemes.corporation,
}

export function getPartyTheme(themeCategory: ThemeCategory) {
  return partyThemeByCategory[themeCategory]
}
