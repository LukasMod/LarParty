import { useEffect, useState, type ReactNode } from 'react'
import { View, type StyleProp, type ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'

import { useReduceMotion } from '@/shared/hooks/use-reduce-motion'

interface CollapseProps {
  /** When true the content is expanded; when false it animates to zero height. */
  when: boolean
  /** Animation length in ms for both the open and the close. */
  duration?: number
  style?: StyleProp<ViewStyle>
  children: ReactNode
}

/**
 * Expands and collapses its children by animating height on the UI runtime,
 * the same shape as Reanimated's accordion example: the child is measured once
 * into a shared value, and the visible height is that measurement scaled by an
 * animated 0→1 `open` value.
 *
 * The whole point is that the host reflows as the height animates, so a card
 * holding several of these grows when a row opens and shrinks when it closes.
 * No `LayoutAnimation`, no JS timer deciding when to unmount.
 *
 * Children mount on the first open and then stay mounted (at zero height once
 * closed), so the closing animation always has its content to shrink and the
 * measurement survives a re-open. A row that was never opened costs one
 * animated view and nothing else.
 */
export function Collapse({
  when,
  duration = 260,
  style,
  children,
}: CollapseProps) {
  const reduceMotion = useReduceMotion()
  const measured = useSharedValue(0)
  const open = useSharedValue(when && !reduceMotion ? 0 : when ? 1 : 0)
  const [hasOpened, setHasOpened] = useState(when)

  // Adjusted during render, the sanctioned "remember previous prop" pattern:
  // a row that is opening for the first time must mount its content before the
  // open animation has anything to expand.
  if (when && !hasOpened) {
    setHasOpened(true)
  }

  useEffect(() => {
    if (reduceMotion) {
      open.value = when ? 1 : 0
      return
    }

    open.value = withTiming(when ? 1 : 0, { duration })
  }, [when, duration, reduceMotion, open])

  const heightStyle = useAnimatedStyle(() => ({
    height: measured.value * open.value,
    opacity: open.value,
  }))

  return (
    <Animated.View style={[styles.clip, heightStyle, style]}>
      {hasOpened ? (
        <View
          style={styles.content}
          // A collapsed row stays mounted while its height animates to zero, so
          // without this its controls stay in the screen-reader tree (iOS) and
          // hit-testable for TalkBack (Android) while visually gone.
          accessibilityElementsHidden={!when}
          importantForAccessibility={when ? 'auto' : 'no-hide-descendants'}
          onLayout={(event) => {
            measured.value = event.nativeEvent.layout.height
          }}
        >
          {children}
        </View>
      ) : null}
    </Animated.View>
  )
}

const styles = StyleSheet.create(() => ({
  clip: {
    overflow: 'hidden',
  },
  // Out of flow, like Reanimated's accordion example: an absolutely positioned
  // child keeps its natural height even while the clip's animated height is a
  // fraction of it (or zero), so `onLayout` always measures the real content.
  // Left in flow, the child collapses with the zero-height parent and reports
  // a height of 0 forever, which pins the row shut.
  content: {
    position: 'absolute',
    width: '100%',
  },
}))
