import { Skia } from '@shopify/react-native-skia';
import { useMemo } from 'react';

import { type GpsPoint } from '../types';
import { type MapLayout } from '../utils/web-mercator';

export interface TrackData {
  projectedPoints: { x: number; y: number }[];
  normalizedTimes: number[];
  arcFractions: number[];
  routePath: ReturnType<typeof Skia.Path.Make>;
  segmentPaths: ReturnType<typeof Skia.Path.Make>[];
  pointColors: string[];
}

export function useTrackData(track: GpsPoint[], layout: MapLayout): TrackData {
  return useMemo(() => {
    const firstPoint = track.at(0);
    const lastPoint = track.at(-1);

    if (!firstPoint || !lastPoint) {
      throw new Error('[useTrackData] track must have at least one point');
    }

    const projectedPoints = track.map(({ lat, lng }) =>
      layout.project(lat, lng)
    );

    const startTimestamp = firstPoint.timestamp;
    const lastTimestamp = lastPoint.timestamp;
    const totalDuration = lastTimestamp - startTimestamp;

    const normalizedTimes = track.map((point) => {
      const elapsedTime = point.timestamp - startTimestamp;
      return totalDuration > 0 ? elapsedTime / totalDuration : 0;
    });

    const cumulativeArcLengths = [0];

    for (let i = 1; i < projectedPoints.length; i++) {
      const current = projectedPoints.at(i);
      const previous = projectedPoints.at(i - 1);
      const previousArcLength = cumulativeArcLengths.at(i - 1);

      if (!current || !previous || previousArcLength === undefined) {
        throw new Error(`[useTrackData] missing projected point at index ${i}`);
      }

      const dx = current.x - previous.x;
      const dy = current.y - previous.y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);

      cumulativeArcLengths.push(previousArcLength + segmentLength);
    }

    const totalArcLength = cumulativeArcLengths.at(-1);

    if (!totalArcLength) {
      throw new Error('[useTrackData] cumulativeArcLengths is empty');
    }

    const arcFractions =
      totalArcLength > 0
        ? cumulativeArcLengths.map((arcLength) => arcLength / totalArcLength)
        : cumulativeArcLengths;

    const routePath = Skia.Path.Make();
    const minimumPointsToDrawLine = 2;
    const hasEnoughPointsToDraw =
      projectedPoints.length >= minimumPointsToDrawLine;
    const firstProjectedPoint = projectedPoints.at(0);

    if (hasEnoughPointsToDraw && firstProjectedPoint) {
      routePath.moveTo(firstProjectedPoint.x, firstProjectedPoint.y);

      for (let i = 1; i < projectedPoints.length; i++) {
        const point = projectedPoints.at(i);

        if (!point) {
          throw new Error(
            `[useTrackData] missing projected point at index ${i}`
          );
        }

        routePath.lineTo(point.x, point.y);
      }
    }

    const { segmentPaths, pointColors } = computeGradientSegments(
      projectedPoints,
      normalizedTimes,
      arcFractions
    );

    return {
      projectedPoints,
      normalizedTimes,
      arcFractions,
      routePath,
      segmentPaths,
      pointColors,
    };
  }, [track, layout]);
}

function computeGradientSegments(
  projectedPoints: { x: number; y: number }[],
  normalizedTimes: number[],
  arcFractions: number[]
): {
  segmentPaths: ReturnType<typeof Skia.Path.Make>[];
  pointColors: string[];
} {
  const rawSegmentPaces = normalizedTimes.slice(1).map((time, i) => {
    const arcFractionDelta = arcFractions[i + 1] - arcFractions[i];
    const timeDelta = time - normalizedTimes[i];
    return arcFractionDelta > 0 ? timeDelta / arcFractionDelta : 0;
  });

  // Smooth pace with a sliding window average to remove GPS noise (window = ~30s at 1Hz).
  // O(n) with no per-iteration allocations — avoids GC pressure on long tracks.
  const half = 15;
  const segmentPaces = new Array<number>(rawSegmentPaces.length);
  let windowSum = 0;
  let windowCount = 0;

  for (let i = 0; i < rawSegmentPaces.length; i++) {
    // Add incoming element on the right edge of the window
    if (i + half < rawSegmentPaces.length) {
      windowSum += rawSegmentPaces[i + half]!;
      windowCount++;
    }
    segmentPaces[i] = windowSum / windowCount;
    // Remove outgoing element on the left edge of the window
    if (i - half >= 0) {
      windowSum -= rawSegmentPaces[i - half]!;
      windowCount--;
    }
  }

  const avgPace =
    segmentPaces.reduce((sum, pace) => sum + pace, 0) / segmentPaces.length;

  const variance =
    segmentPaces.reduce((sum, pace) => sum + (pace - avgPace) ** 2, 0) /
    segmentPaces.length;
  const stdDev = Math.sqrt(variance);

  // Each GPS point gets a color based on the average pace of its adjacent segments.
  // This makes the LinearGradient between two consecutive point colors transition smoothly.
  const pointColors = projectedPoints.map((_, i) => {
    const prevPace = segmentPaces.at(i - 1) ?? segmentPaces.at(0)!;
    const nextPace = segmentPaces.at(i) ?? segmentPaces.at(-1)!;
    const pointPace = (prevPace + nextPace) / 2;
    const deviation = stdDev > 0 ? (pointPace - avgPace) / stdDev : 0;
    return paceDeviationToColor(Math.max(-1, Math.min(1, deviation)));
  });

  const segmentPaths = projectedPoints.slice(1).map((point, i) => {
    const path = Skia.Path.Make();
    path.moveTo(projectedPoints[i].x, projectedPoints[i].y);
    path.lineTo(point.x, point.y);
    return path;
  });

  return { segmentPaths, pointColors };
}

function paceDeviationToColor(deviation: number): string {
  // fast: hue 220 (blue) → 120 (green) → 0 (red) :slow
  const hue =
    deviation <= 0
      ? 120 - deviation * 100 // 220 → 120
      : 120 - deviation * 120; // 120 → 0
  return `hsl(${Math.round(hue)}, 90%, 50%)`;
}
