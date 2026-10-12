import { useEffect, useState } from 'react'
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { scheduleOnRN } from 'react-native-worklets'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  ReduceMotion,
  clamp,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedText } from '@/components/themed-text'
import { useTheme } from '@/hooks/use-theme'
import { levelLabel } from '@/shared/utils/level'

const HIT_HEIGHT = 64
const TRACK_HEIGHT = 20
const TOUCH_SIZE = 48
const KNOB_SIZE = 44
// Notches for the steps between the two ends. The extremes are marked by the track
// ending and the knob overhanging it, so they need no notch of their own.
const DOT_SIZE = 5
const READOUT_HEIGHT = 46
const KNOB_SCALE = 1.06
// The track is drawn this far in from each edge and the knob centre reaches exactly
// to those ends, so at ±3 the knob overhangs the track rather than sitting inside it.
const TRACK_INSET = 30
const KNOB_INSET = TRACK_INSET
// dampingRatio 0.7 overshoots once, so a release reads as the knob clicking into a
// detent rather than gliding to a stop.
const SNAP = { duration: 380, dampingRatio: 0.7 }

function toLevels(min: number, max: number, step: number) {
  const levels: number[] = []

  for (let level = min; level <= max; level += step) {
    levels.push(level)
  }

  return levels
}

// Nearest index for a level the caller supplied, tolerating off-grid values.
function nearestIndex(level: number, levels: readonly number[]) {
  let closest = 0
  let best = Infinity

  for (let index = 0; index < levels.length; index += 1) {
    const distance = Math.abs(levels[index] - level)

    if (distance < best) {
      closest = index
      best = distance
    }
  }

  return closest
}

// Nearest level for a knob offset.
function indexAt(x: number, spacing: number, lastIndex: number) {
  'worklet'

  if (spacing <= 0) {
    return 0
  }

  return Math.round(clamp((x - KNOB_INSET) / spacing, 0, lastIndex))
}

interface LevelSliderProps {
  /** Controlled level. Omit to let the slider hold its own level. */
  value?: number
  /** Called with the level the knob settled on, once per gesture. */
  onChange?: (value: number) => void
  minValue?: number
  maxValue?: number
  step?: number
  haptics?: boolean
  accessibilityLabel?: string
  /** Hide the large level readout above the track. On when the host shows the
      level itself, so the two readings do not duplicate each other. */
  showReadout?: boolean
  style?: StyleProp<ViewStyle>
}

/**
 * Slider over a fixed set of integer levels (-3…+3 by default) that starts on the
 * middle one, 0. The knob cannot rest between levels: every release springs it to
 * the nearest one and hands that spring the finger's velocity, so a short push that
 * stops before the next tick still lands on it.
 *
 * The drag lives on the UI runtime — pan gesture, shared values, `useAnimatedStyle`
 * — so React does not render while a finger is down. The readout is a column of level
 * labels translated by the same shared value, which is why it tracks the finger without
 * a render either; it swaps rows on the same midpoints the tick haptic fires on. The one
 * render per gesture happens on release, when the level is reported.
 *
 * Pass `value` to control it; leave it out and the slider keeps its own level and
 * only reports through `onChange`.
 */
