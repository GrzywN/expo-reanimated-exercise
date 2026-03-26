import { Canvas, Circle, Path } from '@shopify/react-native-skia';
import { StyleSheet } from 'react-native';
import { type SharedValue } from 'react-native-reanimated';

import { type TrackData } from '../hooks/use-track-data';

export interface RouteCanvasProps {
  routePath: TrackData['routePath'];
  pathEnd: SharedValue<number>;
  dotX: SharedValue<number>;
  dotY: SharedValue<number>;
  routeColor: string;
  strokeWidth: number;
  dotRadius: number;
  dotColor: string;
  dotBorderColor: string;
}

export function RouteCanvas({
  routePath,
  pathEnd,
  dotX,
  dotY,
  routeColor,
  strokeWidth,
  dotRadius,
  dotColor,
  dotBorderColor,
}: RouteCanvasProps) {
  return (
    <Canvas style={StyleSheet.absoluteFillObject}>
      <Path
        path={routePath}
        start={0}
        end={pathEnd}
        color={routeColor}
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
