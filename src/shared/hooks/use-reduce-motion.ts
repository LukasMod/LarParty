import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

// Live reduce-motion setting. Reanimated's useReducedMotion only reads the
// value at app startup, so it misses changes made while the app runs.
export function useReduceMotion() {
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
