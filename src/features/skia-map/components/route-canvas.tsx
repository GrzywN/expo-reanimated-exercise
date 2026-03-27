import {
  Canvas,
  Circle,
  LinearGradient,
  Path,
  vec,
} from '@shopify/react-native-skia';
import { StyleSheet } from 'react-native';
import { type SharedValue } from 'react-native-reanimated';

import { type TrackData } from '../hooks/use-track-data';

export interface RouteCanvasProps {
  routePath: TrackData['routePath'];
  segmentPaths: TrackData['segmentPaths'];
  pointColors: TrackData['pointColors'];
  projectedPoints: TrackData['projectedPoints'];
  pathEnd: SharedValue<number>;
  dotX: SharedValue<number>;
  dotY: SharedValue<number>;
  strokeWidth: number;
  dotRadius: number;
  dotColor: string;
  dotBorderColor: string;
}

export function RouteCanvas({
  routePath,
  segmentPaths,
  pointColors,
  projectedPoints,
  pathEnd,
  dotX,
  dotY,
  strokeWidth,
  dotRadius,
  dotColor,
  dotBorderColor,
}: RouteCanvasProps) {
  return (
    <Canvas style={StyleSheet.absoluteFillObject}>
      {segmentPaths.map((path, i) => {
        const from = projectedPoints.at(i);
        const to = projectedPoints.at(i + 1);
        const colorFrom = pointColors.at(i);
        const colorTo = pointColors.at(i + 1);

        if (!from || !to || !colorFrom || !colorTo) {
          throw new Error(`[RouteCanvas] missing data at segment index ${i}`);
        }

        return (
          <Path
            key={i}
            path={path}
            style="stroke"
            strokeWidth={strokeWidth}
            strokeCap="round"
            strokeJoin="round"
          >
            <LinearGradient
              start={vec(from.x, from.y)}
              end={vec(to.x, to.y)}
              colors={[colorFrom, colorTo]}
            />
          </Path>
        );
      })}
      <Path
        path={routePath}
        start={pathEnd}
        end={1}
        color="rgba(180, 180, 180, 0.75)"
        style="stroke"
        strokeWidth={strokeWidth}
        strokeCap="round"
        strokeJoin="round"
      />
      <Circle cx={dotX} cy={dotY} r={dotRadius + 3} color={dotBorderColor} />
      <Circle cx={dotX} cy={dotY} r={dotRadius} color={dotColor} />
    </Canvas>
  );
}
