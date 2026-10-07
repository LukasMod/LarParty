import { useEffect } from 'react'
import { Modal, View, type ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, {
  Easing,
  SharedValue,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'
import { useTranslation } from 'react-i18next'

import { ThemedText } from '@/components/themed-text'
import { Button } from '@/shared/components/button'
import { useTheme } from '@/hooks/use-theme'
import { withAlpha } from '@/shared/theme/alpha'
import { ThemeColor } from '@/shared/theme/unistyles'

const STAGE_SIZE = 280

// Concentric discs of rising opacity fake a radial glow without a gradient
// dependency. Each entry is a size ratio plus alpha, outermost first.
const GLOW_LAYERS = [
  { scale: 1, alpha: 0.1 },
  { scale: 0.68, alpha: 0.18 },
  { scale: 0.42, alpha: 0.34 },
  { scale: 0.2, alpha: 0.95 },
] as const

function glowLayers(color: string, size: number): ViewStyle[] {
  return GLOW_LAYERS.map((layer) => {
    const diameter = size * layer.scale
    const offset = (size - diameter) / 2

    return {
      left: offset,
      top: offset,
      width: diameter,
      height: diameter,
      borderRadius: diameter / 2,
      backgroundColor: withAlpha(color, layer.alpha),
    }
  })
}

interface OrbitSpec {
  spinDuration: number
  reverse: boolean
  orbs: {
    size: number
    x: number
    y: number
    color: ThemeColor
    pulseDuration: number
    pulseDelay: number
  }[]
}

// Two counter-rotating rings of soft glows. Coordinates are orb centres inside a
// fixed 280x280 stage, so both rings stay concentric while spinning.
const ORBITS: OrbitSpec[] = [
  {
    spinDuration: 16000,
    reverse: false,
    orbs: [
      {
        size: 96,
        x: 232,
        y: 140,
        color: 'primary',
        pulseDuration: 2600,
        pulseDelay: 0,
      },
      {
        size: 68,
        x: 90,
        y: 222,
        color: 'accent',
        pulseDuration: 3200,
        pulseDelay: 500,
      },
      {
        size: 78,
        x: 90,
        y: 58,
        color: 'primary',
        pulseDuration: 2900,
        pulseDelay: 1000,
      },
    ],
  },
  {
    spinDuration: 24000,
    reverse: true,
    orbs: [
      {
        size: 112,
        x: 140,
        y: 74,
        color: 'accent',
        pulseDuration: 3800,
        pulseDelay: 250,
      },
      {
        size: 58,
        x: 140,
        y: 206,
        color: 'primary',
        pulseDuration: 2200,
        pulseDelay: 800,
      },
    ],
  },
]

interface GlowProps {
  size: number
  color: string
  progress: SharedValue<number>
  minOpacity?: number
  minScale?: number
  maxScale?: number
}

function Glow({
  size,
  color,
  progress,
  minOpacity = 0.4,
  minScale = 0.72,
  maxScale = 1.14,
}: GlowProps) {
  const layers = glowLayers(color, size)
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: minOpacity + progress.value * (1 - minOpacity),
    transform: [{ scale: minScale + progress.value * (maxScale - minScale) }],
  }))

  return (
    <Animated.View style={[styles.glow, animatedStyle]}>
      {layers.map((layer, index) => (
        <View key={index} style={[styles.layer, layer]} />
      ))}
    </Animated.View>
  )
}

interface OrbProps {
  size: number
  x: number
  y: number
  color: string
  pulseDuration: number
  pulseDelay: number
  running: boolean
}

