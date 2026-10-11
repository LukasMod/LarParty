import type { ViewStyle } from 'react-native'

export type TiltTransform = NonNullable<ViewStyle['transform']>

export const RADIANS_TO_DEGREES = 180 / Math.PI

// Master switch for the gyroscope tilt effect. False renders every card flat
// with no sensor, no animated wrapper, and no frame callback.
export const TILT_EFFECTS_ENABLED = true

export interface TiltConfig {
  maxDegrees: number
  maxShift: number
  deadZoneDegrees: number
  perspective: number
  signX: 1 | -1
  signY: 1 | -1
}

export interface TiltPose {
  rotateX: number
  rotateY: number
  translateX: number
  translateY: number
}

// Sign flips are here because the pitch/roll -> screen mapping differs between
// iOS and Android. Flip one constant on a real device if the card leans away
// from the phone instead of toward it.
export const DEFAULT_TILT_CONFIG = {
  maxDegrees: 5,
  maxShift: 3.5,
  deadZoneDegrees: 1,
  perspective: 900,
  signX: -1,
  signY: 1,
} satisfies TiltConfig

export const REST_POSE: TiltPose = {
  rotateX: 0,
  rotateY: 0,
  translateX: 0,
  translateY: 0,
}

// Pulls the dead zone out of the angle so small hand tremor reads as exactly
// zero, then clamps the remainder to the configured travel.
export function tiltAxis(
  angleDegrees: number,
  maxDegrees: number,
  deadZoneDegrees: number,
) {
  'worklet'

  const limited = Math.max(-maxDegrees, Math.min(maxDegrees, angleDegrees))

  if (Math.abs(limited) <= deadZoneDegrees) {
    return 0
  }

  return limited - Math.sign(limited) * deadZoneDegrees
}

export function poseFromRotation(
  pitchRadians: number,
  rollRadians: number,
  config: TiltConfig,
): TiltPose {
  'worklet'
  const pitch = tiltAxis(
    pitchRadians * RADIANS_TO_DEGREES,
    config.maxDegrees,
    config.deadZoneDegrees,
  )
  const roll = tiltAxis(
    rollRadians * RADIANS_TO_DEGREES,
    config.maxDegrees,
    config.deadZoneDegrees,
  )
  const shiftRatio = config.maxShift / config.maxDegrees

  return {
    rotateX: pitch * config.signX,
    rotateY: roll * config.signY,
    translateX: roll * shiftRatio,
    translateY: pitch * shiftRatio,
  }
}

export function lerpPose(
  from: TiltPose,
  to: TiltPose,
  factor: number,
): TiltPose {
  'worklet'

  return {
    rotateX: from.rotateX + (to.rotateX - from.rotateX) * factor,
    rotateY: from.rotateY + (to.rotateY - from.rotateY) * factor,
    translateX: from.translateX + (to.translateX - from.translateX) * factor,
    translateY: from.translateY + (to.translateY - from.translateY) * factor,
  }
}

// Frame-rate independent easing factor. `tau` is the settling time constant in
// milliseconds, so the card eases the same on a 60Hz and a 120Hz display.
export function smoothingFactor(deltaMs: number, tau: number) {
  'worklet'

  return 1 - Math.exp(-deltaMs / tau)
}

export function tiltTransform(
  pose: TiltPose,
  config: TiltConfig,
): TiltTransform {
  'worklet'

  return [
    { perspective: config.perspective },
    { rotateX: `${pose.rotateX}deg` },
    { rotateY: `${pose.rotateY}deg` },
    { translateX: pose.translateX },
    { translateY: pose.translateY },
  ]
}
