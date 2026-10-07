import { useEffect, useState } from 'react'
import {
  AccessibilityInfo,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import { withAlpha } from '@/shared/theme/alpha'

function hashCode(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function useReduceMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    let active = true
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active) {
        setReduced(value)
      }
    })
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduced,
    )
    return () => {
      active = false
      subscription.remove()
    }
  }, [])

  return reduced
}

interface CardGlowProps {
  color: string
  style?: StyleProp<ViewStyle>
  running?: boolean
  delay?: number
  duration?: number
  peakAlpha?: number
  seed?: string
}

// Soft radial halo anchored to the host card's bottom edge. The disc hangs
// below the card and breathes upward with opacity, scale and lift, so light
// reads as rising "from below". The host must clip (overflow: hidden).
// Only opacity/transform animate, so the loop stays on the UI thread.
export function CardGlow({
  color,
  style,
  running = true,
  delay = 0,
  duration = 2600,
  peakAlpha = 0.4,
  seed,
}: CardGlowProps) {
  const reduceMotion = useReduceMotion()
  const pulse = useSharedValue(0)

  // A seed shifts each glow along the cycle so list rows breathe out of sync.
  const offset = seed ? (hashCode(seed) % 1000) / 1000 : 0

  useEffect(() => {
    if (!running || reduceMotion) {
      cancelAnimation(pulse)
      pulse.value = reduceMotion ? 1 : 0
      return
    }

    pulse.value = withDelay(
      delay + offset * duration * 2,
      withRepeat(
        withSequence(
          withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      ),
    )
  }, [running, reduceMotion, pulse, delay, duration, offset])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.45 + pulse.value * 0.55,
    transform: [
      { translateY: pulse.value * -8 },
      { scaleX: 0.94 + pulse.value * 0.1 },
      { scaleY: 0.9 + pulse.value * 0.16 },
    ],
  }))

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.disc,
        animatedStyle,
        {
          backgroundImage: `radial-gradient(ellipse 100% 100% at 50% 100%, ${withAlpha(
            color,
            peakAlpha,
          )}, ${withAlpha(color, 0)} 70%)`,
        },
        style,
      ]}
    />
  )
}

const styles = {
  disc: {
    position: 'absolute',
    left: '-10%',
    right: '-10%',
    bottom: '-30%',
    height: '90%',
    transformOrigin: '50% 100%',
  },
} satisfies Record<string, ViewStyle>
