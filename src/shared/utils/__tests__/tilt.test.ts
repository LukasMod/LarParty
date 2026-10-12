import {
  DEFAULT_TILT_CONFIG,
  RADIANS_TO_DEGREES,
  REST_POSE,
  lerpPose,
  poseFromRotation,
  smoothingFactor,
  tiltAxis,
  tiltTransform,
  type TiltConfig,
  type TiltPose,
} from '@/shared/utils/tilt'

const config: TiltConfig = {
  maxDegrees: 10,
  maxShift: 5,
  deadZoneDegrees: 2,
  perspective: 900,
  signX: -1,
  signY: 1,
}

describe('tiltAxis', () => {
  it('clamps to the positive limit', () => {
    expect(tiltAxis(45, 10, 0)).toBe(10)
  })

  it('clamps to the negative limit', () => {
    expect(tiltAxis(-45, 10, 0)).toBe(-10)
  })

  it('returns zero inside the dead zone', () => {
    expect(tiltAxis(1.5, 10, 2)).toBe(0)
    expect(tiltAxis(-1.5, 10, 2)).toBe(0)
  })

  it('treats the dead-zone edge as zero', () => {
    expect(tiltAxis(2, 10, 2)).toBe(0)
    expect(tiltAxis(-2, 10, 2)).toBe(0)
  })

  it('subtracts the dead zone just past the threshold', () => {
    expect(tiltAxis(5, 10, 2)).toBeCloseTo(3)
    expect(tiltAxis(-5, 10, 2)).toBeCloseTo(-3)
  })

  it('keeps the clamp ahead of the dead zone at the extreme', () => {
    expect(tiltAxis(100, 10, 2)).toBe(8)
    expect(tiltAxis(-100, 10, 2)).toBe(-8)
  })

  // A dead zone wider than the travel would produce a negative range.
  it('never leaves the dead zone larger than the travel', () => {
    expect(tiltAxis(100, 5, 8)).toBe(0)
  })
})

describe('poseFromRotation', () => {
  const toRadians = (degrees: number) => degrees / RADIANS_TO_DEGREES

  it('returns a flat pose for a flat device', () => {
    const pose = poseFromRotation(0, 0, config)

    expect(pose.rotateX).toBeCloseTo(0)
    expect(pose.rotateY).toBeCloseTo(0)
    expect(pose.translateX).toBeCloseTo(0)
    expect(pose.translateY).toBeCloseTo(0)
  })

  it('applies the sign flip to rotateX', () => {
    const pose = poseFromRotation(toRadians(6), 0, config)

    expect(pose.rotateX).toBeCloseTo(-4)
  })

  it('applies the sign flip to rotateY', () => {
    const pose = poseFromRotation(0, toRadians(6), config)

    expect(pose.rotateY).toBeCloseTo(4)
  })

  it('scales translation by maxShift over maxDegrees', () => {
    const pose = poseFromRotation(toRadians(6), toRadians(6), config)

    expect(pose.translateX).toBeCloseTo(2)
    expect(pose.translateY).toBeCloseTo(2)
  })

  it('never exceeds the configured rotation', () => {
    const pose = poseFromRotation(toRadians(90), toRadians(-90), config)

    expect(pose.rotateX).toBeCloseTo(
      -(config.maxDegrees - config.deadZoneDegrees),
    )
    expect(pose.rotateY).toBeCloseTo(
      -(config.maxDegrees - config.deadZoneDegrees),
    )
  })

  it('respects an inverted sign config', () => {
    const pose = poseFromRotation(toRadians(6), 0, {
      ...config,
      signX: 1,
    })

    expect(pose.rotateX).toBeCloseTo(4)
  })
})

describe('lerpPose', () => {
  const from: TiltPose = {
    rotateX: 0,
    rotateY: 10,
    translateX: -4,
    translateY: 2,
  }
  const to: TiltPose = {
    rotateX: 10,
    rotateY: 0,
    translateX: 4,
    translateY: -2,
  }

  it('returns the start pose at factor zero', () => {
    expect(lerpPose(from, to, 0)).toEqual(from)
  })

  it('returns the target pose at factor one', () => {
    expect(lerpPose(from, to, 1)).toEqual(to)
  })

  it('interpolates every axis halfway', () => {
    expect(lerpPose(from, to, 0.5)).toEqual({
      rotateX: 5,
      rotateY: 5,
      translateX: 0,
      translateY: 0,
    })
  })

  it('overshoots past the target beyond factor one', () => {
    expect(lerpPose(from, to, 2).rotateX).toBeCloseTo(20)
  })

  it('does not mutate either input pose', () => {
    lerpPose(from, to, 0.5)

    expect(from).toEqual({
      rotateX: 0,
      rotateY: 10,
      translateX: -4,
      translateY: 2,
    })
    expect(to).toEqual({
      rotateX: 10,
      rotateY: 0,
      translateX: 4,
      translateY: -2,
    })
  })
})

describe('smoothingFactor', () => {
  it('is zero for a zero-length frame', () => {
    expect(smoothingFactor(0, 110)).toBe(0)
  })

  it('approaches one for a very long frame', () => {
    expect(smoothingFactor(10_000, 110)).toBeCloseTo(1)
  })

  it('matches the 1-exp(-1) value for a frame equal to tau', () => {
    expect(smoothingFactor(110, 110)).toBeCloseTo(1 - Math.exp(-1))
  })

  it('is frame-rate independent across a 60Hz and 120Hz pair', () => {
    const sixty = smoothingFactor(1000 / 60, 110)
    const hundredTwenty = smoothingFactor(1000 / 120, 110)

    const afterOneFrameAt60 = 1 - (1 - sixty) * 1
    const afterTwoFramesAt120 = 1 - (1 - hundredTwenty) ** 2

    expect(afterTwoFramesAt120).toBeCloseTo(afterOneFrameAt60, 4)
  })

  it('stays between zero and one for positive input', () => {
    for (const delta of [1, 8, 16, 33, 100]) {
      const factor = smoothingFactor(delta, 110)

      expect(factor).toBeGreaterThan(0)
      expect(factor).toBeLessThan(1)
    }
  })
})

describe('tiltTransform', () => {
  it('emits perspective first, then rotations, then translations', () => {
    const transform = tiltTransform(
      { rotateX: 1, rotateY: 2, translateX: 3, translateY: 4 },
      DEFAULT_TILT_CONFIG,
    )

    expect(transform).toEqual([
      { perspective: 900 },
      { rotateX: '1deg' },
      { rotateY: '2deg' },
      { translateX: 3 },
      { translateY: 4 },
    ])
  })

  it('formats negative rotations as degrees', () => {
    const transform = tiltTransform(
      { rotateX: -5, rotateY: -3.5, translateX: 0, translateY: 0 },
      DEFAULT_TILT_CONFIG,
    )

    expect(transform[1]).toEqual({ rotateX: '-5deg' })
    expect(transform[2]).toEqual({ rotateY: '-3.5deg' })
  })

  it('emits an identity transform for the rest pose', () => {
    expect(tiltTransform(REST_POSE, DEFAULT_TILT_CONFIG)).toEqual([
      { perspective: DEFAULT_TILT_CONFIG.perspective },
      { rotateX: '0deg' },
      { rotateY: '0deg' },
      { translateX: 0 },
      { translateY: 0 },
    ])
  })
})
