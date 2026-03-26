import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { MapTiles } from './components/map-tiles';
import { RouteCanvas } from './components/route-canvas';
import { type GpsPoint } from './types';
import { useRouteAnimation } from './hooks/use-route-animation';
import { useTrackData } from './hooks/use-track-data';
import {
  buildMapLayout,
  getOptimalZoom,
  getTrackBounds,
} from './utils/web-mercator';

export interface SkiaMapProps {
  track: GpsPoint[];
  durationInMs?: number;
  mapPadding?: number;
  routeColor?: string;
  strokeWidth?: number;
  dotRadius?: number;
  dotColor?: string;
  dotBorderColor?: string;
}

export function SkiaMap({
  track,
  durationInMs = 10_000,
  mapPadding = 48,
  routeColor = '#FC4C02',
  strokeWidth = 4,
  dotRadius = 8,
  dotColor = '#FFFFFF',
  dotBorderColor = '#FC4C02',
}: SkiaMapProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const layout = useMemo(() => {
    const bounds = getTrackBounds(track);
    const zoom = getOptimalZoom(bounds, screenWidth, screenHeight, mapPadding);

    return buildMapLayout(bounds, zoom, screenWidth, screenHeight);
  }, [track, screenWidth, screenHeight, mapPadding]);

  const { projectedPoints, normalizedTimes, arcFractions, routePath } =
    useTrackData(track, layout);

  const { pathEnd, dotX, dotY } = useRouteAnimation({
    projectedPoints,
    normalizedTimes,
    arcFractions,
    duration: durationInMs,
  });

  return (
    <View style={styles.container}>
      <MapTiles tiles={layout.tiles} />
      <RouteCanvas
        routePath={routePath}
        pathEnd={pathEnd}
        dotX={dotX}
        dotY={dotY}
        routeColor={routeColor}
        strokeWidth={strokeWidth}
        dotRadius={dotRadius}
        dotColor={dotColor}
        dotBorderColor={dotBorderColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#e8e0d8',
  },
});
