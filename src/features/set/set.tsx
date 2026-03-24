import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, { SharedTransition } from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';

export type CaseStudy = {
  id: string;
  title: string;
  readTime: string;
  image: ImageSourcePropType;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'event-planning',
    title:
      "Refining an Event Planning App That Won Google Play's Best App Award",
    readTime: '6 min read',
    image: require('../../../assets/images/case-studies/partiful.png'),
  },
  {
    id: 'camping-app',
    title:
      '300% More Active Users of a Camping App Developed with React Native',
    readTime: '5 min read',
    image: require('../../../assets/images/case-studies/campy.png'),
  },
  {
    id: 'boating',
    title:
      'Optimizing Battery Usage & Improving Crash-Free Rate for the Boating Community',
    readTime: '7 min read',
    image: require('../../../assets/images/case-studies/sea-people.png'),
  },
];

export const transition = SharedTransition.duration(550).springify();

export const BLACK = 'rgb(13, 15, 38)';
export const BG = '#F5F3EE';
export const FONT_REGULAR = 'Aeonik-Regular';
export const FONT_BOLD = 'Aeonik-Bold';

const SIDE_X = '#D0D0D0';
const SIDE_Y = '#A8A8A8';

const DEPTH = 10;

const CARD_HORIZONTAL_INSET = 16 * 2 + DEPTH + 1 * 2;

export const DETAIL_BANNER_HEIGHT = 320;
const BANNER_ASPECT = 7 / 4;

function Block3D({
  children,
  cardWidth,
}: {
  children: React.ReactNode;
  cardWidth: number;
}) {
  const [cardHeight, setCardHeight] = useState(0);
  const W = cardWidth;
  const H = cardHeight;
  const D = DEPTH;

  return (
    <View style={{ width: W + D, marginBottom: D }}>
      {/* SVG side faces — rendered first = behind front card */}
      {H > 0 && (
        <Svg
          width={W + D}
          height={H + D}
          style={styles.svgOverlay}
          pointerEvents="none"
        >
          {/* Right face parallelogram: (W,0)→(W+D,D)→(W+D,H+D)→(W,H) */}
          <Polygon
            points={`${W},0 ${W + D},${D} ${W + D},${H + D} ${W},${H}`}
            fill={SIDE_X}
          />
          {/* Bottom face parallelogram: (0,H)→(D,H+D)→(W+D,H+D)→(W,H) */}
          <Polygon
            points={`0,${H} ${D},${H + D} ${W + D},${H + D} ${W},${H}`}
            fill={SIDE_Y}
          />
        </Svg>
      )}
      {/* Front card — rendered second = on top */}
      <View
        style={[styles.blockFront, { width: W }]}
        onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)}
      >
        {children}
      </View>
    </View>
  );
}

function CaseStudyCard({
  item,
  onPress,
}: {
  item: CaseStudy;
  onPress: () => void;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const bannerWidth = screenWidth - CARD_HORIZONTAL_INSET;
  const bannerHeight = Math.round(bannerWidth / BANNER_ASPECT);
  const cardWidth = bannerWidth + 1 * 2;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && { opacity: 0.9 }]}
    >
      <Block3D cardWidth={cardWidth}>
        <Animated.Image
          sharedTransitionTag={`banner-${item.id}`}
          sharedTransitionStyle={transition}
          source={item.image}
          style={{ width: bannerWidth, height: bannerHeight }}
          resizeMode="cover"
        />

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardReadTime}>{item.readTime}</Text>
        </View>
      </Block3D>
    </Pressable>
  );
}

export function CaseStudiesListScreen() {
  const router = useRouter();

  return (
    <Animated.ScrollView
      style={styles.screen}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.listHeader}>
        <Text style={styles.heading}>Case Studies</Text>
      </View>

      <View style={styles.cardList}>
        {CASE_STUDIES.map((item) => (
          <CaseStudyCard
            key={item.id}
            item={item}
            onPress={() => router.push(`/case-studies/${item.id}`)}
          />
        ))}
      </View>
    </Animated.ScrollView>
  );
}

export function CaseStudyDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const item = CASE_STUDIES.find((c) => c.id === id)!;

  return (
    <Animated.ScrollView
      style={[styles.screen, styles.detailScreen]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.Image
        sharedTransitionTag={`banner-${item.id}`}
        sharedTransitionStyle={transition}
        source={item.image}
        style={styles.detailBanner}
        resizeMode="cover"
      />

      <View style={styles.detailContainer}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>

        <Text style={styles.detailTitle}>{item.title}</Text>

        <Text style={styles.bodyText}>
          This case study explores how our team collaborated closely with the
          client to deliver a production-ready React Native application — one
          that exceeded every benchmark and achieved measurable, lasting
          results.
        </Text>
        <Text style={styles.bodyText}>
          From architecture decisions to performance tuning, every technical
          choice was driven by real user data and business requirements. The
          result speaks for itself.
        </Text>
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  detailScreen: {
    backgroundColor: '#FFFFFF',
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  listContent: {
    paddingBottom: 56,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 32,
    backgroundColor: BLACK,
  },
  heading: {
    fontFamily: FONT_REGULAR,
    fontSize: 28,
    lineHeight: 36,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  cardList: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 20,
  },
  blockFront: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardBody: {
    padding: 20,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  cardTitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 18,
    color: BLACK,
    lineHeight: 26,
    fontWeight: '500',
  },
  cardReadTime: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    color: BLACK,
    opacity: 0.6,
  },
  detailBanner: {
    width: '100%',
    height: DETAIL_BANNER_HEIGHT,
  },
  detailContainer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E2E2',
    gap: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontFamily: FONT_REGULAR,
    fontSize: 15,
    color: BLACK,
    letterSpacing: 0.2,
  },
  detailTitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 28,
    color: BLACK,
    lineHeight: 36,
  },
  bodyText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    color: BLACK,
    lineHeight: 24,
  },
});
