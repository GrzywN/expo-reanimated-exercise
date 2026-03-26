import { Skia } from '@shopify/react-native-skia';
import { useMemo } from 'react';

import { type GpsPoint } from '../types';
import { type MapLayout } from '../utils/web-mercator';

export interface TrackData {
  projectedPoints: { x: number; y: number }[];
  normalizedTimes: number[];
  arcFractions: number[];
  routePath: ReturnType<typeof Skia.Path.Make>;
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

    return { projectedPoints, normalizedTimes, arcFractions, routePath };
  }, [track, layout]);
}
