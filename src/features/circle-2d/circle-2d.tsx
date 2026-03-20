import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// https://www.joshwcomeau.com/svg/interactive-guide-to-paths/
export const Circle2d = () => {
  // M - Move to a point
  // L - Line to a point
  // Q - Render “quadratic” Bézier curves. These are Bézier curves with a single control point.

  // NOTE: every d must start with M instruction e.g. start at 0,0
  const startingX = 0;
  const startingY = 0;

  const lineLength = 100;
  const strokeWidth = 2.5;

  const viewBox = `0 0 ${lineLength} ${strokeWidth}`;
  const d = `
M ${startingX},${startingY}
L ${lineLength}, 0
`;

  return (
    <View style={styles.container}>
      <Svg viewBox={viewBox} height="50%" width="50%">
        <Path
          d={d}
          strokeWidth={strokeWidth}
          stroke="red"
          fill="green"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
