import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Image, Share } from 'react-native';
import { useLocalSearchParams, useRouter, router, Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAiFlowStore } from '@/store/aiFlowStore';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
  Easing,
  withRepeat,
  useAnimatedScrollHandler,
  useReducedMotion,
  FadeInUp,
  FadeInDown,
  FadeOutDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Fuel } from 'lucide-react-native';
import { CLOUD } from '@/constants/cloudTheme';
import { getDestinationIntelligence } from '@/mocks/destinationIntelligence';
import { estimateJourney, formatTravelTime, journeyTotal, type JourneyMode } from '@/utils/travelEstimate';
import { mockDestinations } from '@/mocks/destinations';
import {
  fetchDestinationNearbyPlaces,
  type NearbyAttraction,
  type NearbyService,
} from '@/services/destinationNearbyPlaces';
import { useDashboardStore } from '@/store/dashboardStore';
import { useProfilePreferencesStore } from '@/store/profilePreferencesStore';
import Svg, { Circle } from 'react-native-svg';
import { MatchRing } from '../recommendations';
import { BottomTabBar } from '@/components/BottomTabBar';
import { IdealPlanSheet } from '@/components/intelligence/IdealPlanSheet';
import { LiveDestinationPulse } from '@/components/intelligence/LiveDestinationPulse';
import { WhatChangedCard } from '@/components/intelligence/WhatChangedCard';
import { resolveCondition, isDayTime, getWeatherIcon } from '@/constants/weatherTheme';
import { useIntelligenceStore } from '@/store/intelligenceStore';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function ScalePressable({ children, onPress, style }: { children: React.ReactNode, onPress?: () => void, style?: any }) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 18, stiffness: 320 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 14, stiffness: 220 }); }}
      onPress={onPress}
    >
      <Animated.View style={[style, anim]}>{children}</Animated.View>
    </Pressable>
  );
}

// --------------------------------------------------
// SECTION 2: Hero Destination Card
// --------------------------------------------------
function HeroDestinationCard({ image, name, distanceKm, travelTimeMin, matchScore }: any) {
  const scale = useSharedValue(1);
  const drift = useSharedValue(1);
  const opacity = useSharedValue(0);
  const [imageFailed, setImageFailed] = useState(!image);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(1, { duration: 380 });
    drift.value = withRepeat(
      withTiming(1.06, { duration: 8000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  const animatedHeroStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * drift.value }],
    opacity: opacity.value,
  }));

  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 400; 
    const stepTime = Math.max(10, Math.floor(duration / Math.max(1, matchScore)));
    let timer = setInterval(() => {
      start += 1;
      setDisplayScore(start);
      if (start >= matchScore) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [matchScore]);

  return (
    <View style={styles.heroContainer}>
      {imageFailed ? (
        <View style={[styles.heroImage, styles.heroFallback]}>
          <Ionicons name="image-outline" size={40} color={CLOUD.muted} />
        </View>
      ) : (
        <Animated.Image
          source={{ uri: image }}
          style={[styles.heroImage, animatedHeroStyle]}
          onError={() => setImageFailed(true)}
        />
      )}
      <View style={styles.heroGradient} />
      
      <View style={styles.heroContent}>
        <Animated.View style={[styles.badgeWrap, { opacity: opacity }]}>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{displayScore}%</Text>
          </View>
        </Animated.View>
        
        <Animated.View style={[styles.heroTextWrap, { opacity: opacity }]}>
          <Text style={styles.heroTitle}>{name}</Text>
          <Text style={styles.heroSubtitle}>{distanceKm} km · {Math.floor(travelTimeMin/60)} hr {travelTimeMin%60} min</Text>
        </Animated.View>
      </View>
    </View>
  );
}