export function LevelSlider({
  value,
  onChange,
  minValue = -3,
  maxValue = 3,
  step = 1,
  haptics = Platform.OS !== 'web',
  accessibilityLabel,
  showReadout = true,
  style,
}: LevelSliderProps) {
  const [width, setWidth] = useState(0)
  const theme = useTheme()
  // Left end carries the accent, the middle matches the unlit track so a small
  // selection stays neutral, the right end carries the primary.
  const accent = theme.accent
  const neutral = theme.border
  const primary = theme.primary

  const levels = toLevels(minValue, maxValue, step)
  const lastIndex = levels.length - 1
  const middleIndex = Math.floor(lastIndex / 2)
  const [restLevel, setRestLevel] = useState(levels[middleIndex])
  const level = value ?? restLevel
  const spacing = lastIndex > 0 ? (width - 2 * TRACK_INSET) / lastIndex : 0
  const middleX = KNOB_INSET + middleIndex * spacing

  const knobX = useSharedValue(KNOB_INSET)
  const dragFrom = useSharedValue(0)
  const dragIndex = useSharedValue(0)
  const dragging = useSharedValue(0)
  const knobScale = useSharedValue(1)
  // Level and spacing the knob is parked on, so the parking effect can tell "the
  // parent moved the value" from "we just committed this level ourselves". Shared
  // values rather than a ref: `commit` is reachable from a worklet.
  const parkedLevel = useSharedValue(Number.NaN)
  const parkedSpacing = useSharedValue(-1)

  useEffect(() => {
    if (spacing <= 0 || dragging.get()) {
      return
    }

    const wasParked = !Number.isNaN(parkedLevel.get())
    const atRest =
      parkedLevel.get() === level && parkedSpacing.get() === spacing

    parkedLevel.set(level)
    parkedSpacing.set(spacing)

    if (atRest) {
      return
    }

    const target = KNOB_INSET + nearestIndex(level, levels) * spacing

    // The first park, right after measurement, lands flat. Anything after it — an
    // external `value` change, or a rotation that changes the spacing — travels with
    // the same snap the gesture uses.
    knobX.set(
      wasParked
        ? withSpring(target, { ...SNAP, reduceMotion: ReduceMotion.System })
        : target,
    )
  }, [level, spacing, levels, knobX, dragging, parkedLevel, parkedSpacing])

  const beginDrag = () => {
    dragging.set(1)
    knobScale.set(
      withTiming(KNOB_SCALE, {
        duration: 120,
        reduceMotion: ReduceMotion.System,
      }),
    )
  }

  const endDrag = () => {
    dragging.set(0)
    knobScale.set(
      withTiming(1, { duration: 120, reduceMotion: ReduceMotion.System }),
    )
  }

  const settle = (index: number, velocity: number) => {
    knobX.set(
      withSpring(KNOB_INSET + index * spacing, {
        ...SNAP,
        velocity,
        reduceMotion: ReduceMotion.System,
      }),
    )
  }

  const commit = (index: number) => {
    const settled = levels[index]

    parkedLevel.set(settled)
    parkedSpacing.set(spacing)

    if (settled === level) {
      return
    }

    if (value === undefined) {
      setRestLevel(settled)
    }

    onChange?.(settled)
  }

  const tick = () => {
    Haptics.selectionAsync().catch(() => undefined)
  }

  const tap = Gesture.Tap()
    // A tap on the track moves the knob there rather than being ignored, so a
    // known level takes one touch instead of a drag. The spring starts from where
    // the knob is, not from the tap, so it reads as the knob travelling to the tick.
    .onEnd((event) => {
      'worklet'

      const target = clamp(
        event.x,
        KNOB_INSET,
        KNOB_INSET + lastIndex * spacing,
      )
      const index = indexAt(target, spacing, lastIndex)

      if (index !== indexAt(knobX.get(), spacing, lastIndex) && haptics) {
        scheduleOnRN(tick)
      }

      scheduleOnRN(settle, index, 0)
      scheduleOnRN(commit, index)
    })

  // Pan wins as soon as the finger travels; a touch that never travels is a tap.
  const gesture = Gesture.Exclusive(
    Gesture.Pan()
      .averageTouches(true)
      // Take over after a hair of horizontal travel so the knob feels glued to the
      // finger, and bow out to the parent ScrollView on a vertical drag.
      .activeOffsetX([-4, 4])
      .failOffsetY([-12, 12])
      .onBegin(() => {
        'worklet'

        dragIndex.set(indexAt(knobX.get(), spacing, lastIndex))
      })
      .onStart(() => {
        'worklet'

        dragFrom.set(knobX.get())
        scheduleOnRN(beginDrag)
      })
      .onUpdate((event) => {
        'worklet'

        const target = clamp(
          dragFrom.get() + event.translationX,
          KNOB_INSET,
          KNOB_INSET + lastIndex * spacing,
        )
        const next = indexAt(target, spacing, lastIndex)

        knobX.set(target)

        if (next !== dragIndex.get()) {
          dragIndex.set(next)

          if (haptics) {
            scheduleOnRN(tick)
          }
        }
      })
      // `onFinalize` rather than `onEnd`, so a drag the system takes over — a scroll
      // that wins the gesture — still snaps the knob to the nearest level instead of
      // leaving it stranded mid-track.
      .onFinalize((event) => {
        'worklet'

        const index = indexAt(knobX.get(), spacing, lastIndex)

        scheduleOnRN(settle, index, event.velocityX)
        scheduleOnRN(commit, index)
        scheduleOnRN(endDrag)
      }),
    tap,
  )

  const knobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: knobX.get() - TOUCH_SIZE / 2 },
      { scale: knobScale.get() },
    ],
  }))

  // The selected range is the part of the static track gradient left uncovered. Two
  // childless, absolutely positioned masks keep the neutral ends neutral and are the
  // only things whose width animates, so the gradient itself never re-lays-out.
  const coverLeftStyle = useAnimatedStyle(() => ({
    width: Math.max(0, Math.min(knobX.get(), middleX) - TRACK_INSET),
  }))

  const coverRightStyle = useAnimatedStyle(() => ({
    width: Math.max(0, width - TRACK_INSET - Math.max(knobX.get(), middleX)),
    transform: [{ translateX: Math.max(knobX.get(), middleX) - TRACK_INSET }],
  }))

  // The knob is tinted with the same gradient it travels over, sampled at its own
  // centre: accent at the left end, neutral in the middle, primary at the right. The
  // track spans TRACK_INSET…width - TRACK_INSET, so knobX maps onto it directly.
  const knobColorStyle = useAnimatedStyle(() => {
    const left = TRACK_INSET
    const right = width - TRACK_INSET

    if (right <= left) {
      return { backgroundColor: neutral }
    }

    return {
      backgroundColor: interpolateColor(
        knobX.get(),
        [left, (left + right) / 2, right],
        [accent, neutral, primary],
        'RGB',
      ),
    }
  })

  // Same shared value drives a vertical column of level labels, so the readout rolls
  // on the UI runtime too. It snaps to whole rows so one label stays legible instead
  // of two half-cut ones, and it swaps on the same midpoint the tick haptic fires on.
  const readoutStyle = useAnimatedStyle(() => {
    const row =
      spacing > 0
        ? Math.round(clamp((knobX.get() - KNOB_INSET) / spacing, 0, lastIndex))
        : middleIndex

    return { transform: [{ translateY: -row * READOUT_HEIGHT }] }
  })

  const stepBy = (delta: number) => {
    const next = clamp(
      levels[nearestIndex(level, levels)] + delta,
      minValue,
      maxValue,
    )

    parkedLevel.set(next)
    parkedSpacing.set(spacing)

    if (value === undefined) {
      setRestLevel(next)
    }

    onChange?.(next)
  }

  const handleLayout = (measured: number) => {
    const measuredSpacing =
      lastIndex > 0 ? (measured - TOUCH_SIZE) / lastIndex : 0

    setWidth(measured)

    // Park before the first paint, so neither the knob nor the readout flashes at
    // the low end of the scale while measurement settles.
    if (Number.isNaN(parkedLevel.get()) && measuredSpacing > 0) {
      knobX.set(KNOB_INSET + nearestIndex(level, levels) * measuredSpacing)
    }
  }

  return (
    <View
      style={[styles.root, style]}
      onLayout={(event) => handleLayout(event.nativeEvent.layout.width)}
    >
      {showReadout ? (
        <View style={styles.readout} accessibilityElementsHidden>
          <Animated.View style={readoutStyle}>
            {levels.map((item) => (
              <ThemedText
                key={item}
                type="displaySmall"
                maxFontSizeMultiplier={1.2}
                style={styles.readoutRow}
              >
                {levelLabel(item)}
              </ThemedText>
            ))}
          </Animated.View>
        </View>
      ) : null}

      <GestureDetector gesture={gesture}>
        <View
          style={styles.hitArea}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={accessibilityLabel}
          accessibilityValue={{ min: minValue, max: maxValue, now: level }}
          accessibilityActions={[
            { name: 'increment', label: '+' },
            { name: 'decrement', label: '-' },
          ]}
          onAccessibilityAction={(event) =>
            stepBy(event.nativeEvent.actionName === 'increment' ? step : -step)
          }
        >
          <View style={styles.track} pointerEvents="none">
            <LinearGradient
              colors={[accent, neutral, primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Animated.View style={[styles.cover, coverLeftStyle]} />
            <Animated.View style={[styles.cover, coverRightStyle]} />
          </View>

          {width > 0
            ? levels.map((item, index) => {
                // The extremes are marked by where the track ends and by the knob
                // overhanging it, so only the steps in between get a notch.
                if (index === 0 || index === lastIndex) {
                  return null
                }

                return (
                  <View
                    key={item}
                    pointerEvents="none"
                    style={[
                      styles.dot,
                      {
                        top: HIT_HEIGHT / 2 - DOT_SIZE / 2,
                        left: KNOB_INSET + index * spacing - DOT_SIZE / 2,
                      },
                    ]}
                  />
                )
              })
            : null}

          {width > 0 ? (
            <Animated.View style={[styles.knob, knobStyle]}>
              <Animated.View style={[styles.knobInner, knobColorStyle]} />
            </Animated.View>
          ) : null}
        </View>
      </GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.spacing.two,
  },
  readout: {
    height: READOUT_HEIGHT,
    overflow: 'hidden',
    alignItems: 'center',
  },
  readoutRow: {
    width: 160,
    height: READOUT_HEIGHT,
    lineHeight: READOUT_HEIGHT,
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
  },
  hitArea: {
    height: HIT_HEIGHT,
    justifyContent: 'center',
  },
  // Inset so the knob overhangs both ends at the extremes instead of sitting inside
  // the track, which is what makes it read as oversized at ±3.
  track: {
    position: 'absolute',
    left: TRACK_INSET,
    right: TRACK_INSET,
    top: (HIT_HEIGHT - TRACK_HEIGHT) / 2,
    height: TRACK_HEIGHT,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
  },
  // Hides the gradient where the knob has not reached. Only its width animates.
  cover: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: TRACK_HEIGHT,
    backgroundColor: theme.colors.border,
  },
  // Notches punched through the track, including through the filled range, so the
  // steps in between read at a glance the way a native discrete slider's does.
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: theme.colors.background,
  },
  knob: {
    position: 'absolute',
    top: (HIT_HEIGHT - TOUCH_SIZE) / 2,
    left: 0,
    width: TOUCH_SIZE,
    height: TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Its `backgroundColor` comes from the worklet sampling the same gradient the track
  // shows, so the knob carries the colour of the position it sits on.
  knobInner: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    borderWidth: 4,
    borderColor: theme.colors.background,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
  },
}))
