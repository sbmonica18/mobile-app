import { CLOUD } from '@/constants/cloudTheme';
import { mockDestinations, type Destination } from '@/mocks/destinations';
import { useDashboardStore } from '@/store/dashboardStore';
import type { PlaceItem } from '@/types/places';
import { withTravelFromOrigin } from '@/utils/travelEstimate';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, useRouter } from 'expo-router';
import { memo, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  FadeInUp,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

const CARD_W = Dimensions.get('window').width * 0.72;
const WEEKEND_W = Dimensions.get('window').width * 0.78;

const INSIGHTS = [
  { title: 'Perfect beach weather today', detail: '92% confidence' },
  { title: 'Traffic is unusually low.', detail: 'Good day for road trips.' },
  { title: 'Sunset today at 6:14 PM.', detail: 'Ideal for photography spots.' },
];

const WEEKEND = [
  {
    id: 'hills',
    title: 'Hill Stations',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    mood: 'Cool escapes',
  },
  {
    id: 'nature',
    title: 'Nature Escapes',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
    mood: 'Quiet trails',
  },
  {
    id: 'road',
    title: 'Road Adventures',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80',
    mood: 'Scenic drives',
  },
  {
    id: 'cafes',
    title: 'Hidden Cafes',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80',
    mood: 'Cozy finds',
  },
];

function LiftPressable({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: object;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: (1 - scale.value) * -10 }],
  }));
  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 18, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 220 });
      }}
      onPress={onPress}
    >
      <Animated.View style={[style, anim]}>{children}</Animated.View>
    </Pressable>
  );
}

