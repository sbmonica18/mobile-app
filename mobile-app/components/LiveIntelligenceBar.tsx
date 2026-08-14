import { WeatherClimateScene } from '@/components/weather/WeatherClimateScene';
import { CLOUD } from '@/constants/cloudTheme';
import {
  getClimateScene,
  getConditionFromCode,
  getWeatherIcon,
  isDayTime,
} from '@/constants/weatherTheme';
import type { WeatherInfo } from '@/types/places';
import { useDashboardStore } from '@/store/dashboardStore';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { memo, useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomInEasyDown,
} from 'react-native-reanimated';

type Props = {
  refreshToken?: number;
  onRefreshWeather?: () => void;
};

const CLOSED_SLOT_H = 64;
const SHEET_MAX = Math.min(520, Math.round(Dimensions.get('window').height * 0.62));

/**
 * Tiny glance strip on Home. Details open as a compact bottom sheet
 * so Search / Explore with AI never get covered or pushed.
 */
export const LiveIntelligenceBar = memo(function LiveIntelligenceBar({
  onRefreshWeather,
}: Props) {
  const insets = useSafeAreaInsets();
  const source = useDashboardStore((s) => s.source);
  const weather = useDashboardStore((s) => s.weather);
  const weatherLoading = useDashboardStore((s) => s.weatherLoading);
  const locationError = useDashboardStore((s) => s.locationError);
  const colors = useThemeStore((s) => s.colors);
  const reduceMotion = !!useReducedMotion();

  const [expanded, setExpanded] = useState(false);
  const open = useSharedValue(0);
  const float = useSharedValue(0);

  const scene = getClimateScene(weather?.code, weather?.description, weather?.windKph);
  const statusLabel = weather?.description || scene.label || 'Updating';
  const locationName =
    source?.label ||
    source?.address ||
    (locationError ? 'Location unavailable' : 'Detecting location…');
  const aqiValue = weather?.aqi;
  const aqiLabel = aqiValue != null ? aqiStatus(aqiValue) : null;

  useEffect(() => {
    if (reduceMotion) {
      float.value = 0;
      return;
    }
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [float, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      open.value = expanded ? 1 : 0;
      return;
    }
    if (expanded) {
      open.value = 0;
      open.value = withSpring(1, { damping: 16, stiffness: 170 });
    } else {
      open.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) });
    }
  }, [expanded, open, reduceMotion]);

  const floatStyle = useAnimatedStyle(() => {
    const tilt = interpolate(float.value, [0, 1], [-2.4, 2.4], Extrapolation.CLAMP);
    const lift = interpolate(float.value, [0, 1], [0, -4], Extrapolation.CLAMP);
    return {
      transform: [
        { perspective: 700 },
        { rotateX: `${tilt}deg` },
        { translateY: lift },
      ],
      shadowOpacity: interpolate(float.value, [0, 1], [0.08, 0.16], Extrapolation.CLAMP),
    };
  });

  const sheetStyle = useAnimatedStyle(() => ({
    opacity: open.value,
    transform: [
      { translateY: (1 - open.value) * 36 },
      { scale: interpolate(open.value, [0, 1], [0.96, 1], Extrapolation.CLAMP) },
    ],
  }));

  const close = () => setExpanded(false);
  const summary = weatherSummary(weather);
  const insight = weatherInsight(weather);
  const hours = weather?.hourly ?? [];

  return (
    <>
      <View style={styles.slot} collapsable={false}>
        <Animated.View style={[styles.cardLift, floatStyle]}>
          <Pressable
            onPress={() => setExpanded(true)}
            accessibilityRole="button"
            accessibilityLabel="Show weather details"
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.96 },
            ]}
          >
            {colors.statusBar === 'dark' ? <WeatherSurface scene={scene} /> : null}
            <View style={styles.strip}>
              <View style={[styles.iconBadge, { backgroundColor: colors.lightBlue }]}>
                <Ionicons
                  name={scene.icon as keyof typeof Ionicons.glyphMap}
                  size={22}
                  color={colors.primary}
                />
              </View>
              {weatherLoading && !weather ? (
                <Text style={[styles.loading, { color: colors.muted }]}>Updating…</Text>
              ) : (
                <>
                  <Text style={[styles.temp, { color: colors.primary }]}>
                    {weather?.temperatureC != null ? `${weather.temperatureC}°` : '--°'}
                  </Text>
                  <View style={styles.stripCopy}>
                    <Text style={[styles.condition, { color: colors.body }]} numberOfLines={1}>
                      {statusLabel}
                    </Text>
                    <Text style={[styles.support, { color: colors.muted }]} numberOfLines={1}>
                      {[
                        aqiValue != null && aqiLabel ? `AQI ${aqiValue}` : null,
                        weather?.rainProbability != null ? `Rain ${weather.rainProbability}%` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ') || locationName}
                    </Text>
                  </View>
                </>
              )}
              <Ionicons name="chevron-up" size={16} color={colors.muted} />
            </View>
          </Pressable>
        </Animated.View>
      </View>

      <Modal
        visible={expanded}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={close}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.scrim} onPress={close} accessibilityLabel="Close weather" />
          <Animated.View
            style={[
              styles.sheet,
              {
                paddingBottom: Math.max(insets.bottom, 20),
                maxHeight: SHEET_MAX,
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
              sheetStyle,
            ]}
          >
            <View style={styles.handle} />
            <View style={styles.sheetHead}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sheetKicker, { color: colors.muted }]}>{locationName}</Text>
                <View style={styles.sheetTitleRow}>
                  <Ionicons
                    name={scene.icon as keyof typeof Ionicons.glyphMap}
                    size={22}
                    color={colors.primary}
                  />
                  <Text style={[styles.sheetTemp, { color: colors.primary }]}>
                    {weather?.temperatureC != null ? `${weather.temperatureC}°` : '--°'}
                  </Text>
                  <Text style={[styles.sheetCond, { color: colors.body }]} numberOfLines={1}>
                    {statusLabel}
                  </Text>
                </View>
              </View>
              {onRefreshWeather ? (
                <Pressable onPress={onRefreshWeather} style={[styles.iconBtn, { backgroundColor: colors.soft }]} accessibilityLabel="Refresh">
                  <Ionicons name="refresh" size={18} color={colors.body} />
                </Pressable>
              ) : null}
              <Pressable onPress={close} style={[styles.iconBtn, { backgroundColor: colors.soft }]} accessibilityLabel="Close">
                <Ionicons name="close" size={18} color={colors.body} />
              </Pressable>
            </View>

            <View style={styles.metricRow}>
              {weather?.feelsLikeC != null ? (
                <Metric label="Feels" value={`${weather.feelsLikeC}°`} />
              ) : null}
              {weather?.humidity != null ? (
                <Metric label="Humidity" value={`${weather.humidity}%`} />
              ) : null}
              {weather?.windKph != null ? (
                <Metric label="Wind" value={`${weather.windKph} km/h`} />
              ) : null}
              {weather?.pressureHpa != null ? (
                <Metric label="Pressure" value={`${weather.pressureHpa}`} />
              ) : null}
            </View>

            {summary ? <Text style={[styles.summary, { color: colors.body }]}>{summary}</Text> : null}

            {hours.length ? (
              <View>
                <Text style={[styles.sectionLabel, { color: colors.muted }]}>Today · swipe hours</Text>
                <FlatList
                  horizontal
                  data={hours}
                  keyExtractor={(slot, i) => `${slot.label}-${i}`}
                  nestedScrollEnabled
                  directionalLockEnabled
                  showsHorizontalScrollIndicator
                  keyboardShouldPersistTaps="handled"
                  style={styles.hourScroll}
                  contentContainerStyle={styles.hourRow}
                  renderItem={({ item: slot, index: i }) => (
                    <Animated.View
                      entering={
                        reduceMotion
                          ? undefined
                          : ZoomInEasyDown.delay(40 + i * 45).duration(320).springify().damping(14)
                      }
                      style={[
                        styles.hourCard,
                        {
                          backgroundColor: i === 0 ? colors.lightBlue : colors.soft,
                          borderColor: i === 0 ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.hourLabel, { color: i === 0 ? colors.primary : colors.muted }]}>
                        {slot.label}
                      </Text>
                      <Ionicons
                        name={
                          getWeatherIcon(
                            getConditionFromCode(slot.code),
                            isDayTime(),
                          ) as keyof typeof Ionicons.glyphMap
                        }
                        size={18}
                        color={colors.primary}
                      />
                      <Text style={[styles.hourTemp, { color: i === 0 ? colors.primary : colors.body }]}>
                        {slot.temperatureC}°
                      </Text>
                    </Animated.View>
                  )}
                />
              </View>
            ) : null}

            {insight ? (
              <View style={[styles.insight, { backgroundColor: colors.lightBlue }]}>
                <Ionicons name="sparkles" size={16} color={colors.primary} />
                <Text style={[styles.insightText, { color: colors.body }]}>{insight}</Text>
              </View>
            ) : null}

            {(weather?.sunrise || weather?.sunset) && (
              <Text style={[styles.sunText, { color: colors.muted }]}>
                {[
                  weather.sunrise ? `Sunrise ${weather.sunrise}` : null,
                  weather.sunset ? `Sunset ${weather.sunset}` : null,
                ]
                  .filter(Boolean)
                  .join('  ·  ')}
              </Text>
            )}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
});

