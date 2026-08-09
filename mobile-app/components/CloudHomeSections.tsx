import { CLOUD } from '@/constants/cloudTheme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ReactNode, useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Animated as RNAnimated,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
} from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { AiLoadingState } from './AiLoadingState';
import { GLOBAL_PLACES } from '@/data/allPlaces';
import { getMatchingIntents, IntentCategory } from '@/data/intentCategories';

const PROMPT_CHIPS = [
  { key: 'weekend', label: 'Weekend Trip', query: 'weekend trip under ₹5000' },
  { key: 'hidden', label: 'Hidden Gems', query: 'hidden waterfalls nearby' },
  { key: 'nature', label: 'Nature', query: 'nature destinations for today' },
  { key: 'adventure', label: 'Adventure', query: 'adventure spots nearby' },
  { key: 'photography', label: 'Photography', query: 'best sunset viewpoints' },
  { key: 'family', label: 'Family', query: 'family friendly places' },
  { key: 'food', label: 'Food Trail', query: 'best cafes nearby' },
];

const EXAMPLE_PROMPTS = [
  'Ooty',
  'Weekend trip',
  'Hidden waterfalls',
  'Scenic drive',
  'Best AQI today',
];

export type SearchSuggestion = {
  placeKey: string;
  placeName: string;
  address: string;
};

