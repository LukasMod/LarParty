import { useEffect, useState } from 'react'
import { AccessibilityInfo, type StyleProp, type ViewStyle } from 'react-native'
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

// Drives a 0→1→0 breathing loop on the UI thread. A seed shifts each glow
// along the cycle so list rows breathe out of sync. Cancelled when idle or
// when the user asked for reduced motion.
function useBreath(
  running: boolean,
  duration: number,
  delay: number,
  seed?: string,
) {
  const reduceMotion = useReduceMotion()
  const pulse = useSharedValue(0)
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

  return pulse
}

interface CardBorderGlowProps {
  color: string
  style?: StyleProp<ViewStyle>
  running?: boolean
  duration?: number
  peakAlpha?: number
}

// Soft halo that traces the host's rounded-rect border, so the card reads as
// emitting light from its edges rather than a wash from below. An outset
// box-shadow breathes in alpha and blur radius; the host's opaque background
// hides the inward bleed, leaving light spilling outward. The host must NOT
// clip (no overflow: hidden). boxShadow animates on both platforms.
export function CardBorderGlow({
  color,
  style,
  running = true,
  duration = 1600,
  peakAlpha = 1,
}: CardBorderGlowProps) {
  const pulse = useBreath(running, duration, 0)

  // Resolve the accent's rgb once on the JS thread. The worklet below may
  // only interpolate the alpha (and blur); it cannot call withAlpha, which is
  // a host function and would throw when run on the UI runtime.
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  const minAlpha = 0.38
  const alphaDelta = peakAlpha - minAlpha

  const animatedStyle = useAnimatedStyle(() => {
    const alpha = minAlpha + pulse.value * alphaDelta
    const blur = 24 + pulse.value * 26
    return { boxShadow: `0 0 ${blur}px rgba(${r}, ${g}, ${b}, ${alpha})` }
  })

  return (
    <Animated.View
      aria-hidden
      pointerEvents="none"
      style={[style, animatedStyle]}
    />
  )
}