function Orb({
  size,
  x,
  y,
  color,
  pulseDuration,
  pulseDelay,
  running,
}: OrbProps) {
  const pulse = useSharedValue(0)

  useEffect(() => {
    if (!running) {
      cancelAnimation(pulse)
      pulse.value = 0
      return
    }

    pulse.value = withDelay(
      pulseDelay,
      withRepeat(
        withSequence(
          withTiming(1, {
            duration: pulseDuration,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(0, {
            duration: pulseDuration,
            easing: Easing.inOut(Easing.quad),
          }),
        ),
        -1,
      ),
    )
  }, [running, pulse, pulseDelay, pulseDuration])

  return (
    <View
      style={[
        styles.orb,
        { left: x - size / 2, top: y - size / 2, width: size, height: size },
      ]}
    >
      <Glow size={size} color={color} progress={pulse} />
    </View>
  )
}

interface OrbitProps {
  orbit: OrbitSpec
  colors: Record<ThemeColor, string>
  running: boolean
}

function Orbit({ orbit, colors, running }: OrbitProps) {
  const rotation = useSharedValue(0)

  useEffect(() => {
    if (!running) {
      cancelAnimation(rotation)
      rotation.value = 0
      return
    }

    rotation.value = withRepeat(
      withTiming(orbit.reverse ? -360 : 360, {
        duration: orbit.spinDuration,
        easing: Easing.linear,
      }),
      -1,
      false,
    )
  }, [running, rotation, orbit.reverse, orbit.spinDuration])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  return (
    <Animated.View style={[styles.orbit, animatedStyle]}>
      {orbit.orbs.map((orb) => (
        <Orb
          key={`${orb.color}-${orb.size}`}
          size={orb.size}
          x={orb.x}
          y={orb.y}
          color={colors[orb.color]}
          pulseDuration={orb.pulseDuration}
          pulseDelay={orb.pulseDelay}
          running={running}
        />
      ))}
    </Animated.View>
  )
}

function Halo({
  breathe,
  color,
}: {
  breathe: SharedValue<number>
  color: string
}) {
  return (
    <View style={styles.halo}>
      <Glow
        size={230}
        color={color}
        progress={breathe}
        minOpacity={0.45}
        minScale={0.85}
        maxScale={1.05}
      />
    </View>
  )
}

function Seed({
  breathe,
  color,
}: {
  breathe: SharedValue<number>
  color: string
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.7 + breathe.value * 0.3,
    transform: [{ scale: 0.85 + breathe.value * 0.35 }],
  }))

  return (
    <Animated.View
      style={[styles.seed, { backgroundColor: color }, animatedStyle]}
    />
  )
}

interface GeneratingOverlayProps {
  visible: boolean
  onCancel: () => void
}

export function GeneratingOverlay({
  visible,
  onCancel,
}: GeneratingOverlayProps) {
  const { t } = useTranslation('common')
  const colors = useTheme()
  const breathe = useSharedValue(0)

  useEffect(() => {
    if (!visible) {
      cancelAnimation(breathe)
      breathe.value = 0
      return
    }

    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3400, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 3400, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    )
  }, [visible, breathe])

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop} accessibilityViewIsModal>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.stage} pointerEvents="none">
            <Halo breathe={breathe} color={colors.accent} />
            {ORBITS.map((orbit) => (
              <Orbit
                key={orbit.spinDuration}
                orbit={orbit}
                colors={colors}
                running={visible}
              />
            ))}
            <View style={styles.ring} />
            <Seed breathe={breathe} color={colors.primary} />
          </View>

          <View style={styles.copy}>
            <ThemedText type="subtitle" style={styles.headline}>
              {t('generating.title')}
            </ThemedText>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.body}
            >
              {t('generating.body')}
            </ThemedText>
          </View>

          <Button
            label={t('actions.cancel')}
            variant="secondary"
            style={styles.cancelButton}
            onPress={onCancel}
          />
        </SafeAreaView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create((theme) => ({
  backdrop: {
    flex: 1,
    backgroundColor: withAlpha(theme.colors.background, 0.94),
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.six,
    paddingHorizontal: theme.spacing.four,
    paddingVertical: theme.spacing.five,
  },
  stage: {
    width: STAGE_SIZE,
    height: STAGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 230,
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbit: {
    ...StyleSheet.absoluteFill,
  },
  orb: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layer: {
    position: 'absolute',
  },
  ring: {
    position: 'absolute',
    width: 172,
    height: 172,
    borderRadius: 86,
    borderWidth: 1,
    borderColor: withAlpha(theme.colors.primary, 0.3),
  },
  seed: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  copy: {
    alignItems: 'center',
    gap: theme.spacing.one,
  },
  headline: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
  },
  cancelButton: {
    alignSelf: 'stretch',
  },
}))
