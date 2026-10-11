import type { PropsWithChildren } from 'react'
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { useIsFocused } from 'expo-router'

import { useReduceMotion } from '@/shared/hooks/use-reduce-motion'
import { useTiltPose } from '@/shared/hooks/use-tilt-pose'
import {
  DEFAULT_TILT_CONFIG,
  TILT_EFFECTS_ENABLED,
  tiltTransform,
  type TiltConfig,
} from '@/shared/utils/tilt'

interface TiltCardProps extends PropsWithChildren {
  config?: TiltConfig
  style?: StyleProp<ViewStyle>
}

// Wraps a card so it leans slightly with the phone's physical orientation, which
// reads as depth rather than movement. Pass a module-level `config` so the
// worklets keep a stable closure.
//
// Tilt is native-only, rests when the user asked for reduced motion, and stops
// while the screen is unfocused. Stopping means unmounting the sampler, because
// Reanimated exposes no way to pause a sensor: the only `unregister` it hands
// back is a stale no-op until the next render. That swap remounts the card, so
// it happens off-screen on blur, or on a reduce-motion change, where snapping
// flat is the point.
//
// Remove the effect entirely by setting TILT_EFFECTS_ENABLED to false; the card
// then renders as a plain view with no sensor and no frame loop.
export function TiltCard({
  children,
  config = DEFAULT_TILT_CONFIG,
  style,
}: TiltCardProps) {
  const focused = useIsFocused()
  const reduceMotion = useReduceMotion()

  const tilting =
    TILT_EFFECTS_ENABLED && focused && !reduceMotion && Platform.OS !== 'web'

  if (!tilting) {
    return <View style={style}>{children}</View>
  }

  return (
    <TiltedCard config={config} style={style}>
      {children}
    </TiltedCard>
  )
}

function TiltedCard({
  children,
  config,
  style,
}: PropsWithChildren<{ config: TiltConfig; style?: StyleProp<ViewStyle> }>) {
  const pose = useTiltPose(config)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: tiltTransform(pose.value, config),
  }))

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  )
}
