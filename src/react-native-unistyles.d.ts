/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { appThemes, breakpoints } from "@/shared/theme/unistyles"

type AppThemes = typeof appThemes
type AppBreakpoints = typeof breakpoints

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