export function AiSmartSearch({
  value,
  onChange,
  onRecommendFlow,
  onAdvancedSearch,
}: {
  value: string;
  onChange: (v: string) => void;
  onRecommendFlow?: () => void;
  onAdvancedSearch?: () => void;
}) {
  const router = useRouter();
  const [hideDropdown, setHideDropdown] = useState(false);
  
  useEffect(() => {
    setHideDropdown(false);
  }, [value]);

  const matchedIntents = getMatchingIntents(value);
  const matchedPlaces = GLOBAL_PLACES.filter(s => s.toLowerCase().includes(value.toLowerCase())).slice(0, 10);
  
  const hasResults = matchedIntents.length > 0 || matchedPlaces.length > 0;
  const showSuggestions = value.length > 1 && !hideDropdown && hasResults;

  
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const slideAnim = useRef(new RNAnimated.Value(20)).current;
  const searchScale = useRef(new RNAnimated.Value(1)).current;
  
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const triggerAiFlow = () => {
    setIsAiLoading(true);
    setTimeout(() => {
      setIsAiLoading(false);
      if (onRecommendFlow) onRecommendFlow();
    }, 1200);
  };

  const handleVoice = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      onChange('Best waterfalls nearby');
    }, 2000);
  };

  const handleLocation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      onChange('Places near my current location');
      triggerAiFlow();
    }, 1000);
  };

  const handlePlaceSelect = (query: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHideDropdown(true);
    Keyboard.dismiss();
    onChange(query);
    triggerAiFlow();
  };

  const handleIntentSelect = (intent: IntentCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHideDropdown(true);
    Keyboard.dismiss();
    onChange(intent.label);
    // Navigate to explore page
    router.push(`/(app)/(tabs)/explore?category=${intent.id}`);
  };

  const handleSubmit = () => {
    if (value.trim().length > 0) {
      setHideDropdown(true);
      Keyboard.dismiss();
      
      // If there are intents, default to the first intent on submit
      if (matchedIntents.length > 0) {
        handleIntentSelect(matchedIntents[0]);
      } else {
        triggerAiFlow();
      }
    }
  };

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      RNAnimated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % EXAMPLE_PROMPTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <RNAnimated.View style={[styles.aiSearchHeroCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={{ fontSize: 14, fontWeight: '700', color: '#7C3AED', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' }}>
        ✨ UrbanLens AI
      </Text>
      <Text style={[styles.aiSearchHeading, { fontSize: 24, fontWeight: '800', marginBottom: 24, color: '#0F172A', lineHeight: 32 }]}>
        Where would you like to explore today?
      </Text>
      
      <RNAnimated.View style={[styles.searchFieldWrap, { transform: [{ scale: searchScale }] }]}>
        <View style={styles.aiSearchBar}>
          <Ionicons name="search" size={20} color={CLOUD.muted} />
          <TextInput
            value={value}
            onChangeText={onChange}
            onSubmitEditing={handleSubmit}
            placeholder={isListening ? 'Listening...' : EXAMPLE_PROMPTS[placeholderIndex]}
            placeholderTextColor={CLOUD.muted}
            style={styles.aiSearchInput}
            returnKeyType="search"
            onFocus={() => {
              RNAnimated.timing(searchScale, {
                toValue: 1.02,
                duration: 200,
                useNativeDriver: true,
              }).start();
            }}
            onBlur={() => {
              RNAnimated.timing(searchScale, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }).start();
            }}
          />
          {value.length > 0 ? (
            <Pressable onPress={() => onChange('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={CLOUD.muted} />
            </Pressable>
          ) : isListening ? (
            <ActivityIndicator size="small" color="#2563EB" />
          ) : (
            <Ionicons name="mic-outline" size={20} color={CLOUD.muted} />
          )}
        </View>
        {showSuggestions ? (
          <View style={styles.suggestDropdown}>
            <ScrollView
              keyboardShouldPersistTaps="always"
              nestedScrollEnabled
              style={{ maxHeight: 260 }}
            >
              {matchedIntents.map((intent, index) => (
                <Pressable
                  key={`intent-${intent.id}`}
                  style={({ pressed }) => [
                    styles.suggestItem,
                    pressed && { backgroundColor: CLOUD.soft },
                  ]}
                  onPress={() => handleIntentSelect(intent)}
                >
                  <Ionicons name="sparkles" size={16} color="#7C3AED" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.suggestTitle}>{intent.label}</Text>
                    <Text style={styles.suggestSub} numberOfLines={1}>
                      AI Intent Category
                    </Text>
                  </View>
                </Pressable>
              ))}

              {matchedPlaces.map((item, index) => (
                <Pressable
                  key={`place-${item}`}
                  style={({ pressed }) => [
                    styles.suggestItem,
                    index === matchedPlaces.length - 1 && styles.suggestItemLast,
                    pressed && { backgroundColor: CLOUD.soft },
                  ]}
                  onPress={() => handlePlaceSelect(item)}
                >
                  <Ionicons name="location-outline" size={16} color={CLOUD.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.suggestTitle}>{item}</Text>
                    <Text style={styles.suggestSub} numberOfLines={1}>
                      Destination
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </RNAnimated.View>

      <View style={{ height: 1, backgroundColor: '#F1F5F9', marginVertical: 24 }} />

      <View>
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 8 }}>
          Need inspiration?
        </Text>
        <Text style={{ fontSize: 14, color: '#64748B', lineHeight: 22, marginBottom: 20 }}>
          Find places based on experiences,{'\n'}budget and travel style.
        </Text>
        
        <Pressable 
          style={({ pressed }) => [
            { 
              backgroundColor: '#0F172A', 
              paddingVertical: 16, 
              borderRadius: 16, 
              alignItems: 'center', 
              flexDirection: 'row', 
              justifyContent: 'center', 
              gap: 8 
            },
            pressed && { opacity: 0.85 }
          ]}
          onPress={() => {
             Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
             if (onAdvancedSearch) onAdvancedSearch();
          }}
        >
          <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>Explore with AI</Text>
        </Pressable>
      </View>

      {isAiLoading && (
        <View style={styles.aiLoadingWrap}>
          <AiLoadingState />
        </View>
      )}
    </RNAnimated.View>
  );
}

/** @deprecated Prefer suggestions on AiSmartSearch — kept for older call sites */
export function CloudSuggestionList({
  items,
  onPick,
}: {
  items: SearchSuggestion[];
  onPick: (placeKey: string) => void;
}) {
  if (!items.length) return null;
  return (
    <View style={styles.suggestBox}>
      {items.map((item) => (
        <Pressable
          key={item.placeKey}
          style={({ pressed }) => [styles.suggestItem, pressed && { backgroundColor: CLOUD.soft }]}
          onPress={() => onPick(item.placeKey)}
        >
          <Ionicons name="location-outline" size={16} color={CLOUD.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.suggestTitle}>{item.placeName}</Text>
            <Text style={styles.suggestSub} numberOfLines={1}>
              {item.address}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

export function CloudAiRecommendation({
  title,
  matchPercent,
  weatherLabel,
  crowdLabel,
  budgetLabel,
  imageUrl,
  imageLoading,
  onExplore,
  visible,
}: {
  title: string;
  matchPercent: number;
  weatherLabel: string;
  crowdLabel: string;
  budgetLabel: string;
  imageUrl?: string | null;
  imageLoading?: boolean;
  onExplore: () => void;
  visible: boolean;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [imageUrl]);
  if (!visible) return null;

  const showPhoto = Boolean(imageUrl) && !failed;

  return (
    <Animated.View entering={ZoomIn.duration(420)} style={[styles.heroCard, CLOUD.shadow]}>
      <Text style={styles.kicker}>AI RECOMMENDATION</Text>
      <View style={styles.heroImage}>
        {showPhoto ? (
          <Image
            source={{ uri: imageUrl! }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <View style={styles.heroFallback}>
            {imageLoading ? (
              <ActivityIndicator color={CLOUD.primary} />
            ) : (
              <Ionicons name="image-outline" size={32} color={CLOUD.muted} />
            )}
          </View>
        )}
      </View>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroScore}>{matchPercent}% · Highly Recommended Today</Text>
      <View style={styles.heroMeta}>
        <Text style={styles.heroPill}>{weatherLabel}</Text>
        <Text style={styles.heroPill}>{crowdLabel}</Text>
        <Text style={styles.heroPill}>{budgetLabel}</Text>
      </View>
      <Pressable style={styles.primaryBtn} onPress={onExplore}>
        <Text style={styles.primaryBtnText}>Explore Journey</Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
      </Pressable>
    </Animated.View>
  );
}

export type IntelItem = {
  key: string;
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export function IntelligenceSnapshot({ items }: { items: IntelItem[] }) {
  return (
    <View style={{ marginTop: 16 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: CLOUD.pad }}>
        {items.map((item, index) => (
          <Animated.View
            key={item.key}
            entering={FadeInDown.delay(40 * index).duration(320)}
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              backgroundColor: 'rgba(255,255,255,0.8)',
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 20,
              gap: 8,
              borderWidth: 1,
              borderColor: 'rgba(15,23,42,0.05)',
              ...CLOUD.shadow,
            }}
          >
            <Ionicons name={item.icon} size={16} color={CLOUD.primary} />
            <View>
              <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>{item.label}</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>{item.value}</Text>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

export function SmartRoutePlanner({
  sourceLabel,
  destinationLabel,
  distanceKm,
  etaMinutes,
  canNavigate,
  onNavigate,
  routeLoading,
  routeError,
  alternatives,
  selectedRouteId,
  onSelectAlternative,
  onOpenExternalMaps,
}: {
  sourceLabel: string;
  destinationLabel: string;
  distanceKm?: number | null;
  etaMinutes?: number | null;
  canNavigate: boolean;
  onNavigate: () => void;
  routeLoading?: boolean;
  routeError?: string | null;
  alternatives?: Array<{ id: string; label: string }>;
  selectedRouteId?: string | null;
  onSelectAlternative?: (id: string) => void;
  onOpenExternalMaps?: () => void;
}) {
  return (
    <View style={[styles.sectionCard, CLOUD.shadow]}>
      <Text style={styles.kicker}>SMART ROUTE PLANNER</Text>
      <View style={styles.routeRow}>
        <View style={[styles.routeDot, { backgroundColor: CLOUD.primary }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.routeLabel}>Source</Text>
          <Text style={styles.routeValue} numberOfLines={2}>
            {sourceLabel}
          </Text>
        </View>
      </View>
      <View style={styles.routeLine} />
      <View style={styles.routeRow}>
        <View style={[styles.routeDot, { backgroundColor: CLOUD.accent }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.routeLabel}>Destination</Text>
          <Text style={styles.routeValue} numberOfLines={2}>
            {destinationLabel || 'Select a destination above'}
          </Text>
        </View>
      </View>

      {routeLoading ? (
        <View style={styles.routeLoading}>
          <ActivityIndicator color={CLOUD.primary} />
          <Text style={styles.routeLoadingText}>Calculating road routes…</Text>
        </View>
      ) : (
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>
              {distanceKm != null ? `${distanceKm.toFixed(1)} km` : '—'}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>ETA</Text>
            <Text style={styles.statValue}>
              {etaMinutes != null ? `${Math.max(1, Math.round(etaMinutes))} min` : '—'}
            </Text>
          </View>
        </View>
      )}

      {routeError ? <Text style={styles.routeError}>{routeError}</Text> : null}

      {alternatives && alternatives.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.altRow}
        >
          {alternatives.map((alt) => {
            const active = alt.id === selectedRouteId;
            return (
              <Pressable
                key={alt.id}
                style={[styles.altChip, active && styles.altChipActive]}
                onPress={() => onSelectAlternative?.(alt.id)}
              >
                <Text style={[styles.altChipText, active && styles.altChipTextActive]} numberOfLines={1}>
                  {alt.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      <Pressable
        style={[styles.primaryBtn, !canNavigate && styles.primaryBtnDisabled]}
        disabled={!canNavigate}
        onPress={onNavigate}
      >
        <Ionicons name="navigate" size={16} color="#FFFFFF" />
        <Text style={styles.primaryBtnText}>Start Navigation</Text>
      </Pressable>

      {onOpenExternalMaps ? (
        <Pressable
          style={[styles.ghostRouteBtn, !canNavigate && styles.primaryBtnDisabled]}
          disabled={!canNavigate}
          onPress={onOpenExternalMaps}
        >
          <Ionicons name="map-outline" size={16} color={CLOUD.primary} />
          <Text style={styles.ghostRouteBtnText}>Open in Google Maps</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function PointsOfInterestList({
  items,
  loading,
  onPress,
}: {
  items: Array<{ id: string; title: string; subtitle: string }>;
  loading?: boolean;
  onPress?: (id: string) => void;
}) {
  if (loading) {
    return (
      <View style={[styles.sectionCard, CLOUD.shadow, { paddingVertical: 24, alignItems: 'center' }]}>
        <ActivityIndicator color={CLOUD.primary} />
      </View>
    );
  }
  if (!items.length) {
    return (
      <View style={[styles.sectionCard, CLOUD.shadow]}>
        <Text style={styles.emptyTitle}>No nearby points of interest.</Text>
        <Text style={styles.emptyBody}>Try another destination or refresh later.</Text>
      </View>
    );
  }
  return (
    <View style={styles.poiList}>
      {items.map((item) => (
        <Pressable
          key={item.id}
          style={[styles.poiCard, CLOUD.shadow]}
          onPress={() => onPress?.(item.id)}
        >
          <View style={styles.poiIcon}>
            <Ionicons name="location" size={18} color={CLOUD.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.continueTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.continueSub} numberOfLines={2}>
              {item.subtitle}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

export function ContinueJourneyRow({
  items,
  onResume,
}: {
  items: Array<{ id: string; title: string; subtitle: string; imageUrl?: string | null }>;
  onResume: (id: string) => void;
}) {
  return (
    <View style={styles.continueSection}>
      <Text style={styles.kicker}>CONTINUE JOURNEY</Text>
      {items.length === 0 ? (
        <View style={[styles.sectionCard, CLOUD.shadow]}>
          <Text style={styles.emptyTitle}>No previous journeys.</Text>
          <Text style={styles.emptyBody}>Start your next adventure!</Text>
        </View>
      ) : (
        items.slice(0, 4).map((item) => (
          <Pressable
            key={item.id}
            style={[styles.continueCard, CLOUD.shadow]}
            onPress={() => onResume(item.id)}
          >
            <View style={styles.continueThumb}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.continuePhoto} />
              ) : (
                <Ionicons name="map-outline" size={22} color={CLOUD.muted} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.continueTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.continueSub}>{item.subtitle}</Text>
            </View>
            <Text style={styles.resume}>Resume →</Text>
          </Pressable>
        ))
      )}
    </View>
  );
}

export function CloudSectionShell({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(420)} style={{ marginBottom: CLOUD.gap }}>
      {children}
    </Animated.View>
  );
}

export async function openGoogleMapsNav(origin: string, destination: string) {
  const url =
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${encodeURIComponent(origin)}` +
    `&destination=${encodeURIComponent(destination)}` +
    `&travelmode=driving`;
  await Linking.openURL(url);
}

const styles = StyleSheet.create({
  aiSearchHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  aiSearchEyebrow: {
    fontFamily: CLOUD.fonts.heading,
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  aiSearchHeading: {
    fontFamily: CLOUD.fonts.heading,
    color: '#1E293B',
    fontSize: 30,
    fontWeight: '600',
    lineHeight: 36,
    marginBottom: 16,
  },
  searchFieldWrap: {
    zIndex: 50,
  },
  aiSearchBar: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiSearchInput: {
    flex: 1,
    fontFamily: CLOUD.fonts.body,
    color: '#1E293B',
    fontSize: 16,
    height: '100%',
  },
  suggestDropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: CLOUD.border,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    maxHeight: 260,
    overflow: 'hidden',
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  suggestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: CLOUD.border,
  },
  suggestItemLast: {
    borderBottomWidth: 0,
  },
  suggestTitle: {
    fontFamily: CLOUD.fonts.heading,
    color: CLOUD.ink,
    fontSize: 15,
    fontWeight: '600',
  },
  suggestSub: {
    fontFamily: CLOUD.fonts.body,
    color: CLOUD.muted,
    fontSize: 13,
  },
  aiActionRow: { 
    flexDirection: 'row', 
    marginTop: 16 
  },
  aiActionButton: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  aiActionText: {
    fontFamily: CLOUD.fonts.body,
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  aiChipRow: { 
    gap: 10, 
    marginTop: 24,
    paddingBottom: 8,
    alignItems: 'center',
  },
  aiChipSectionLabel: {
    fontFamily: CLOUD.fonts.body,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  aiChip: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiChipActive: {
    backgroundColor: '#2563EB',
  },
  aiChipText: {
    fontFamily: CLOUD.fonts.body,
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 14,
  },
  aiChipTextActive: {
    color: '#FFFFFF',
  },
  aiLoadingWrap: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
  },
  suggestBox: {
    marginTop: 10,
    backgroundColor: CLOUD.card,
    borderRadius: CLOUD.radii.search,
    borderWidth: 1,
    borderColor: CLOUD.border,
    overflow: 'hidden',
    ...CLOUD.shadows.card,
  },
  kicker: {
    fontFamily: CLOUD.fonts.heading,
    fontSize: 12,
    fontWeight: '700',
    color: CLOUD.primary,
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  /* ── Hero / AI Recommendation ───────────────────────────── */
  heroCard: {
    backgroundColor: CLOUD.card,
    borderRadius: CLOUD.radii.card,
    padding: CLOUD.cardPad,
    borderWidth: 1,
    borderColor: CLOUD.border,
  },
  heroImage: {
    height: 180,
    borderRadius: CLOUD.radii.search,
    overflow: 'hidden',
    backgroundColor: CLOUD.soft,
    marginBottom: 14,
  },
  heroFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroTitle: {
    fontFamily: CLOUD.fonts.heading,
    color: CLOUD.ink,
    fontSize: 26,
    fontWeight: '800',
  },
  heroScore: {
    fontFamily: CLOUD.fonts.number,
    color: CLOUD.primary,
    fontWeight: '700',
    marginTop: 6,
    fontSize: 15,
  },
  heroMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: CLOUD.spacing.sm, marginTop: 12 },
  heroPill: {
    fontFamily: CLOUD.fonts.body,
    color: CLOUD.body,
    backgroundColor: CLOUD.soft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: CLOUD.radii.fab,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },

  /* ── Primary Button ─────────────────────────────────────── */
  primaryBtn: {
    marginTop: CLOUD.spacing.md,
    minHeight: CLOUD.buttons.height,
    borderRadius: CLOUD.radii.button,
    backgroundColor: CLOUD.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: CLOUD.spacing.sm,
  },
  primaryBtnDisabled: { opacity: 0.45 },
  primaryBtnText: {
    fontFamily: CLOUD.fonts.heading,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  /* ── Section Card ───────────────────────────────────────── */
  sectionCard: {
    backgroundColor: CLOUD.card,
    borderRadius: CLOUD.radii.card,
    padding: CLOUD.cardPad,
    borderWidth: 1,
    borderColor: CLOUD.border,
  },

  /* ── Intelligence Snapshot ──────────────────────────────── */
  intelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  intelCell: {
    width: '31%',
    flexGrow: 1,
    minWidth: '30%',
    backgroundColor: CLOUD.soft,
    borderRadius: CLOUD.radii.button,
    padding: 12,
    borderWidth: 1,
    borderColor: CLOUD.border,
  },
  intelIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: CLOUD.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: CLOUD.spacing.sm,
  },
  intelLabel: {
    fontFamily: CLOUD.fonts.body,
    color: CLOUD.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  intelValue: {
    fontFamily: CLOUD.fonts.number,
    color: CLOUD.ink,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },

  /* ── Route Planner ──────────────────────────────────────── */
  routeRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: CLOUD.border,
    marginLeft: 4,
    marginVertical: 4,
  },
  routeLabel: {
    fontFamily: CLOUD.fonts.body,
    color: CLOUD.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  routeValue: {
    fontFamily: CLOUD.fonts.body,
    color: CLOUD.ink,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  routeLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 14,
  },
  routeLoadingText: {
    fontFamily: CLOUD.fonts.body,
    color: CLOUD.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  routeError: {
    fontFamily: CLOUD.fonts.body,
    color: CLOUD.warning,
    fontSize: 12,
    marginBottom: CLOUD.spacing.sm,
  },
  altRow: { gap: CLOUD.spacing.sm, paddingBottom: 12 },
  altChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: CLOUD.radii.fab,
    backgroundColor: CLOUD.soft,
    borderWidth: 1,
    borderColor: CLOUD.border,
    maxWidth: 220,
  },
  altChipActive: {
    backgroundColor: CLOUD.lightBlue,
    borderColor: CLOUD.primary,
  },
  altChipText: {
    fontFamily: CLOUD.fonts.body,
    color: CLOUD.ink,
    fontSize: 12,
    fontWeight: '600',
  },
  altChipTextActive: { color: CLOUD.primary },
  ghostRouteBtn: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: CLOUD.spacing.sm,
    paddingVertical: 12,
    borderRadius: CLOUD.radii.button,
    borderWidth: 1,
    borderColor: CLOUD.border,
    backgroundColor: CLOUD.soft,
  },
  ghostRouteBtnText: {
    fontFamily: CLOUD.fonts.heading,
    color: CLOUD.primary,
    fontWeight: '700',
    fontSize: 14,
  },

  /* ── POI & Stats ────────────────────────────────────────── */
  poiList: { gap: 10 },
  poiCard: {
    backgroundColor: CLOUD.card,
    borderRadius: CLOUD.radii.button,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: CLOUD.border,
    ...CLOUD.shadows.card,
  },
  poiIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: CLOUD.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: CLOUD.spacing.md },
  stat: {
    flex: 1,
    backgroundColor: CLOUD.soft,
    borderRadius: CLOUD.radii.button,
    padding: 12,
    borderWidth: 1,
    borderColor: CLOUD.border,
  },
  statLabel: {
    fontFamily: CLOUD.fonts.body,
    color: CLOUD.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontFamily: CLOUD.fonts.number,
    color: CLOUD.ink,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },

  /* ── Continue Journey ───────────────────────────────────── */
  continueSection: { marginBottom: CLOUD.spacing.sm },
  continueCard: {
    backgroundColor: CLOUD.card,
    borderRadius: CLOUD.radii.search,
    borderWidth: 1,
    borderColor: CLOUD.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    ...CLOUD.shadows.card,
  },
  continueThumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: CLOUD.soft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  continuePhoto: { width: 52, height: 52 },
  continueTitle: {
    fontFamily: CLOUD.fonts.heading,
    color: CLOUD.ink,
    fontWeight: '800',
    fontSize: 15,
  },
  continueSub: {
    fontFamily: CLOUD.fonts.body,
    color: CLOUD.muted,
    fontSize: 12,
    marginTop: 2,
  },
  resume: {
    fontFamily: CLOUD.fonts.heading,
    color: CLOUD.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  emptyTitle: {
    fontFamily: CLOUD.fonts.heading,
    color: CLOUD.ink,
    fontWeight: '800',
    fontSize: 16,
  },
  emptyBody: {
    fontFamily: CLOUD.fonts.body,
    color: CLOUD.muted,
    marginTop: 6,
    fontSize: 14,
  },
});