function WeatherSurface({ scene }: { scene: ReturnType<typeof getClimateScene> }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <WeatherClimateScene key={scene.state} scene={scene} tone="cloud" />
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const colors = useThemeStore((s) => s.colors);
  return (
    <View style={[styles.metric, { backgroundColor: colors.soft }]}>
      <Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: colors.body }]}>{value}</Text>
    </View>
  );
}

function aqiStatus(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Sensitive';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function weatherSummary(weather: WeatherInfo | null): string | null {
  if (!weather) return null;
  const rain = weather.rainProbability ?? 0;
  if (weather.code >= 95) return 'Thunderstorms possible — keep outdoor plans flexible.';
  if (rain >= 55 || weather.code >= 61) {
    return 'Heavy showers are likely through the next few hours.';
  }
  if (rain >= 35) return 'Rain probability is elevated — pack a light cover.';
  if (weather.windKph >= 28) return 'Stronger winds may affect open viewpoints.';
  if (weather.temperatureC >= 34) return 'Hot conditions — plan shade and hydration.';
  if ((weather.humidity ?? 0) >= 80 && weather.temperatureC >= 28) {
    return 'High humidity may make it feel warmer than the reading.';
  }
  return 'Conditions look workable for outdoor travel right now.';
}

function weatherInsight(weather: WeatherInfo | null): string | null {
  if (!weather) return null;
  const rain = weather.rainProbability ?? 0;
  if (rain >= 50) {
    return 'Rain is more likely soon. Prefer covered stops or shift outdoor time earlier.';
  }
  if (weather.aqi != null && weather.aqi > 100) {
    return 'Air quality is elevated — shorter outdoor segments may feel better.';
  }
  if (weather.uvIndex != null && weather.uvIndex >= 7) {
    return 'UV is high — seek shade around midday if you are outdoors.';
  }
  if (rain < 25 && weather.temperatureC >= 20 && weather.temperatureC <= 32) {
    return 'Good window for outdoor activities while conditions stay mild.';
  }
  return null;
}

