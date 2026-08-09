import { CLOUD } from '@/constants/cloudTheme';
import {
  getClimateScene,
  resolveCondition,
} from '@/constants/weatherTheme';
import { WeatherClimateScene } from '@/components/weather/WeatherClimateScene';
import { Ionicons } from '@expo/vector-icons';
import { MapPin, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

/** Layout tokens — Cloud Intelligence light shell (weather card keeps its own look). */
export const HOME = {
  pad: CLOUD.pad,
  gap: CLOUD.gap,
  cardPad: CLOUD.cardPad,
  searchH: CLOUD.searchH,
  cardW: CLOUD.cardW,
  navH: CLOUD.navH,
  navy: CLOUD.bg,
  navyDeep: '#FFFFFF',
  card: CLOUD.card,
  cardSolid: CLOUD.soft,
  ink: CLOUD.ink,
  muted: CLOUD.muted,
  soft: CLOUD.soft,
  line: CLOUD.border,
  primary: CLOUD.primary,
  accent: CLOUD.accent,
};

export const EXPLORE_CHIPS: Array<{
  key: 'heritage' | 'museum' | 'park' | 'beach' | 'theatre';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
}> = [
  { key: 'heritage', label: 'Heritage', icon: 'business-outline', accent: '#64748B' },
  { key: 'museum', label: 'Museum', icon: 'color-palette-outline', accent: '#F97316' },
  { key: 'park', label: 'Park', icon: 'leaf-outline', accent: '#22C55E' },
  { key: 'beach', label: 'Beach', icon: 'sunny-outline', accent: '#F59E0B' },
  { key: 'theatre', label: 'Theatre', icon: 'ticket-outline', accent: '#8B5CF6' },
];

function AmbientBlob({
  size,
  color,
  left,
  top,
  duration,
}: {
  size: number;
  color: string;
  left: number | `${number}%`;
  top: number | `${number}%`;
  duration: number;
}) {
  const drift = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift, duration]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ambientBlob,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left,
          top,
          opacity: 0.045,
          transform: [
            {
              translateY: drift.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -18],
              }),
            },
          ],
        },
      ]}
    />
  );
}

export function HomeShell({ children }: { children: ReactNode }) {
  return (
    <View style={styles.shell}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <AmbientBlob size={180} color={CLOUD.primary} left="-12%" top="8%" duration={18000} />
        <AmbientBlob size={140} color={CLOUD.aiAccent} left="70%" top="32%" duration={22000} />
        <AmbientBlob size={120} color={CLOUD.accent} left="20%" top="68%" duration={20000} />
      </View>
      {children}
    </View>
  );
}

/* ── Header: brand + location + glass profile ─────────────── */

