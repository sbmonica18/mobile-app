import { CLOUD } from '@/constants/cloudTheme';
import {
  getClimateScene,
  resolveCondition,
} from '@/constants/weatherTheme';
import { WeatherClimateScene } from '@/components/weather/WeatherClimateScene';
import { useDashboardStore } from '@/store/dashboardStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  refreshToken?: number;
  onRefreshWeather?: () => void;
};

/**
 * Live Intelligence Bar — weather-matched scenic background
 * (sun / clouds / rain / night) with expandable metrics.
 */
export const LiveIntelligenceBar = memo(function LiveIntelligenceBar({
  onRefreshWeather,
}: Props) {
  const source = useDashboardStore((s) => s.source);
  const weather = useDashboardStore((s) => s.weather);
  const weatherLoading = useDashboardStore((s) => s.weatherLoading);
  const locationError = useDashboardStore((s) => s.locationError);
  const reduceMotion = !!useReducedMotion();

  const [expanded, setExpanded] = useState(false);
  const expand = useSharedValue(0);
  const chevron = useSharedValue(0);

  const scene = getClimateScene(weather?.code, weather?.description, weather?.windKph);
  const condition = resolveCondition(weather?.code, weather?.description);
  const statusLabel =
    weather?.description ||
    scene.label ||
    condition.charAt(0).toUpperCase() + condition.slice(1);
  const locationName =
    source?.label || source?.address || (locationError ? 'Location unavailable' : 'Detecting location…');
  const aqiValue = weather?.aqi;
  const aqiLabel = aqiValue != null ? aqiStatus(aqiValue) : null;

  useEffect(() => {
    expand.value = withTiming(expanded ? 1 : 0, {
      duration: reduceMotion ? 0 : 250,
      easing: Easing.out(Easing.cubic),
    });
    chevron.value = withTiming(expanded ? 1 : 0, {
      duration: reduceMotion ? 0 : 250,
      easing: Easing.out(Easing.cubic),
    });
  }, [chevron, expand, expanded, reduceMotion]);

  const detailsStyle = useAnimatedStyle(() => ({
    height: interpolate(expand.value, [0, 1], [0, 76]),
    opacity: expand.value,
    marginTop: interpolate(expand.value, [0, 1], [0, 10]),
    overflow: 'hidden' as const,
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevron.value * 180}deg` }],
  }));

  return (
    <View style={styles.card}>
      {/* Weather-matched background: sun / clouds / rain / etc. */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <WeatherClimateScene key={scene.state} scene={scene} reduceMotion={reduceMotion} />
        <LinearGradient
          colors={['rgba(15,23,42,0.22)', 'rgba(15,23,42,0.45)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={styles.ambient}>
        <View style={styles.locRow}>
          <Ionicons name="location" size={14} color="#fff" />
          <Text style={styles.locText} numberOfLines={1}>
            {locationName}
          </Text>
          {onRefreshWeather ? (
            <Pressable onPress={onRefreshWeather} hitSlop={8} accessibilityLabel="Refresh weather">
              <Ionicons name="refresh" size={14} color="rgba(255,255,255,0.85)" />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.weatherRow}>
          {weatherLoading && !weather ? (
            <Text style={styles.weatherLoading}>Updating conditions…</Text>
          ) : (
            <>
              <View style={styles.iconBadge}>
                <Ionicons
                  name={scene.icon as keyof typeof Ionicons.glyphMap}
                  size={22}
                  color={scene.accent}
                />
              </View>
              <Text style={styles.temp}>
                {weather?.temperatureC != null ? `${weather.temperatureC}°` : '--°'}
              </Text>
              <Text style={styles.condition} numberOfLines={1}>
                {statusLabel}
              </Text>
              <View style={styles.aqiBadge}>
                <Ionicons name="leaf-outline" size={11} color="#fff" />
                <Text style={styles.aqiText}>
                  {aqiValue != null && aqiLabel
                    ? `AQI ${aqiValue} · ${aqiLabel}`
                    : 'AQI —'}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Pressable
          onPress={() => setExpanded((v) => !v)}
          style={styles.chevronBtn}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Collapse weather details' : 'Expand weather details'}
        >
          <Animated.View style={chevronStyle}>
            <Ionicons name="chevron-down" size={18} color="#fff" />
          </Animated.View>
        </Pressable>
      </View>

      <Animated.View style={detailsStyle}>
        <View style={styles.metricsGrid}>
          <MetricCell
            icon="water-outline"
            label="Humidity"
            value={weather?.humidity != null ? `${weather.humidity}%` : '--'}
          />
          <MetricCell
            icon="navigate-outline"
            label="Wind"
            value={weather?.windKph != null ? `${weather.windKph} km/h` : '--'}
          />
          <MetricCell
            icon="sunny-outline"
            label="UV"
            value={weather?.uvIndex != null ? String(weather.uvIndex) : '--'}
          />
          <MetricCell
            icon="rainy-outline"
            label="Rain"
            value={
              weather?.rainProbability != null ? `${weather.rainProbability}%` : '--'
            }
          />
        </View>
      </Animated.View>
    </View>
  );
});

function aqiStatus(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Sensitive';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function MetricCell({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metricCell}>
      <Ionicons name={icon} size={13} color="#fff" />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

/** @deprecated Use LiveIntelligenceBar — kept for any lingering imports. */
export const UrbanLensPulse = LiveIntelligenceBar;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
    minHeight: 88,
    ...CLOUD.shadows.search,
  },
  ambient: {
    gap: 8,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 32,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherLoading: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
  },
  temp: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  condition: {
    flex: 1,
    color: 'rgba(255,255,255,0.92)',
    fontSize: 14,
    fontWeight: '600',
  },
  aqiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  aqiText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  chevronBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricCell: {
    width: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  metricValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
});