function TrendingCard({
  item,
  index,
  scrollX,
  onPress,
}: {
  item: Destination;
  index: number;
  scrollX: SharedValue<number>;
  onPress: () => void;
}) {
  const cardStyle = useAnimatedStyle(() => {
    const input = [(index - 1) * (CARD_W + 14), index * (CARD_W + 14), (index + 1) * (CARD_W + 14)];
    return {
      transform: [
        { scale: interpolate(scrollX.value, input, [0.96, 1, 0.96], Extrapolation.CLAMP) },
      ],
    };
  });

  const imageStyle = useAnimatedStyle(() => {
    const input = [(index - 1) * (CARD_W + 14), index * (CARD_W + 14), (index + 1) * (CARD_W + 14)];
    return {
      transform: [
        { scale: 1.12 },
        { translateX: interpolate(scrollX.value, input, [-10, 0, 10], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <Animated.View entering={FadeInUp.delay(80 + index * 60).duration(420)} style={cardStyle}>
      <LiftPressable style={styles.trendCard} onPress={onPress}>
        <Animated.View style={[styles.trendImageWrap, imageStyle]}>
          <Image source={{ uri: item.coverImage }} style={styles.trendImage} />
        </Animated.View>
        <LinearGradient
          colors={['transparent', 'rgba(15,23,42,0.75)']}
          style={styles.trendOverlay}
        />
        <View style={styles.scorePill}>
          <Text style={styles.scoreText}>{item.matchScore}%</Text>
        </View>
        <View style={styles.trendBody}>
          <Text style={styles.trendName}>{item.name}</Text>
          <View style={styles.trendMeta}>
            <Meta icon="navigate-outline" text={item.travelTime} />
            <Meta icon="partly-sunny-outline" text={item.weather} />
            <Meta icon="wallet-outline" text={item.budgetEstimate} />
          </View>
        </View>
      </LiftPressable>
    </Animated.View>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={11} color="rgba(255,255,255,0.9)" />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

export const TrendingNearbySection = memo(function TrendingNearbySection() {
  const router = useRouter();
  const scrollX = useSharedValue(0);
  const userOrigin = useDashboardStore((s) => s.source);
  const destinations = useMemo(() => {
    const top = [...mockDestinations].sort((a, b) => b.popularity - a.popularity).slice(0, 6);
    if (userOrigin?.latitude && userOrigin?.longitude) {
      return withTravelFromOrigin(top, {
        latitude: userOrigin.latitude,
        longitude: userOrigin.longitude,
      });
    }
    return top;
  }, [userOrigin?.latitude, userOrigin?.longitude]);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  return (
    <Animated.View entering={FadeInUp.duration(450)} style={styles.section}>
      <Text style={styles.sectionTitle}>Today's AI Picks</Text>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_W + 14}
        contentContainerStyle={styles.hList}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {destinations.map((d, i) => (
          <TrendingCard
            key={d.id}
            item={d}
            index={i}
            scrollX={scrollX}
            onPress={() => router.push(`/(app)/(ai-flow)/destination/${d.id}` as Href)}
          />
        ))}
      </Animated.ScrollView>
    </Animated.View>
  );
});

export const ContinueExploringSection = memo(function ContinueExploringSection({
  recent,
}: {
  recent: PlaceItem[];
}) {
  const router = useRouter();
  const items = useMemo(() => {
    if (recent.length > 0) {
      return recent.slice(0, 6).map((r) => ({
        key: r.id || r.placeKey,
        title: r.placeName,
        subtitle: r.address || 'Resume your plan',
        onPress: () =>
          router.push(`/(app)/(ai-flow)/destination/${r.placeKey}` as Href),
      }));
    }
    return mockDestinations.slice(0, 4).map((d) => ({
      key: d.id,
      title: d.name,
      subtitle: d.aiSummary,
      onPress: () => router.push(`/(app)/(ai-flow)/destination/${d.id}` as Href),
    }));
  }, [recent, router]);

  return (
    <Animated.View entering={FadeInUp.delay(60).duration(450)} style={styles.section}>
      <Text style={styles.sectionTitle}>Continue Exploring</Text>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hList}
      >
        {items.map((item, i) => (
          <Animated.View key={item.key} entering={FadeInUp.delay(80 + i * 40).duration(360)}>
            <LiftPressable style={styles.continueCard} onPress={item.onPress}>
              <View style={styles.continueIcon}>
                <Ionicons name="time-outline" size={18} color={CLOUD.primary} />
              </View>
              <View style={styles.continueCopy}>
                <Text style={styles.continueName} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.continueSub} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>
              <View style={styles.resumeBtn}>
                <Text style={styles.resumeText}>Resume</Text>
              </View>
            </LiftPressable>
          </Animated.View>
        ))}
      </Animated.ScrollView>
    </Animated.View>
  );
});

export const AiQuickInsightsStrip = memo(function AiQuickInsightsStrip() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % INSIGHTS.length), 4500);
    return () => clearInterval(id);
  }, []);

  const insight = INSIGHTS[idx];

  return (
    <Animated.View entering={FadeInUp.delay(80).duration(450)} style={styles.insightCard}>
      <LinearGradient
        colors={['#EFF6FF', '#F5F3FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.insightIcon}>
        <Ionicons name="sparkles" size={16} color={CLOUD.aiAccent} />
      </View>
      <View style={styles.insightCopy}>
        <Text style={styles.insightEyebrow}>AI Quick Insights</Text>
        <Animated.Text key={insight.title} entering={FadeInUp.duration(350)} style={styles.insightTitle}>
          {insight.title}
        </Animated.Text>
        <Text style={styles.insightDetail}>{insight.detail}</Text>
      </View>
    </Animated.View>
  );
});

export const WeekendInspirationSection = memo(function WeekendInspirationSection({
  onSelectMood,
}: {
  onSelectMood?: (mood: string) => void;
}) {
  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  return (
    <Animated.View entering={FadeInUp.delay(100).duration(450)} style={styles.section}>
      <Text style={styles.sectionTitle}>Weekend Inspiration</Text>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={WEEKEND_W + 14}
        contentContainerStyle={styles.hList}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {WEEKEND.map((item, index) => (
          <WeekendCard
            key={item.id}
            item={item}
            index={index}
            scrollX={scrollX}
            onPress={() => onSelectMood?.(item.title)}
          />
        ))}
      </Animated.ScrollView>
    </Animated.View>
  );
});

function WeekendCard({
  item,
  index,
  scrollX,
  onPress,
}: {
  item: (typeof WEEKEND)[number];
  index: number;
  scrollX: SharedValue<number>;
  onPress: () => void;
}) {
  const style = useAnimatedStyle(() => {
    const input = [
      (index - 1) * (WEEKEND_W + 14),
      index * (WEEKEND_W + 14),
      (index + 1) * (WEEKEND_W + 14),
    ];
    return {
      transform: [
        { scale: interpolate(scrollX.value, input, [0.95, 1, 0.95], Extrapolation.CLAMP) },
      ],
    };
  });

  const imageStyle = useAnimatedStyle(() => {
    const input = [
      (index - 1) * (WEEKEND_W + 14),
      index * (WEEKEND_W + 14),
      (index + 1) * (WEEKEND_W + 14),
    ];
    return {
      transform: [
        { scale: 1.1 },
        { translateX: interpolate(scrollX.value, input, [-12, 0, 12], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <Animated.View style={style}>
      <LiftPressable style={styles.weekendCard} onPress={onPress}>
        <Animated.View style={[styles.weekendImageWrap, imageStyle]}>
          <Image source={{ uri: item.image }} style={styles.weekendImage} />
        </Animated.View>
        <LinearGradient
          colors={['transparent', 'rgba(15,23,42,0.78)']}
          style={styles.trendOverlay}
        />
        <View style={styles.weekendBody}>
          <Text style={styles.weekendMood}>{item.mood}</Text>
          <Text style={styles.weekendTitle}>{item.title}</Text>
        </View>
      </LiftPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 14,
  },
  sectionTitle: {
    color: CLOUD.ink,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  hList: {
    gap: 14,
    paddingRight: 8,
  },
  trendCard: {
    width: CARD_W,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: CLOUD.ink,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 4,
  },
  trendImageWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  trendImage: {
    width: '100%',
    height: '100%',
  },
  trendOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  scorePill: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(15,23,42,0.55)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  scoreText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  trendBody: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
  },
  trendName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  trendMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 11,
    fontWeight: '600',
  },
  continueCard: {
    width: 260,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: CLOUD.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: CLOUD.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 3,
  },
  continueIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: CLOUD.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueCopy: { flex: 1 },
  continueName: {
    color: CLOUD.ink,
    fontWeight: '800',
    fontSize: 15,
  },
  continueSub: {
    color: CLOUD.muted,
    fontSize: 12,
    marginTop: 2,
  },
  resumeBtn: {
    backgroundColor: CLOUD.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: CLOUD.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  resumeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  insightCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: CLOUD.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 3,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightCopy: { flex: 1 },
  insightEyebrow: {
    color: CLOUD.aiAccent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  insightTitle: {
    color: CLOUD.ink,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  insightDetail: {
    color: CLOUD.muted,
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  weekendCard: {
    width: WEEKEND_W,
    height: 180,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: CLOUD.ink,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 4,
  },
  weekendImageWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  weekendImage: {
    width: '100%',
    height: '100%',
  },
  weekendBody: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
  },
  weekendMood: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
  },
  weekendTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: -0.4,
  },
});
