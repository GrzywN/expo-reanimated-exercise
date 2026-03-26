import { useEffect } from 'react';
import {
  cancelAnimation,
  Easing,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { type TrackData } from './use-track-data';

export interface UseRouteAnimationProps
  extends Pick<
    TrackData,
    'projectedPoints' | 'normalizedTimes' | 'arcFractions'
  > {
  duration: number;
}

export interface Frame {
  segmentIndex: number;
  progressWithinSegment: number;
}

export function useRouteAnimation({
  projectedPoints,
  normalizedTimes,
  arcFractions,
  duration,
}: UseRouteAnimationProps) {
  const frames = useSharedValue<Frame[]>([]);

  useEffect(() => {
    frames.value = computeFrames(normalizedTimes, duration);
  }, [frames, normalizedTimes, duration]);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration, easing: Easing.linear });

    return () => cancelAnimation(progress);
  }, [progress, duration]);

  const pathEnd = useDerivedValue(() => {
    'worklet';
    if (frames.value.length === 0) {
      return 0;
    }

    const frameIndex = Math.min(
      Math.round(progress.value * (frames.value.length - 1)),
      frames.value.length - 1
    );
    const { segmentIndex, progressWithinSegment } = frames.value[frameIndex];

    const arcAtSegmentStart = arcFractions[segmentIndex];
    const arcAtSegmentEnd = arcFractions[segmentIndex + 1];
    return (
      arcAtSegmentStart +
      progressWithinSegment * (arcAtSegmentEnd - arcAtSegmentStart)
    );
  });

  const dotX = useDerivedValue(() => {
    'worklet';
    if (frames.value.length === 0) {
      return 0;
    }

    const frameIndex = Math.min(
      Math.round(progress.value * (frames.value.length - 1)),
      frames.value.length - 1
    );
    const { segmentIndex, progressWithinSegment } = frames.value[frameIndex];

    const xAtSegmentStart = projectedPoints[segmentIndex].x;
    const xAtSegmentEnd = projectedPoints[segmentIndex + 1].x;
    return (
      xAtSegmentStart +
      progressWithinSegment * (xAtSegmentEnd - xAtSegmentStart)
    );
  });

  const dotY = useDerivedValue(() => {
    'worklet';
    if (frames.value.length === 0) {
      return 0;
    }

    const frameIndex = Math.min(
      Math.round(progress.value * (frames.value.length - 1)),
      frames.value.length - 1
    );
    const { segmentIndex, progressWithinSegment } = frames.value[frameIndex];

    const yAtSegmentStart = projectedPoints[segmentIndex].y;
    const yAtSegmentEnd = projectedPoints[segmentIndex + 1].y;
    return (
      yAtSegmentStart +
      progressWithinSegment * (yAtSegmentEnd - yAtSegmentStart)
    );
  });

  return { pathEnd, dotX, dotY };
}

function computeFrames(
  normalizedTimes: number[],
  duration: number,
  fps = 120
): Frame[] {
  const totalFrames = Math.ceil((duration / 1000) * fps);

  return Array.from({ length: totalFrames }, (_, frameIndex) => {
    const progress = frameIndex / (totalFrames - 1);
    const segmentIndex = Math.min(
      Math.floor(progress * (normalizedTimes.length - 1)),
      normalizedTimes.length - 2
    );
    const segmentDuration =
      normalizedTimes[segmentIndex + 1] - normalizedTimes[segmentIndex];
    const progressWithinSegment =
      segmentDuration > 0
        ? (progress - normalizedTimes[segmentIndex]) / segmentDuration
        : 0;

    return { segmentIndex, progressWithinSegment };
  });
}