/** @deprecated Use LiveIntelligenceBar */
export const UrbanLensPulse = LiveIntelligenceBar;

const styles = StyleSheet.create({
  slot: {
    height: CLOSED_SLOT_H + 6,
    zIndex: 10,
    paddingBottom: 2,
  },
  cardLift: {
    borderRadius: 18,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 6,
  },
  card: {
    height: CLOSED_SLOT_H,
    borderRadius: 18,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: CLOUD.border,
    overflow: 'hidden',
    backgroundColor: CLOUD.card,
  },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stripCopy: { flex: 1, minWidth: 0 },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CLOUD.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  temp: {
    color: CLOUD.primary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  condition: {
    color: CLOUD.body,
    fontSize: 13,
    fontWeight: '700',
  },
  support: {
    color: CLOUD.muted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  loading: { color: CLOUD.muted, fontSize: 13, fontWeight: '600' },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  sheet: {
    backgroundColor: CLOUD.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: CLOUD.border,
    ...CLOUD.shadows.hero,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: CLOUD.border,
    marginBottom: 4,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sheetKicker: {
    fontSize: 12,
    fontWeight: '700',
    color: CLOUD.muted,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  sheetTemp: {
    fontSize: 28,
    fontWeight: '800',
    color: CLOUD.primary,
    letterSpacing: -0.6,
  },
  sheetCond: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: CLOUD.body,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CLOUD.soft,
  },
  metricRow: { flexDirection: 'row', gap: 8 },
  metric: {
    flex: 1,
    backgroundColor: CLOUD.soft,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  metricLabel: { fontSize: 11, fontWeight: '600', color: CLOUD.muted },
  metricValue: { fontSize: 13, fontWeight: '800', color: CLOUD.body, marginTop: 2, textAlign: 'center' },
  summary: {
    fontSize: 13,
    lineHeight: 19,
    color: CLOUD.body,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: CLOUD.muted,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  hourScroll: {
    height: 92,
    flexGrow: 0,
    ...(Platform.OS === 'web' ? { overflowX: 'auto' as const, overflowY: 'hidden' as const } : null),
  },
  hourRow: { gap: 8, paddingRight: 16, paddingBottom: 8, alignItems: 'stretch' },
  hourCard: {
    width: 64,
    borderRadius: 16,
    backgroundColor: CLOUD.card,
    borderWidth: 1,
    borderColor: CLOUD.border,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#2563EB',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  hourCardNow: {
    backgroundColor: CLOUD.lightBlue,
    borderColor: CLOUD.primary,
  },
  hourLabel: { fontSize: 10, fontWeight: '800', color: CLOUD.muted },
  hourLabelNow: { color: CLOUD.primary },
  hourTemp: { fontSize: 14, fontWeight: '800', color: CLOUD.body },
  hourTempNow: { color: CLOUD.primary },
  insight: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: CLOUD.lightBlue,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    minHeight: 64,
  },
  insightText: {
    flex: 1,
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 20,
    color: CLOUD.body,
    fontWeight: '600',
  },
  sunText: { fontSize: 12, color: CLOUD.muted, fontWeight: '600' },
});
