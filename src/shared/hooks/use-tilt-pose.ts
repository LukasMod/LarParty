import {
  IOSReferenceFrame,
  SensorType,
  type SharedValue,
  useAnimatedSensor,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated'

import {
  DEFAULT_TILT_CONFIG,
  REST_POSE,
  lerpPose,
  poseFromRotation,
  smoothingFactor,
  type TiltConfig,
  type TiltPose,
} from '@/shared/utils/tilt'

const SENSOR_CONFIG = {
  interval: 'auto' as const,
  // Magnetometer-corrected frames need iOS Location Services enabled and drift
  // toward magnetic north. Arbitrary-Z is gravity-referenced only, so pitch and
  // roll stay level-relative on every device. Yaw is ignored regardless.
  iosReferenceFrame: IOSReferenceFrame.XArbitraryZVertical,
  adjustToInterfaceOrientation: true,
}

// Settling time constant in ms. Higher reads as a heavier card lagging the hand.
const SETTLE_MS = 110

// Eases a pose toward the device's orientation on the UI thread. Registers the
// rotation sensor for as long as the caller is mounted and releases it on
// unmount, which is the only way to stop sampling: Reanimated has no pause, and
// the `unregister` it hands back is a stale no-op until the next render.
export function useTiltPose(
  config: TiltConfig = DEFAULT_TILT_CONFIG,
): SharedValue<TiltPose> {
  const { sensor } = useAnimatedSensor(SensorType.ROTATION, SENSOR_CONFIG)
  const pose = useSharedValue<TiltPose>(REST_POSE)

  useFrameCallback(({ timeSincePreviousFrame }) => {
    'worklet'

    const delta = timeSincePreviousFrame ?? 16
    const { pitch, roll } = sensor.value
    const target = poseFromRotation(pitch, roll, config)

    pose.value = lerpPose(pose.value, target, smoothingFactor(delta, SETTLE_MS))
  })

  return pose
}