// --------------------------------------------------
// SECTION 3: AI Intelligence Summary
// --------------------------------------------------
function AIInsightCard({ text }: { text: string }) {
  const [revealedText, setRevealedText] = useState('');
  
  useEffect(() => {
    let currentString = '';
    const words = text.split(' ');
    let currentWordIndex = 0;
    
    setRevealedText('');
    const interval = setInterval(() => {
      const chunkSize = Math.floor(Math.random() * 2) + 2; 
      const nextWords = words.slice(currentWordIndex, currentWordIndex + chunkSize);
      
      if (nextWords.length > 0) {
        currentString += (currentString ? ' ' : '') + nextWords.join(' ');
        setRevealedText(currentString);
        currentWordIndex += chunkSize;
      } else {
        clearInterval(interval);
      }
    }, 600 / Math.max(1, (words.length / 2))); 

    return () => clearInterval(interval);
  }, [text]);

  return (
    <View style={styles.card}>
      <View style={[styles.aiHeader, { justifyContent: 'space-between' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="sparkles" size={16} color={CLOUD.aiAccent} />
          <Text style={styles.aiInsightLabel}>AI Insight</Text>
        </View>
        <Text style={{ fontSize: 12, color: CLOUD.muted }}>Updated 2 mins ago</Text>
      </View>
      <Text style={styles.aiInsightText}>{revealedText}</Text>
    </View>
  );
}

// --------------------------------------------------
// SECTION 4: Destination Readiness Score
// --------------------------------------------------
function ReadinessScore({ score, band }: { score: number; band?: string }) {
  const reduceMotion = !!useReducedMotion();
  const progress = useSharedValue(0);
  const breathe = useSharedValue(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    progress.value = withTiming(score / 100, { duration: 1100, easing: Easing.out(Easing.cubic) });
    let start = 0;
    const duration = 1100;
    const stepTime = Math.max(14, Math.floor(duration / Math.max(1, score)));
    const timer = setInterval(() => {
      start += 1;
      setDisplayScore(start);
      if (start >= score) clearInterval(timer);
    }, stepTime);

    if (reduceMotion) {
      breathe.value = 0;
    } else {
      breathe.value = withRepeat(
        withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
    }

    return () => clearInterval(timer);
  }, [breathe, progress, reduceMotion, score]);

  const size = 176;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2 - 4;
  const circumference = radius * 2 * Math.PI;
  const orb = 124;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - progress.value * circumference,
  }));

  const orbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(breathe.value, [0, 1], [0, -4], Extrapolation.CLAMP) },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(breathe.value, [0, 1], [0.22, 0.4], Extrapolation.CLAMP),
  }));

  return (
    <View style={styles.readinessContainer}>
      <Text style={styles.sectionTitle}>Destination Readiness</Text>
      <Animated.View style={[styles.readinessStage, orbStyle]}>
        <Animated.View style={[styles.readinessGlow, glowStyle]} />
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={CLOUD.border}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={CLOUD.primary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={[styles.readinessOrbWrap, { width: orb, height: orb, borderRadius: orb / 2 }]}>
          <LinearGradient
            colors={['#FFFFFF', CLOUD.lightBlue, '#DBEAFE']}
            start={{ x: 0.2, y: 0.05 }}
            end={{ x: 0.85, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: orb / 2 }]}
          />
          <View style={styles.readinessShine} />
          <Text style={styles.readinessScoreText}>{displayScore}</Text>
          <Text style={styles.readinessCaption}>{band || 'Ready'}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

// --------------------------------------------------
// SECTION 5: Travel Conditions
// --------------------------------------------------
function TravelConditions({
  dist,
  plan,
  mode,
  onMode,
}: {
  dist: number;
  plan: ReturnType<typeof estimateJourney>;
  mode: JourneyMode;
  onMode: (m: JourneyMode) => void;
}) {
  const quote = plan.modes.find((m) => m.mode === mode) || plan.modes[0];
  const total = journeyTotal(plan, mode);
  const rec = plan.modes.find((m) => m.mode === plan.recommended);

  const items = quote.available
    ? [
        { label: 'Distance', val: `${dist} km` },
        { label: 'Travel Time', val: formatTravelTime(quote.durationMin) },
        ...quote.cards.map((c) => ({ label: c.label, val: c.value })),
      ]
    : [
        { label: 'Distance', val: `${dist} km` },
        { label: 'This mode', val: 'Not practical' },
      ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Travel Conditions</Text>
      <Text style={{ color: CLOUD.muted, fontSize: 13, fontWeight: '600', marginBottom: 12 }}>
        Best from your location: {rec?.label || 'Car'}
        {rec?.available ? ` · ${formatTravelTime(rec.durationMin)} · ₹${rec.transportCost}` : ''}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {plan.modes.map((m) => {
          const on = m.mode === mode;
          return (
            <Pressable
              key={m.mode}
              onPress={() => onMode(m.mode)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1.5,
                borderColor: on ? CLOUD.primary : CLOUD.border,
                backgroundColor: on ? CLOUD.lightBlue : CLOUD.card,
                opacity: m.available ? 1 : 0.55,
              }}
            >
              <Text style={{ fontWeight: '800', fontSize: 12, color: on ? CLOUD.primary : CLOUD.body }}>
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {!quote.available && quote.reason ? (
        <View
          style={{
            backgroundColor: CLOUD.soft,
            borderRadius: 14,
            padding: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: CLOUD.border,
          }}
        >
          <Text style={{ color: CLOUD.body, fontSize: 13, fontWeight: '600', lineHeight: 19 }}>
            {quote.reason}
          </Text>
        </View>
      ) : null}
      <View style={styles.grid}>
        {items.map((it, i) => (
          <Animated.View key={`${it.label}-${i}`} style={styles.gridItemHalf} entering={FadeInUp.delay(i * 40)}>
            <View style={styles.compactCard}>
              <Text style={styles.ccLabel}>{it.label}</Text>
              <Text style={styles.ccValue}>{it.val}</Text>
            </View>
          </Animated.View>
        ))}
        <Animated.View style={styles.gridItemFull} entering={FadeInUp.delay(items.length * 40)}>
          <View style={[styles.compactCard, styles.promotedCard]}>
            <Text style={styles.promotedLabel}>Total estimate (1 night)</Text>
            <Text style={styles.promotedValue}>₹{total}</Text>
          </View>
        </Animated.View>
      </View>
      <Text style={{ color: CLOUD.muted, fontSize: 12, fontWeight: '600', marginTop: 10, lineHeight: 17 }}>
        Includes {quote.available ? `${quote.label.toLowerCase()} + ` : ''}stay ₹{plan.stay} · food ₹{plan.food} · local ₹{plan.local}. Per person, one way.
      </Text>
    </View>
  );
}

// --------------------------------------------------
// SECTION 6: Environment Overview
// --------------------------------------------------
const getStatusColor = (status: string) => {
  const lower = status.toLowerCase();
  if (lower.includes('excellent') || lower.includes('good') || lower.includes('low')) return CLOUD.success;
  if (lower.includes('moderate') || lower.includes('limited')) return CLOUD.warning;
  if (lower.includes('high') || lower.includes('poor') || lower.includes('bad')) return CLOUD.danger;
  return CLOUD.primary;
};

function EnvironmentOverview({ env }: any) {
  const condition = resolveCondition(null, env.weather);
  const isDay = isDayTime();
  const weatherIconName = getWeatherIcon(condition, isDay);

  const items = [
    { icon: `${weatherIconName}-outline`, label: 'Weather', val: env.weather, status: 'Good' },
    { icon: 'thermometer-outline', label: 'Temp', val: `${env.tempC}°C`, status: 'Good' },
    { icon: 'leaf-outline', label: 'AQI', val: env.aqi.toString(), status: env.aqiStatus },
    { icon: 'sunny-outline', label: 'UV', val: env.uv.toString(), status: env.uvStatus },
    { icon: 'rainy-outline', label: 'Rain', val: `${env.rainProbability}%`, status: env.rainProbability > 50 ? 'High' : 'Low' },
    { icon: 'git-network-outline', label: 'Wind', val: env.windSpeed, status: 'Good' },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Environment Overview</Text>
      <View style={styles.grid}>
        {items.map((it, i) => {
          const color = getStatusColor(it.status);
          return (
            <Animated.View key={i} style={styles.gridItemHalf} entering={FadeInUp.delay(i * 50)}>
              <View style={styles.compactCard}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4}}>
                  <Ionicons name={it.icon as any} size={16} color={color} />
                  <Text style={styles.ccLabel}>{it.label}</Text>
                </View>
                <Text style={styles.ccValue}>{it.val}</Text>
              </View>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

// --------------------------------------------------
// SECTION 7: Budget Estimation
// --------------------------------------------------
function BudgetEstimation({
  budget,
  transportCost,
  transportLabel,
}: {
  budget: any;
  transportCost: number;
  transportLabel: string;
}) {
  const preferences = useProfilePreferencesStore((s) => s.preferences);
  const preferredStyle = preferences.travelStyle;
  const initialType =
    preferredStyle === 'Solo' ||
    preferredStyle === 'Friends' ||
    preferredStyle === 'Family' ||
    preferredStyle === 'Group'
      ? preferredStyle
      : 'Friends';
  const [tripType, setTripType] = useState<'Solo' | 'Friends' | 'Family' | 'Group'>(initialType);
  const [people, setPeople] = useState(initialType === 'Solo' ? 1 : 2);
  const [days, setDays] = useState(3);

  const isShared = (label: string) => label === 'Transport' || label === 'Parking';
  const isPerDay = (label: string) => label === 'Accommodation' || label === 'Food';

  const rows = [
    { label: 'Transport', base: transportCost, icon: 'navigate-outline' },
    { label: 'Food', base: Math.max(budget.food, 700), icon: 'restaurant-outline' },
    { label: 'Entry Fees', base: Math.max(budget.entryFees, 250), icon: 'ticket-outline' },
    { label: 'Parking', base: transportLabel === 'Car' ? Math.max(budget.parking, 150) : 0, icon: 'car-sport-outline' },
    { label: 'Accommodation', base: Math.max(budget.accommodation, 1800), icon: 'bed-outline' },
  ].map(row => {
    let multiplier = 1;
    if (!isShared(row.label)) multiplier *= people;
    if (isPerDay(row.label)) multiplier *= days;
    return { ...row, val: row.base * multiplier };
  });

  const total = rows.reduce((acc, row) => acc + row.val, 0);
  const perPersonPerDay = total / (people * days);
  
  let pillColor: string = CLOUD.success;
  let tier = 'Budget Friendly';
  if (perPersonPerDay > 3000) { pillColor = CLOUD.primary; tier = 'Premium'; }
  else if (perPersonPerDay > 1500) { pillColor = CLOUD.warning; tier = 'Moderate'; }

  const [displayTotal, setDisplayTotal] = useState(total);
  useEffect(() => {
    let start = displayTotal;
    const end = total;
    if (start === end) return;
    const diff = end - start;
    const stepTime = 20;
    const steps = 15;
    const stepAmount = diff / steps;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayTotal(end);
        clearInterval(timer);
      } else {
        setDisplayTotal(Math.floor(start + stepAmount * currentStep));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [total]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Budget Estimation</Text>
      
      <View style={[styles.card, { marginBottom: 12, padding: 16 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 16 }}>
          {['Solo', 'Friends', 'Family', 'Group'].map(type => (
            <Pressable key={type} onPress={() => {
              setTripType(type as any);
              if (type === 'Solo') setPeople(1);
              else if (people === 1) setPeople(2);
            }}>
              <View style={[styles.segmentPill, tripType === type ? styles.segmentPillActive : { backgroundColor: '#F1F5F9' }, { paddingHorizontal: 16 }]}>
                <Text style={[styles.segmentText, tripType === type && styles.segmentTextActive]}>{type}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: CLOUD.muted, marginBottom: 8 }}>Travelers</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, overflow: 'hidden' }}>
              <Pressable 
                onPress={() => setPeople(Math.max((tripType as string) === 'Solo' ? 1 : 2, people - 1))} 
                style={{ padding: 12, opacity: ((tripType as string) === 'Solo' || people <= ((tripType as string) === 'Solo' ? 1 : 2)) ? 0.3 : 1 }}
                disabled={(tripType as string) === 'Solo' || people <= ((tripType as string) === 'Solo' ? 1 : 2)}
              >
                <Ionicons name="remove" size={16} color={CLOUD.ink} />
              </Pressable>
              <Text style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '700' }}>{people}</Text>
              <Pressable 
                onPress={() => setPeople(people + 1)} 
                style={{ padding: 12, opacity: (tripType as string) === 'Solo' ? 0.3 : 1 }}
                disabled={(tripType as string) === 'Solo'}
              >
                <Ionicons name="add" size={16} color={CLOUD.ink} />
              </Pressable>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: CLOUD.muted, marginBottom: 8 }}>Days</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, overflow: 'hidden' }}>
              <Pressable onPress={() => setDays(Math.max(1, days - 1))} style={{ padding: 12, opacity: days <= 1 ? 0.3 : 1 }} disabled={days <= 1}>
                <Ionicons name="remove" size={16} color={CLOUD.ink} />
              </Pressable>
              <Text style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '700' }}>{days}</Text>
              <Pressable onPress={() => setDays(days + 1)} style={{ padding: 12 }}>
                <Ionicons name="add" size={16} color={CLOUD.ink} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        {rows.map((row, i) => (
          <View key={row.label} style={styles.budgetRow}>
            <View style={styles.budgetRowLeft}>
              <Ionicons name={row.icon as any} size={18} color={CLOUD.muted} />
              <Text style={styles.budgetLabel}>{row.label}</Text>
            </View>
            <Text style={styles.budgetValue}>₹{row.val}</Text>
          </View>
        ))}
        <View style={styles.budgetDivider} />
        <View style={styles.budgetTotalRow}>
          <View style={styles.budgetRowLeft}>
            <Text style={styles.budgetTotalLabel}>Total Estimate</Text>
            <Animated.View style={[styles.budgetTierPill, { backgroundColor: pillColor + '15' }]}>
              <Text style={[styles.budgetTierText, { color: pillColor }]}>{tier}</Text>
            </Animated.View>
          </View>
          <Text style={styles.budgetTotalValue}>₹{displayTotal}</Text>
        </View>
      </View>
    </View>
  );
}

// --------------------------------------------------
// SECTION 8: Crowd & Safety Intelligence
// --------------------------------------------------
function CrowdSafetyIntelligence({ data }: any) {
  const items = [
    { label: 'Crowd Level', val: data.crowdLevel },
    { label: 'Safety Rating', val: data.safetyRating },
    { label: 'Parking', val: data.parkingAvailability },
    { label: 'Roads', val: data.roadConditions },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Crowd & Safety</Text>
      <View style={styles.grid}>
        {items.map((it, i) => {
          const color = getStatusColor(it.val);
          return (
            <Animated.View key={i} style={styles.gridItemHalf} entering={FadeInUp.delay(i * 50)}>
              <View style={styles.compactCard}>
                <View style={styles.ccHeader}>
                  <View style={[styles.statusDot, { backgroundColor: color }]} />
                  <Text style={styles.ccLabel}>{it.label}</Text>
                </View>
                <Text style={styles.ccValue}>{it.val}</Text>
              </View>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

// --------------------------------------------------
// SECTION 9: Top Attractions
// --------------------------------------------------
type SpotCoords = { latitude: number; longitude: number; name: string };

function openSpotNavigation(destinationId: string, spot: SpotCoords, parentName?: string) {
  const title =
    parentName && !spot.name.toLowerCase().includes(parentName.toLowerCase())
      ? `${spot.name}, ${parentName}`
      : spot.name;
  const params = new URLSearchParams({
    destinationId,
    lat: String(spot.latitude),
    lng: String(spot.longitude),
    name: title,
  });
  router.push(`/(app)/(ai-flow)/route-navigation?${params.toString()}` as Href);
}

function AttractionCard({
  attraction: a,
  onNavigate,
}: {
  attraction: NearbyAttraction | any;
  onNavigate?: () => void;
}) {
  const [error, setError] = useState(!a?.image);
  const canNavigate =
    typeof a?.latitude === 'number' &&
    typeof a?.longitude === 'number' &&
    Number.isFinite(a.latitude) &&
    Number.isFinite(a.longitude);

  return (
    <View style={styles.attractionCard}>
      <View style={styles.attractionImgWrap}>
        {error ? (
          <View style={[styles.attractionImg, styles.imageFallback]}>
            <Ionicons name="image-outline" size={24} color={CLOUD.muted} />
          </View>
        ) : (
          <Image
            source={{ uri: a.image }}
            style={styles.attractionImg}
            onError={() => setError(true)}
          />
        )}
        {canNavigate && onNavigate ? (
          <Pressable
            onPress={onNavigate}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Navigate to ${a.name}`}
            style={styles.spotNavBtn}
          >
            <Ionicons name="navigate" size={16} color="#fff" />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.attractionInfo}>
        <Text style={styles.attractionName} numberOfLines={2}>
          {a.name}
        </Text>
        <View style={styles.attractionMetaRow}>
          <Text style={styles.attractionMeta}>{a.category}</Text>
          <Text style={styles.attractionMetaDot}>·</Text>
          <Text style={styles.attractionMeta}>{a.distanceKm} km</Text>
        </View>
      </View>
    </View>
  );
}

function TopAttractions({
  attractions,
  onNavigate,
}: {
  attractions: any[];
  onNavigate: (a: SpotCoords) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { marginLeft: 20 }]}>Top Attractions</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={280 + 16}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
      >
        {attractions.map((a: any) => (
          <AttractionCard
            key={a.id}
            attraction={a}
            onNavigate={
              typeof a.latitude === 'number' && typeof a.longitude === 'number'
                ? () => onNavigate({ latitude: a.latitude, longitude: a.longitude, name: a.name })
                : undefined
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

// --------------------------------------------------
// SECTION 10: Nearby Essential Services
// --------------------------------------------------
const ESSENTIAL_SERVICE_ORDER = [
  'Hospital',
  'Police Station',
  'Petrol Pump',
  'EV Charging',
  'ATM',
  'Pharmacy',
] as const;

function normalizeServiceKey(type: string): (typeof ESSENTIAL_SERVICE_ORDER)[number] | null {
  const t = type.toLowerCase();
  if (t.includes('hospital')) return 'Hospital';
  if (t.includes('police')) return 'Police Station';
  if (t.includes('petrol') || t.includes('fuel')) return 'Petrol Pump';
  if (t.includes('ev') || t.includes('charging')) return 'EV Charging';
  if (t.includes('atm')) return 'ATM';
  if (t.includes('pharmacy') || t.includes('chemist')) return 'Pharmacy';
  return null;
}

function ensureEssentialServices(
  services: {
    id: string;
    type: string;
    name: string;
    distanceKm: number;
    latitude?: number;
    longitude?: number;
  }[],
) {
  const byKey = new Map<
    string,
    {
      id: string;
      type: string;
      name: string;
      distanceKm: number;
      latitude?: number;
      longitude?: number;
    }
  >();
  for (const s of services || []) {
    const key = normalizeServiceKey(s.type);
    if (key && !byKey.has(key)) {
      byKey.set(key, { ...s, type: key });
    }
  }
  return ESSENTIAL_SERVICE_ORDER.map((type, i) => {
    const existing = byKey.get(type);
    if (existing) return existing;
    return {
      id: `fallback-${i}`,
      type,
      name: `${type} nearby`,
      distanceKm: 0,
    };
  });
}

function NearbyServices({
  services,
  onNavigate,
}: {
  services: any[];
  onNavigate: (s: SpotCoords) => void;
}) {
  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('hospital')) return <Ionicons name="medkit-outline" size={20} color={CLOUD.primary} />;
    if (t.includes('petrol')) return <Fuel size={20} color={CLOUD.primary} />;
    if (t.includes('atm')) return <Ionicons name="cash-outline" size={20} color={CLOUD.primary} />;
    if (t.includes('police')) return <Ionicons name="shield-checkmark-outline" size={20} color={CLOUD.primary} />;
    if (t.includes('pharmacy')) return <Ionicons name="bandage-outline" size={20} color={CLOUD.primary} />;
    if (t.includes('ev') || t.includes('charging')) {
      return <Ionicons name="battery-charging-outline" size={20} color={CLOUD.primary} />;
    }
    return <Ionicons name="business-outline" size={20} color={CLOUD.primary} />;
  };

  const list = ensureEssentialServices(services);

  return (
    <View style={[styles.section, { paddingHorizontal: 20 }]}>
      <Text style={styles.sectionTitle}>Nearby Essential Services</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {list.map((s) => {
          const canNavigate =
            typeof s.latitude === 'number' &&
            typeof s.longitude === 'number' &&
            Number.isFinite(s.latitude) &&
            Number.isFinite(s.longitude);
          return (
            <View key={s.type} style={styles.serviceCard}>
              <View style={styles.serviceIconWrap}>{getIcon(s.type)}</View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.serviceName} numberOfLines={1}>
                  {s.name}
                </Text>
                <Text style={styles.serviceType}>
                  {s.type}
                  {s.distanceKm > 0 ? ` · ${s.distanceKm} km` : ''}
                </Text>
              </View>
              {canNavigate ? (
                <Pressable
                  onPress={() =>
                    onNavigate({
                      latitude: s.latitude!,
                      longitude: s.longitude!,
                      name: s.name,
                    })
                  }
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`Navigate to ${s.name}`}
                  style={styles.spotNavBtnInline}
                >
                  <Ionicons name="navigate-outline" size={18} color={CLOUD.primary} />
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// --------------------------------------------------
// SECTION 11: Best Time to Visit
// --------------------------------------------------
function BestTime({ bestTime }: any) {
  const segments = ['Morning', 'Afternoon', 'Evening', 'Night'] as const;
  const [activeSeg, setActiveSeg] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Night'>('Morning');
  
  const currentData = bestTime[activeSeg] || { window: '', reason: 'No data available' };

  return (
    <View style={[styles.section, { paddingHorizontal: 20 }]}>
      <Text style={styles.sectionTitle}>Best Time to Visit</Text>
      <View style={styles.card}>
        <View style={styles.segmentsRow}>
          {segments.map((seg) => {
            const isActive = seg === activeSeg;
            return (
              <Pressable key={seg} onPress={() => setActiveSeg(seg)} style={{ flex: 1 }}>
                <Animated.View style={[styles.segmentPill, isActive && styles.segmentPillActive]}>
                  <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>{seg}</Text>
                </Animated.View>
              </Pressable>
            );
          })}
        </View>
        <Animated.View 
          key={activeSeg}
          entering={FadeInUp.duration(300)}
          style={styles.bestTimeInfo}
        >
          <Ionicons name="time-outline" size={20} color={CLOUD.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bestTimeWindow}>{currentData.window}</Text>
            <Text style={styles.bestTimeReason}>{currentData.reason}</Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

// --------------------------------------------------
// SECTION 12: Travel Tips
// --------------------------------------------------
function TravelTips({ tips }: { tips: string[] }) {
  // Simple deterministic icons for tips
  const icons = ['information-circle-outline', 'alert-circle-outline', 'bulb-outline'];
  return (
    <View style={[styles.section, { paddingHorizontal: 20 }]}>
      <Text style={styles.sectionTitle}>Travel Tips</Text>
      <View style={styles.card}>
        {tips.map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <Ionicons name={icons[i % icons.length] as any} size={20} color={CLOUD.muted} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// --------------------------------------------------
// ANIMATED QUICK ACTION BUTTONS
// --------------------------------------------------
function AnimatedNavigateButton({ onPress }: { onPress: () => void }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 7000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const handlePress = () => {
    const currentRot = rotation.value;
    rotation.value = withTiming(currentRot + 360, { duration: 300, easing: Easing.out(Easing.quad) }, (finished) => {
      if (finished) {
        rotation.value = withRepeat(
          withTiming(rotation.value + 360, { duration: 7000, easing: Easing.linear }),
          -1,
          false
        );
      }
    });
    onPress();
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }]
  }));

  return (
    <ScalePressable style={styles.primaryActionBtn} onPress={handlePress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Animated.View style={animStyle}>
          <Ionicons name="compass-outline" size={20} color="#fff" />
        </Animated.View>
        <Text style={styles.primaryActionText}>Navigate There</Text>
      </View>
    </ScalePressable>
  );
}

function AnimatedCompareButton({ onPress }: { onPress: () => void }) {
  const tilt = useSharedValue(-10);

  useEffect(() => {
    tilt.value = withRepeat(
      withTiming(10, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const handlePress = () => {
    tilt.value = withTiming(35, { duration: 200, easing: Easing.out(Easing.quad) }, (finished) => {
      if (finished) {
        tilt.value = withRepeat(
          withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );
      }
    });
    onPress();
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${tilt.value}deg` }]
  }));

  return (
    <ScalePressable style={styles.secondaryActionBtn} onPress={handlePress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Animated.View style={animStyle}>
          <Ionicons name="scale-outline" size={20} color={CLOUD.primary} />
        </Animated.View>
        <Text style={styles.secondaryActionText}>Compare Destinations</Text>
      </View>
    </ScalePressable>
  );
}

// --------------------------------------------------
// COMPONENT SHELL
// --------------------------------------------------
export default function DestinationIntelligenceScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const transportMode = useAiFlowStore((s) => s.filters.transportMode);
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const savedDestinations = useAiFlowStore(s => s.savedDestinations);
  const saveDestination = useAiFlowStore(s => s.saveDestination);
  const unsaveDestination = useAiFlowStore(s => s.unsaveDestination);
  const userOrigin = useDashboardStore((s) => s.source);
  const weather = useDashboardStore((s) => s.weather);
  const snapshot = useIntelligenceStore((s) => s.snapshot);
  const refreshIntel = useIntelligenceStore((s) => s.refresh);
  const hydratePriors = useIntelligenceStore((s) => s.hydratePriors);
  const [planOpen, setPlanOpen] = useState(false);
  
  // Parse `id` safely
  const destId = Array.isArray(id) ? id[0] : id || '';
  const isSaved = !!savedDestinations.find(d => d.id === destId);
  const data = useMemo(
    () =>
      getDestinationIntelligence(destId!, userOrigin
        ? { latitude: userOrigin.latitude, longitude: userOrigin.longitude }
        : null),
    [destId, userOrigin?.latitude, userOrigin?.longitude],
  );

  useEffect(() => {
    void hydratePriors().then(() =>
      refreshIntel({
        source: userOrigin,
        weather,
        destination: {
          id: data.id,
          name: data.name,
          matchScore: data.matchScore,
          distanceKm: data.distanceKm,
          travelTimeMin: data.travelTimeMin,
          crowdLevel: data.crowdSafety.crowdLevel,
          parkingAvailability: data.crowdSafety.parkingAvailability,
          rainProbability: data.environment.rainProbability,
          weatherLabel: data.environment.weather,
          tempC: data.environment.tempC,
        },
        withScan: false,
      }),
    );
  }, [data.id, data.name, hydratePriors, refreshIntel, userOrigin, weather]);

  const catalogCoords = useMemo(
    () => mockDestinations.find((d) => d.id === destId)?.coordinates ?? null,
    [destId],
  );

  const journeyPlan = useMemo(
    () =>
      estimateJourney({
        destId,
        roadKm: data.distanceKm,
        origin: userOrigin
          ? { latitude: userOrigin.latitude, longitude: userOrigin.longitude }
          : null,
        dest: catalogCoords,
        tier: data.budget?.tier,
        hint: transportMode,
      }),
    [destId, data.distanceKm, data.budget?.tier, userOrigin?.latitude, userOrigin?.longitude, catalogCoords, transportMode],
  );

  const [journeyMode, setJourneyMode] = useState<JourneyMode>(journeyPlan.recommended);
  useEffect(() => {
    setJourneyMode(journeyPlan.recommended);
  }, [journeyPlan.recommended, destId]);

  const activeQuote = journeyPlan.modes.find((m) => m.mode === journeyMode);

  const [liveServices, setLiveServices] = useState<NearbyService[] | null>(null);

  useEffect(() => {
    setLiveServices(null);
    if (!catalogCoords) return;
    let cancelled = false;
    (async () => {
      try {
        const nearby = await fetchDestinationNearbyPlaces(catalogCoords);
        if (cancelled) return;
        if (nearby.services.length > 0) {
          setLiveServices(nearby.services);
        }
      } catch {
        // Keep catalogue services
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [catalogCoords, destId]);

  const attractionsForUi = data.attractions;
  const servicesForUi = liveServices?.length ? liveServices : data.services;

  const navigateToSpot = (spot: SpotCoords) => {
    openSpotNavigation(destId, spot, data.name);
  };

  const heartScale = useSharedValue(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleSave = () => {
    if (isSaved) {
      unsaveDestination(destId);
      heartScale.value = withSpring(0.9, { damping: 10, stiffness: 200 }, () => {
        heartScale.value = withSpring(1);
      });
      showToast('Removed from Saved');
    } else {
      saveDestination({
        id: destId,
        name: data.name,
        thumbnail: data.heroImage,
        matchScore: data.matchScore,
      });
      heartScale.value = withSpring(1.3, { damping: 10, stiffness: 200 }, () => {
        heartScale.value = withSpring(1);
      });
      showToast('❤️ Added to Saved');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  const heartAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }]
  }));

  const handleShare = async () => {
    try {
      const emoji = data.name.toLowerCase().includes('ooty') || data.name.toLowerCase().includes('munnar') ? '🌄' : '📍';
      const shortSummary = data.aiSummary.split('.')[0] + '.';
      const shareText = `${emoji} ${data.name} scored ${data.matchScore}% on UrbanLens AI — "${shortSummary}" Plan your own smart trip → https://urbanlens.app/d/${destId}`;
      
      await Share.share({
        message: shareText,
        title: data.name,
      });
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [100, 200], [0, 1], Extrapolation.CLAMP);
    return {
      backgroundColor: `rgba(255, 255, 255, ${opacity})`,
      borderBottomWidth: opacity > 0.5 ? 1 : 0,
      borderBottomColor: '#F1F5F9',
      ...CLOUD.shadow,
    };
  });

  const headerTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [100, 200], [0, 1], Extrapolation.CLAMP);
    return { opacity };
  });

  return (
    <View style={styles.root}>
      {/* SECTION 1: Sticky Header */}
      <Animated.View style={[styles.stickyHeader, { paddingTop: insets.top }, headerStyle]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={CLOUD.ink} />
        </Pressable>
        <Animated.View style={[styles.headerTitleWrap, headerTextStyle]}>
          <Text style={styles.headerTitle}>{data.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Text style={styles.headerSub}>{data.state}</Text>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: CLOUD.muted }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="sparkles" size={12} color={CLOUD.primary} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: CLOUD.primary }}>{data.readinessScore} · {data.readinessBand}</Text>
            </View>
          </View>
        </Animated.View>
        <View style={styles.headerRight}>
          <Pressable style={styles.headerBtn} onPress={toggleSave}>
            <Animated.View style={heartAnimStyle}>
              <Ionicons name={isSaved ? "heart" : "heart-outline"} size={24} color={isSaved ? CLOUD.danger : CLOUD.ink} />
            </Animated.View>
          </Pressable>
          <Pressable style={styles.headerBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={CLOUD.ink} />
          </Pressable>
        </View>
      </Animated.View>

      <Animated.ScrollView 
        onScroll={onScroll} 
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 2: Hero Destination Card */}
        <HeroDestinationCard 
          image={data.heroImage} 
          name={data.name} 
          distanceKm={data.distanceKm} 
          travelTimeMin={activeQuote?.available ? activeQuote.durationMin : data.travelTimeMin}
          matchScore={data.matchScore} 
        />
        
        <View style={styles.contentPad}>
          {/* SECTION 3: AI Intelligence Summary */}
          <AIInsightCard text={data.aiSummary} />

          {/* Phase 11 — Live Destination Pulse + What Changed */}
          {snapshot?.pulse ? (
            <View style={{ marginTop: 16, paddingHorizontal: 20 }}>
              <LiveDestinationPulse pulse={snapshot.pulse} matchScore={data.matchScore} />
            </View>
          ) : null}
          {snapshot?.whatChanged ? (
            <View style={{ marginTop: 16, paddingHorizontal: 20 }}>
              <WhatChangedCard
                data={snapshot.whatChanged}
                onRebuild={() => setPlanOpen(true)}
              />
            </View>
          ) : null}
          
          {/* SECTION 4: Destination Readiness Score */}
          <ReadinessScore score={data.readinessScore} band={data.readinessBand} />

          {/* SECTION 5: Travel Conditions */}
          <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
            <TravelConditions
              dist={data.distanceKm}
              plan={journeyPlan}
              mode={journeyMode}
              onMode={setJourneyMode}
            />
          </View>

          {/* SECTION 6: Environment Overview */}
          <EnvironmentOverview env={data.environment} />

          {/* SECTION 7: Budget Estimation */}
          <BudgetEstimation
            budget={data.budget}
            transportCost={activeQuote?.available ? activeQuote.transportCost : 0}
            transportLabel={activeQuote?.label || 'Car'}
          />

          {/* SECTION 8: Crowd & Safety Intelligence */}
          <CrowdSafetyIntelligence data={data.crowdSafety} />
        </View>

        {/* SECTION 9: Top Attractions */}
        <TopAttractions attractions={attractionsForUi} onNavigate={navigateToSpot} />
        
        <View style={{ height: 24 }} />

        {/* SECTION 10: Nearby Essential Services */}
        <NearbyServices services={servicesForUi} onNavigate={navigateToSpot} />

        <View style={{ height: 24 }} />

        {/* SECTION 11: Best Time to Visit */}
        <BestTime bestTime={data.bestTime} />

        <View style={{ height: 24 }} />

        {/* SECTION 12: Travel Tips */}
        <TravelTips tips={data.travelTips} />

        {/* SECTION 13: Quick Actions */}
        <View style={[styles.section, { paddingHorizontal: 20, marginTop: 32 }]}>
          <AnimatedNavigateButton onPress={() => router.push(`/(app)/(ai-flow)/route-navigation?destinationId=${id}` as Href)} />
          <AnimatedCompareButton onPress={() => router.push(`/(app)/(ai-flow)/decision-canvas?baseId=${id}` as Href)} />
        </View>

      </Animated.ScrollView>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <Animated.View entering={FadeInUp} exiting={FadeOutDown} style={[styles.toast, { bottom: CLOUD.navH + 20 }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <BottomTabBar activeTab="Explore" />

      <IdealPlanSheet
        visible={planOpen}
        plan={snapshot?.idealPlan ?? null}
        onClose={() => setPlanOpen(false)}
        onStartJourney={() => {
          setPlanOpen(false);
          router.push(`/(app)/(ai-flow)/route-navigation?destinationId=${id}` as Href);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: CLOUD.bg },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: CLOUD.ink,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 100,
    ...CLOUD.shadows.card,
    zIndex: 1000,
  },
  toastText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: CLOUD.ink },
  headerSub: { fontSize: 12, color: CLOUD.muted },
  headerRight: { flexDirection: 'row' },
  
  heroContainer: {
    width: '100%',
    aspectRatio: 21 / 9,
    minHeight: 280,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroFallback: {
    backgroundColor: CLOUD.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFallback: {
    backgroundColor: CLOUD.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heroContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    justifyContent: 'space-between',
  },
  badgeWrap: {
    alignItems: 'flex-end',
    marginTop: 40, 
  },
  scoreBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...CLOUD.shadows.card,
  },
  scoreText: { fontSize: 16, fontWeight: '800', color: CLOUD.primary },
  heroTextWrap: {
    marginTop: 'auto',
  },
  heroTitle: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
  heroSubtitle: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  
  contentPad: {
    padding: 20,
    gap: 24,
    marginTop: 16,
    paddingBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    ...CLOUD.shadows.card,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  aiInsightLabel: { fontSize: 14, fontWeight: '700', color: CLOUD.aiAccent },
  aiInsightText: { fontSize: 16, color: CLOUD.ink, lineHeight: 24 },
  
  readinessContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  readinessStage: {
    width: 176,
    height: 176,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  readinessGlow: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: CLOUD.lightBlue,
    shadowColor: CLOUD.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  readinessOrbWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.18)',
    backgroundColor: CLOUD.card,
  },
  readinessShine: {
    position: 'absolute',
    top: 16,
    left: 28,
    width: 48,
    height: 22,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  readinessScoreText: {
    fontSize: 40,
    fontWeight: '800',
    color: CLOUD.ink,
    letterSpacing: -0.8,
  },
  readinessCaption: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '700',
    color: CLOUD.primary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  bandPill: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bandText: {
    fontSize: 14,
    fontWeight: '700',
  },

  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CLOUD.ink,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItemHalf: {
    width: '48%',
  },
  gridItemFull: {
    width: '100%',
  },
  compactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    ...CLOUD.shadows.card,
  },
  ccLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: CLOUD.muted,
    marginBottom: 4,
  },
  ccValue: {
    fontSize: 15,
    fontWeight: '700',
    color: CLOUD.ink,
  },
  promotedCard: {
    borderColor: CLOUD.primary,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promotedLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: CLOUD.ink,
  },
  promotedValue: {
    fontSize: 20,
    fontWeight: '800',
    color: CLOUD.primary,
  },
  ccHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  budgetRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  budgetLabel: {
    fontSize: 14,
    color: CLOUD.ink,
    fontWeight: '500',
  },
  budgetValue: {
    fontSize: 14,
    color: CLOUD.ink,
    fontWeight: '600',
  },
  budgetDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  budgetTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  budgetTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: CLOUD.ink,
  },
  budgetTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: CLOUD.ink,
  },
  budgetTierPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  budgetTierText: {
    fontSize: 10,
    fontWeight: '700',
  },

  attractionCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    ...CLOUD.shadows.card,
  },
  attractionImgWrap: {
    width: '100%',
    height: 140,
    overflow: 'hidden',
  },
  attractionImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  spotNavBtn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CLOUD.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...CLOUD.shadows.card,
  },
  spotNavBtnInline: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CLOUD.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attractionInfo: {
    padding: 16,
  },
  attractionName: {
    fontSize: 16,
    fontWeight: '700',
    color: CLOUD.ink,
    marginBottom: 4,
  },
  attractionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attractionMeta: {
    fontSize: 13,
    color: CLOUD.muted,
  },
  attractionMetaDot: {
    color: CLOUD.border,
  },

  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...CLOUD.shadows.card,
    minWidth: 200,
    maxWidth: 280,
  },
  serviceIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CLOUD.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: CLOUD.ink,
  },
  serviceType: {
    fontSize: 12,
    color: CLOUD.muted,
    marginTop: 2,
  },

  segmentsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  segmentPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentPillActive: {
    backgroundColor: CLOUD.primary,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: CLOUD.muted,
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  bestTimeInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  bestTimeWindow: {
    fontSize: 16,
    fontWeight: '700',
    color: CLOUD.ink,
    marginBottom: 4,
  },
  bestTimeReason: {
    fontSize: 14,
    color: CLOUD.muted,
    lineHeight: 20,
  },

  tipRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: CLOUD.ink,
    lineHeight: 20,
  },

  primaryActionBtn: {
    backgroundColor: CLOUD.primary,
    height: CLOUD.buttons.height,
    borderRadius: CLOUD.radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    backgroundColor: '#FFFFFF',
    height: CLOUD.buttons.height,
    borderRadius: CLOUD.radii.button,
    borderWidth: 1,
    borderColor: CLOUD.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    color: CLOUD.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});