export function HomeHeader({
  name,
  locationLabel,
  onAvatarPress,
}: {
  name: string;
  locationLabel?: string;
  temperatureC?: number;
  aqiLabel?: string;
  onNotify?: () => void;
  onAvatarPress?: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const locPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(logoFloat, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ]),
    );
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(8000),
        Animated.timing(shimmer, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(locPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(locPulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]),
    );
    floatLoop.start();
    shimmerLoop.start();
    pulseLoop.start();
    return () => {
      floatLoop.stop();
      shimmerLoop.stop();
      pulseLoop.stop();
    };
  }, [logoFloat, locPulse, shimmer]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.brandRow}>
          <Animated.View
            style={[
              styles.brandLogo,
              {
                transform: [
                  {
                    scale: logoFloat.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.02],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.logoGlow} />
            <Image
              source={require('../assets/images/logo.png')}
              style={{ width: 30, height: 30 }}
              resizeMode="contain"
            />
          </Animated.View>
          <View style={styles.brandTextWrap}>
            <Text style={styles.brandTextUrban}>
              Urban
              <Text style={styles.brandTextLens}>Lens</Text>
            </Text>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.lensShimmer,
                {
                  opacity: shimmer.interpolate({
                    inputRange: [0, 0.4, 1],
                    outputRange: [0, 0.55, 0],
                  }),
                  transform: [
                    {
                      translateX: shimmer.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-10, 56],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
        </View>
        {locationLabel ? (
          <View style={styles.headerLocBlock}>
            <View style={styles.headerLocLabelRow}>
              <View style={styles.locPulseWrap}>
                <Animated.View
                  style={[
                    styles.locPulseRing,
                    {
                      opacity: locPulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.45, 0],
                      }),
                      transform: [
                        {
                          scale: locPulse.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.8],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                <View style={styles.locPulseDot} />
              </View>
              <Text style={styles.headerLocEyebrow}>Currently Exploring</Text>
            </View>
            <Text style={styles.headerLocText} numberOfLines={1}>
              {locationLabel}
            </Text>
          </View>
        ) : null}
      </View>

      <Pressable
        onPress={onAvatarPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessible
        accessibilityLabel={`Profile, ${name}`}
      >
        <Animated.View style={[styles.avatar, { transform: [{ scale: scaleAnim }] }]}>
          <User size={20} color={CLOUD.primary} />
          <View style={styles.avatarDot} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

// Removed weatherIonicon

export function WeatherLocationBox({
  locationLabel,
  temperatureC,
  description,
  humidity,
  windKph,
  weatherCode,
  loading,
  error,
  onRefresh,
  compact = false,
}: {
  locationLabel: string;
  temperatureC?: number;
  description?: string;
  humidity?: number;
  windKph?: number;
  weatherCode?: number;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  /** Home demoted strip: icon + temp + condition + AQI */
  compact?: boolean;
}) {
  const scene = getClimateScene(weatherCode, description, windKph);
  const condition = resolveCondition(weatherCode, description);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const iconFloat = useRef(new Animated.Value(0)).current;
  const iconSpin = useRef(new Animated.Value(0)).current;
  const ripple = useRef(new Animated.Value(0)).current;
  const sceneFade = useRef(new Animated.Value(1)).current;

  const [displayTemp, setDisplayTemp] = useState(0);
  const [sceneKey, setSceneKey] = useState(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 360,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 360,
        useNativeDriver: true,
      }),
    ]).start();

    if (compact) return;

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(iconFloat, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(iconFloat, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ]),
    );
    floatLoop.start();

    const spinLoop = Animated.loop(
      Animated.timing(iconSpin, {
        toValue: 1,
        duration: scene.effects.sun ? 30000 : 12000,
        useNativeDriver: true,
      }),
    );
    if (scene.effects.sun || scene.effects.moon) {
      spinLoop.start();
    }

    return () => {
      floatLoop.stop();
      spinLoop.stop();
    };
  }, [compact, fadeAnim, iconFloat, iconSpin, scene.effects.moon, scene.effects.sun, slideAnim]);

  useEffect(() => {
    if (compact) return;
    sceneFade.setValue(0);
    Animated.timing(sceneFade, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
    setSceneKey((k) => k + 1);
  }, [compact, scene.state, sceneFade]);

  useEffect(() => {
    if (temperatureC == null) return;
    let start = displayTemp || 0;
    const end = temperatureC;
    const duration = 650;
    const stepTime = 28;
    const steps = Math.max(1, duration / stepTime);
    const increment = (end - start) / steps;
    const timer = setInterval(() => {
      start += increment;
      if ((increment >= 0 && start >= end) || (increment < 0 && start <= end)) {
        setDisplayTemp(end);
        clearInterval(timer);
      } else {
        setDisplayTemp(Math.round(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temperatureC]);

  const handleRefresh = () => {
    rotateAnim.setValue(0);
    ripple.setValue(0);
    sceneFade.setValue(0.35);
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(ripple, {
        toValue: 1,
        duration: 480,
        useNativeDriver: true,
      }),
      Animated.timing(sceneFade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRefresh?.();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const iconRotate = iconSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', scene.effects.sun ? '360deg' : '0deg'],
  });

  const statusLabel =
    description ||
    scene.label ||
    condition.charAt(0).toUpperCase() + condition.slice(1);

  if (compact) {
    return (
      <Animated.View
        style={[
          styles.weatherStrip,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <LinearGradient
          colors={scene.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : error ? (
          <Text style={styles.weatherStripError} numberOfLines={1}>
            {error}
          </Text>
        ) : (
          <View style={styles.weatherStripRow}>
            <Ionicons name={scene.icon as any} size={22} color={scene.accent} />
            <Text style={styles.weatherStripTemp}>
              {temperatureC != null ? `${displayTemp}°` : '--°'}
            </Text>
            <Text style={styles.weatherStripCond} numberOfLines={1}>
              {statusLabel}
            </Text>
            <View style={styles.weatherStripAqi}>
              <Ionicons name="leaf-outline" size={12} color="#fff" />
              <Text style={styles.weatherStripAqiText}>AQI 42</Text>
            </View>
            {onRefresh ? (
              <Pressable onPress={handleRefresh} hitSlop={8}>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Ionicons name="refresh" size={16} color="rgba(255,255,255,0.9)" />
                </Animated.View>
              </Pressable>
            ) : null}
          </View>
        )}
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.weatherBox,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: sceneFade }]}>
        <WeatherClimateScene key={`${scene.state}-${sceneKey}`} scene={scene} />
      </Animated.View>

      <View style={styles.weatherGlass}>
        <View style={styles.weatherTop}>
          <View style={styles.weatherTopLeft}>
            <Text style={styles.weatherEyebrow}>CURRENT CONDITIONS</Text>
            <View style={styles.locationRow}>
              <MapPin size={14} color="rgba(255,255,255,0.75)" />
              <Text style={styles.weatherLocation} numberOfLines={1}>
                {locationLabel || 'Detecting location…'}
              </Text>
            </View>
          </View>
          {onRefresh ? (
            <Pressable onPress={handleRefresh} style={styles.refreshChip}>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.refreshRipple,
                  {
                    opacity: ripple.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.35, 0],
                    }),
                    transform: [
                      {
                        scale: ripple.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.6],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Ionicons name="refresh" size={16} color="#FFFFFF" />
              </Animated.View>
            </Pressable>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.weatherLoading}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.weatherHint}>Fetching live conditions…</Text>
          </View>
        ) : error ? (
          <Text style={styles.weatherError}>{error}</Text>
        ) : (
          <View style={styles.weatherBodyContainer}>
            <View style={styles.weatherMain}>
              <Animated.View
                style={[
                  styles.weatherIconWrap,
                  {
                    shadowColor: scene.accent,
                    backgroundColor: 'rgba(255,255,255,0.14)',
                    transform: [
                      {
                        translateY: iconFloat.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -4],
                        }),
                      },
                      { rotate: iconRotate },
                    ],
                  },
                ]}
              >
                <Ionicons name={scene.icon as any} size={40} color={scene.accent} />
              </Animated.View>
              <Text
                style={[
                  styles.weatherTemp,
                  {
                    textShadowColor: scene.tempGlow,
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 12,
                  },
                ]}
              >
                {temperatureC != null ? `${displayTemp}°` : '--°'}
              </Text>
            </View>

            <View style={[styles.weatherStatusCapsule, styles.weatherBadgeGlass]}>
              <Ionicons name={scene.icon as any} size={14} color={scene.accent} />
              <Text style={styles.weatherDesc}>{statusLabel}</Text>
            </View>

            <View style={styles.metricRow}>
              <MetricPill
                icon="water-outline"
                label="Humidity"
                value={`${humidity ?? '--'}%`}
                tint={scene.metricTint}
              />
              <MetricPill
                icon="navigate-outline"
                label="Wind"
                value={`${windKph ?? '--'} km/h`}
                tint={scene.metricTint}
              />
              <MetricPill
                icon="leaf-outline"
                label="AQI"
                value="42"
                tint={scene.metricTint}
              />
              <MetricPill
                icon="sunny-outline"
                label="UV"
                value="5"
                tint={scene.metricTint}
              />
              <MetricPill
                icon="rainy-outline"
                label="Rain"
                value="15%"
                tint={scene.metricTint}
              />
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

function MetricPill({
  icon,
  label,
  value,
  tint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  tint?: string;
}) {
  return (
    <View style={[styles.metricPill, tint ? { backgroundColor: tint } : null]}>
      <Ionicons name={icon} size={13} color="rgba(255,255,255,0.9)" />
      <View>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
    </View>
  );
}

export function SourceDestinationCard({
  source,
  destinationQuery,
  onChangeDestination,
  onSubmitDestination,
}: {
  source: string;
  destinationQuery: string;
  onChangeDestination: (value: string) => void;
  onSubmitDestination: () => void;
}) {
  return (
    <View style={styles.routeCard}>
      <Text style={styles.sectionLabel}>Your route</Text>
      <View style={styles.routeRow}>
        <View style={styles.routeDotSource} />
        <View style={styles.routeTextWrap}>
          <Text style={styles.routeLabel}>Source</Text>
          <Text style={styles.routeValue} numberOfLines={2}>
            {source || 'Current location'}
          </Text>
        </View>
      </View>
      <View style={styles.routeConnector} />
      <View style={styles.routeRow}>
        <View style={styles.routeDotDest} />
        <View style={styles.routeTextWrap}>
          <Text style={styles.routeLabel}>Destination</Text>
          <View style={styles.destinationSearch}>
            <Ionicons name="search" size={18} color={HOME.muted} />
            <TextInput
              value={destinationQuery}
              onChangeText={onChangeDestination}
              onSubmitEditing={onSubmitDestination}
              placeholder="Search destination…"
              placeholderTextColor={CLOUD.muted}
              style={styles.destinationInput}
              returnKeyType="search"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

export function AiRecommendationCard({
  title,
  matchPercent,
  weatherLabel,
  budgetLabel,
  durationLabel,
  imageUrl,
  imageLoading,
  onExplore,
}: {
  title: string;
  matchPercent: number;
  weatherLabel: string;
  budgetLabel: string;
  durationLabel: string;
  imageUrl?: string | null;
  imageLoading?: boolean;
  onExplore: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(imageUrl) && !failed;

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  return (
    <View style={styles.aiCard}>
      <View style={styles.aiImage}>
        {showPhoto ? (
          <Image
            source={{ uri: imageUrl! }}
            style={styles.aiImagePhoto}
            resizeMode="cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <View style={styles.aiImageFallback}>
            {imageLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Ionicons name="image-outline" size={28} color="rgba(255,255,255,0.55)" />
            )}
            <Text style={styles.aiImageHint}>
              {imageLoading ? 'Loading destination photo…' : 'Destination lens'}
            </Text>
          </View>
        )}
        <View style={styles.aiImageOverlay}>
          <Text style={styles.aiImageBadge}>Destination lens</Text>
        </View>
      </View>
      <Text style={styles.aiTitle}>{title}</Text>
      <Text style={styles.aiMatch}>{matchPercent}% · Highly Recommended</Text>
      <View style={styles.aiMetaRow}>
        <Text style={styles.aiMeta}>{weatherLabel}</Text>
        <Text style={styles.aiMeta}>{budgetLabel}</Text>
        <Text style={styles.aiMeta}>{durationLabel}</Text>
      </View>
      <Pressable onPress={onExplore} style={styles.aiCta}>
        <Text style={styles.aiCtaText}>Explore Journey</Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const CATEGORIES = [
  { key: 'beach', label: 'Beach', icon: 'sunny-outline' as const },
  { key: 'mountain', label: 'Mountain', icon: 'trail-sign-outline' as const },
  { key: 'food', label: 'Food', icon: 'restaurant-outline' as const },
  { key: 'historical', label: 'Historical', icon: 'business-outline' as const },
  { key: 'nature', label: 'Nature', icon: 'leaf-outline' as const },
];

export function QuickCategories({ onSelect }: { onSelect: (key: string) => void }) {
  return (
    <View>
      <Text style={styles.sectionLabel}>Quick categories</Text>
      <View style={styles.categoryRow}>
        {CATEGORIES.map((item) => (
          <Pressable key={item.key} style={styles.categoryItem} onPress={() => onSelect(item.key)}>
            <View style={styles.categoryIcon}>
              <Ionicons name={item.icon} size={18} color={CLOUD.primary} />
            </View>
            <Text style={styles.categoryLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function ExploreNearbyRow({
  items,
  loading,
  onPress,
  selectedCategory,
  onSelectCategory,
}: {
  items: Array<{
    id: string;
    title: string;
    subtitle: string;
    categoryLabel?: string;
    imageUrl?: string | null;
    imageLoading?: boolean;
  }>;
  loading?: boolean;
  onPress: (id: string) => void;
  selectedCategory: string;
  onSelectCategory: (key: string) => void;
}) {
  return (
    <View style={styles.nearbySection}>
      <Text style={styles.exploreTitle}>Explore</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {EXPLORE_CHIPS.map((chip) => {
          const active = chip.key === selectedCategory;
          return (
            <Pressable
              key={chip.key}
              style={[styles.exploreChip, active && styles.exploreChipActive]}
              onPress={() => onSelectCategory(chip.key)}
            >
              <Ionicons
                name={chip.icon}
                size={16}
                color={active ? '#FFFFFF' : chip.accent}
              />
              <Text style={[styles.exploreChipText, active && styles.exploreChipTextActive]}>
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hRow}
        >
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.nearbyCard}>
              <View style={[styles.nearbyThumb, styles.nearbyThumbPlaceholder]}>
                <ActivityIndicator color={CLOUD.primary} />
              </View>
              <View style={styles.nearbySkeletonLine} />
              <View style={[styles.nearbySkeletonLine, styles.nearbySkeletonShort]} />
            </View>
          ))}
        </ScrollView>
      ) : items.length === 0 ? (
        <Text style={styles.emptyText}>
          No places in this category nearby. Try another chip or pull to refresh.
        </Text>
      ) : (
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hRow}
        >
          {items.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [styles.nearbyCard, pressed && { opacity: 0.88 }]}
              onPress={() => onPress(item.id)}
            >
              <View style={styles.nearbyThumb}>
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.nearbyPhoto}
                    resizeMode="cover"
                  />
                ) : item.imageLoading ? (
                  <View style={styles.nearbyThumbFallback}>
                    <ActivityIndicator color={CLOUD.primary} />
                  </View>
                ) : (
                  <View style={styles.nearbyThumbFallback}>
                    <Ionicons name="image-outline" size={28} color={CLOUD.muted} />
                  </View>
                )}
              </View>
              <Text style={styles.nearbyTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.nearbySub} numberOfLines={1}>
                {item.categoryLabel || item.subtitle}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

export function RecentSearchesRow({
  items,
  onPress,
}: {
  items: Array<{
    id: string;
    title: string;
    subtitle?: string;
    imageUrl?: string | null;
    imageLoading?: boolean;
  }>;
  onPress: (id: string) => void;
}) {
  return (
    <View>
      <Text style={styles.sectionLabel}>Recent searches</Text>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>Your recent searches will appear here.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
          {items.map((item) => (
            <Pressable key={item.id} style={styles.nearbyCard} onPress={() => onPress(item.id)}>
              <View style={styles.nearbyThumb}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.nearbyPhoto} resizeMode="cover" />
                ) : item.imageLoading ? (
                  <View style={styles.nearbyThumbFallback}>
                    <ActivityIndicator color={CLOUD.primary} />
                  </View>
                ) : (
                  <View style={styles.nearbyThumbFallback}>
                    <Ionicons name="time-outline" size={22} color={CLOUD.muted} />
                  </View>
                )}
              </View>
              <Text style={styles.nearbyTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.nearbySub} numberOfLines={1}>
                {item.subtitle || 'Continue'}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

export function SuggestionList({
  items,
  onPick,
}: {
  items: PlaceResultLike[];
  onPick: (place: PlaceResultLike) => void;
}) {
  if (items.length === 0) return null;
  return (
    <View style={styles.suggestBox}>
      {items.map((item) => (
        <Pressable
          key={item.placeKey}
          style={({ pressed }) => [styles.suggestItem, pressed && { opacity: 0.7 }]}
          onPress={() => onPick(item)}
        >
          <View style={styles.suggestRow}>
            <Ionicons name="location-outline" size={16} color={CLOUD.primary} />
            <View style={styles.suggestTextWrap}>
              <Text style={styles.suggestTitle}>{item.placeName}</Text>
              <Text style={styles.suggestSub} numberOfLines={1}>
                {item.address}
              </Text>
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

type PlaceResultLike = {
  placeKey: string;
  placeName: string;
  address: string;
  latitude: number;
  longitude: number;
  query?: string;
};

/* ── Styles ────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: CLOUD.bg },

  /* ── Header ─────────────────────────────────────────────── */
  header: {
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: { flex: 1, paddingRight: 12 },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogo: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
  logoGlow: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: CLOUD.primary,
    opacity: 0.12,
  },
  brandTextWrap: {
    overflow: 'hidden',
    position: 'relative',
  },
  brandTextUrban: {
    fontFamily: CLOUD.fonts.heading,
    fontSize: 22,
    fontWeight: '800',
    color: CLOUD.ink,
    letterSpacing: -0.3,
  },
  brandTextLens: {
    color: CLOUD.primary,
  },
  lensShimmer: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    width: 18,
    left: 52,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  headerLocBlock: {
    marginTop: 10,
  },
  headerLocLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locPulseWrap: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locPulseRing: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CLOUD.primary,
  },
  locPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CLOUD.primary,
  },
  headerLocEyebrow: {
    fontFamily: CLOUD.fonts.body,
    color: CLOUD.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  headerLoc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  headerLocText: {
    fontFamily: CLOUD.fonts.heading,
    color: CLOUD.ink,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  avatarDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CLOUD.success,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  ambientBlob: {
    position: 'absolute',
  },

  /* ── Weather Card ───────────────────────────────────────── */
  weatherStrip: {
    borderRadius: 14,
    overflow: 'hidden',
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  weatherStripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weatherStripTemp: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  weatherStripCond: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  weatherStripAqi: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  weatherStripAqiText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  weatherStripError: {
    color: '#fff',
    fontSize: 13,
  },
  weatherBox: {
    borderRadius: CLOUD.radii.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 5,
  },
  weatherBg: {
    width: '100%',
  },
  weatherBgImage: {
    borderRadius: CLOUD.radii.card,
  },
  weatherGlass: {
    padding: CLOUD.cardPad,
    overflow: 'hidden',
  },
  weatherTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  weatherTopLeft: { flex: 1 },
  weatherEyebrow: {
    fontFamily: CLOUD.fonts.heading,
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  weatherLocationIcon: {
    fontSize: 14,
  },
  weatherLocation: {
    fontFamily: CLOUD.fonts.body,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  refreshChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
  },
  refreshRipple: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  weatherLoading: {
    marginTop: CLOUD.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weatherBodyContainer: {
    marginTop: 16,
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },
  weatherIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  weatherTemp: {
    fontFamily: CLOUD.fonts.number,
    color: '#FFFFFF',
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: -1.5,
  },
  weatherStatusCapsule: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weatherBadgeGlass: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 2,
  },
  weatherDesc: {
    fontFamily: CLOUD.fonts.heading,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  weatherHint: {
    fontFamily: CLOUD.fonts.body,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontWeight: '400',
    marginTop: 4,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    minWidth: '30%' as `${number}%`,
    flexGrow: 1,
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    fontWeight: '600',
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  weatherDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 16,
  },
  weatherStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weatherStatusText: {
    fontFamily: CLOUD.fonts.body,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '500',
  },
  weatherError: {
    color: '#FECACA',
    fontSize: 14,
    marginTop: 14,
  },

  /* ── Route / Search ─────────────────────────────────────── */
  searchBlock: { marginBottom: HOME.gap },
  searchLabel: {
    fontFamily: CLOUD.fonts.heading,
    color: HOME.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: CLOUD.spacing.sm,
  },
  searchBar: {
    height: CLOUD.searchH,
    borderRadius: CLOUD.radii.search,
    backgroundColor: HOME.cardSolid,
    borderWidth: 1,
    borderColor: HOME.line,
    paddingHorizontal: CLOUD.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: CLOUD.fonts.body,
    color: CLOUD.ink,
    fontSize: 15,
    fontWeight: '500',
  },
  routeCard: {
    backgroundColor: HOME.card,
    borderRadius: CLOUD.radii.card,
    padding: CLOUD.cardPad,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: HOME.line,
    ...CLOUD.shadows.card,
  },
  sectionLabel: {
    fontFamily: CLOUD.fonts.heading,
    color: CLOUD.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  routeRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  routeDotSource: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CLOUD.primary,
    marginTop: 6,
  },
  routeDotDest: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CLOUD.warning,
    marginTop: 6,
  },
  routeConnector: {
    width: 2,
    height: 14,
    backgroundColor: HOME.line,
    marginLeft: 4,
    marginVertical: 4,
  },
  routeTextWrap: { flex: 1 },
  routeLabel: {
    fontFamily: CLOUD.fonts.body,
    color: HOME.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  routeValue: {
    fontFamily: CLOUD.fonts.body,
    color: CLOUD.ink,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  destinationSearch: {
    marginTop: 6,
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: HOME.line,
    backgroundColor: CLOUD.soft,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  destinationInput: {
    flex: 1,
    fontFamily: CLOUD.fonts.body,
    color: CLOUD.ink,
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 10,
  },

  /* ── AI Recommendation Card ─────────────────────────────── */
  aiCard: {
    backgroundColor: HOME.card,
    borderRadius: CLOUD.radii.card,
    padding: CLOUD.cardPad,
    marginBottom: HOME.gap,
    borderWidth: 1,
    borderColor: CLOUD.border,
    ...CLOUD.shadows.card,
  },
  aiImage: {
    height: 160,
    borderRadius: CLOUD.radii.search,
    backgroundColor: CLOUD.soft,
    overflow: 'hidden',
    marginBottom: 14,
  },
  aiImagePhoto: {
    width: '100%',
    height: '100%',
  },
  aiImageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CLOUD.soft,
  },
  aiImageHint: {
    fontFamily: CLOUD.fonts.body,
    color: CLOUD.muted,
    marginTop: 6,
    fontSize: 12,
  },
  aiImageOverlay: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    backgroundColor: 'rgba(37,99,235,0.82)',
    borderRadius: CLOUD.radii.fab,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  aiImageBadge: {
    fontFamily: CLOUD.fonts.heading,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  aiTitle: {
    fontFamily: CLOUD.fonts.heading,
    color: CLOUD.ink,
    fontSize: 22,
    fontWeight: '700',
  },
  aiMatch: {
    fontFamily: CLOUD.fonts.number,
    color: CLOUD.primary,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 6,
  },
  aiMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  aiMeta: {
    fontFamily: CLOUD.fonts.body,
    color: CLOUD.body,
    fontSize: 13,
    backgroundColor: CLOUD.lightBlue,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: CLOUD.radii.fab,
    overflow: 'hidden',
  },
  aiCta: {
    marginTop: CLOUD.spacing.md,
    minHeight: CLOUD.buttons.height,
    backgroundColor: CLOUD.primary,
    borderRadius: CLOUD.radii.button,
    paddingVertical: 14,
    paddingHorizontal: CLOUD.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  aiCtaText: {
    fontFamily: CLOUD.fonts.heading,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  /* ── Quick Categories ───────────────────────────────────── */
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: HOME.gap,
  },
  categoryItem: { alignItems: 'center', width: '18%' },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: CLOUD.radii.button,
    backgroundColor: CLOUD.soft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: HOME.line,
  },
  categoryLabel: {
    fontFamily: CLOUD.fonts.body,
    color: HOME.muted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },

  /* ── Explore Nearby ─────────────────────────────────────── */
  hRow: {
    gap: 14,
    paddingRight: CLOUD.spacing.sm,
    paddingBottom: 4,
  },
  nearbySection: {
    marginBottom: HOME.gap,
  },
  exploreTitle: {
    fontFamily: CLOUD.fonts.heading,
    color: CLOUD.ink,
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 14,
  },
  chipRow: {
    gap: 10,
    paddingBottom: CLOUD.spacing.md,
    paddingRight: CLOUD.spacing.sm,
  },
  exploreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: CLOUD.spacing.md,
    paddingVertical: 10,
    borderRadius: CLOUD.radii.fab,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: CLOUD.border,
  },
  exploreChipActive: {
    backgroundColor: CLOUD.primary,
    borderColor: CLOUD.primary,
  },
  exploreChipText: {
    fontFamily: CLOUD.fonts.body,
    color: CLOUD.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  exploreChipTextActive: {
    color: '#FFFFFF',
  },
  nearbyCard: {
    width: 200,
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    borderWidth: 0,
  },
  nearbyThumb: {
    width: '100%',
    height: 150,
    borderRadius: CLOUD.radii.search,
    backgroundColor: CLOUD.soft,
    marginBottom: 10,
    overflow: 'hidden',
  },
  nearbyThumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearbyThumbFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CLOUD.soft,
  },
  nearbyPhoto: {
    width: '100%',
    height: '100%',
  },
  nearbySkeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: CLOUD.border,
    marginBottom: CLOUD.spacing.sm,
  },
  nearbySkeletonShort: {
    width: '55%',
    marginBottom: 2,
  },
  nearbyTitle: {
    fontFamily: CLOUD.fonts.heading,
    color: CLOUD.ink,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    minHeight: 20,
  },
  nearbySub: {
    fontFamily: CLOUD.fonts.body,
    color: CLOUD.muted,
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  emptyText: {
    fontFamily: CLOUD.fonts.body,
    color: CLOUD.muted,
    fontSize: 14,
    marginBottom: HOME.gap,
  },

  /* ── Timeline ───────────────────────────────────────────── */
  timeline: { marginBottom: 12 },
  timelineRow: { flexDirection: 'row', gap: 12, minHeight: 64 },
  timelineRail: { width: 14, alignItems: 'center' },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CLOUD.primary,
    marginTop: CLOUD.spacing.md,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: HOME.line,
    marginTop: 4,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: HOME.card,
    borderRadius: CLOUD.radii.button,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: HOME.line,
    ...CLOUD.shadows.card,
  },
  timelineText: { flex: 1 },
  timelineTitle: {
    fontFamily: CLOUD.fonts.heading,
    color: CLOUD.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  timelineSub: {
    fontFamily: CLOUD.fonts.body,
    color: HOME.muted,
    fontSize: 12,
    marginTop: 2,
  },
  continueBtn: {
    backgroundColor: CLOUD.primary,
    borderRadius: CLOUD.radii.fab,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  continueText: {
    fontFamily: CLOUD.fonts.heading,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  /* ── Suggestion List ────────────────────────────────────── */
  suggestBox: {
    backgroundColor: HOME.card,
    borderRadius: CLOUD.radii.button,
    marginTop: CLOUD.spacing.sm,
    marginBottom: HOME.gap,
    borderWidth: 1,
    borderColor: HOME.line,
    overflow: 'hidden',
    ...CLOUD.shadows.card,
  },
  suggestItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: HOME.line,
  },
  suggestRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  suggestTextWrap: { flex: 1 },
  suggestTitle: {
    fontFamily: CLOUD.fonts.heading,
    color: CLOUD.ink,
    fontWeight: '700',
    fontSize: 14,
  },
  suggestSub: {
    fontFamily: CLOUD.fonts.body,
    color: HOME.muted,
    fontSize: 12,
    marginTop: 2,
  },
});
