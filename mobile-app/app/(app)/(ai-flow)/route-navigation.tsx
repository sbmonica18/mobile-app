import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  FadeInUp,
  FadeIn,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import MapView, { UrlTile, Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { CLOUD } from '@/constants/cloudTheme';
import { mockDestinations } from '@/mocks/destinations';
import { JourneyCompanionSheet } from '@/components/JourneyCompanionSheet';
import { TourBudgetQuiz, type TourActualCosts } from '@/components/TourBudgetQuiz';
import { generateJourneyStoryRemote } from '@/services/journeyStoryApi';
import { useJourneyStoryStore } from '@/store/journeyStoryStore';
import { persistJourneyStoryRemote } from '@/services/journeyStoryApi';
import { useAuthStore } from '@/store/authStore';

const { width: SCREEN_W } = Dimensions.get('window');

type RouteMood = 'scenic' | 'fastest' | 'budget' | 'family' | 'adventure';

interface RouteStep {
  distance: number;
  name: string;
  maneuver: {
    type: string;
    modifier?: string;
    location: [number, number]; 
  };
}

interface RouteOption {
  geometry: {latitude: number, longitude: number}[]; 
  distanceKm: number;
  durationMin: number;
  mood: RouteMood;
  label: string;
  emoji: string;
  routeColor: string;
  steps: RouteStep[];
}

interface SmartStop {
  id: string;
  name: string;
  category: string;
  emoji: string;
  distKm: number;
  longitude: number;
  latitude: number;
}

const MOOD_DEFS = {
  fastest: { label: 'Fastest', emoji: '⚡', routeColor: '#EF4444' },
  scenic: { label: 'Scenic', emoji: '🌄', routeColor: '#F59E0B' },
  budget: { label: 'Budget Friendly', emoji: '💰', routeColor: '#10B981' },
  family: { label: 'Family Friendly', emoji: '👨‍👩‍👧', routeColor: '#3B82F6' },
  adventure: { label: 'Adventure', emoji: '🏔', routeColor: '#8B5CF6' }
};

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const AnimatedNumber = ({ value, label, suffix = '', isTime = false }: { value: number, label: string, suffix?: string, isTime?: boolean }) => {
  const [displayVal, setDisplayVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 500; // 500ms ease-out
    const interval = 16;
    const steps = duration / interval;
    const increment = value / steps;
    
    let timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayVal(value);
        clearInterval(timer);
      } else {
        setDisplayVal(start);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [value]);
  
  if (isTime) {
    const hrs = Math.floor(displayVal / 60);
    const mins = Math.floor(displayVal % 60);
    return (
      <View style={styles.statItem}>
        <Text style={styles.statVal}>{hrs > 0 ? `${hrs}h ` : ''}{mins}m</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    );
  }
  return (
    <View style={styles.statItem}>
      <Text style={styles.statVal}>{displayVal.toFixed(1).replace('.0', '')}{suffix}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

export default function RouteNavigationScreen() {
  const insets = useSafeAreaInsets();
  const { destinationId, lat, lng, name: spotName } = useLocalSearchParams<{
    destinationId: string;
    lat?: string;
    lng?: string;
    name?: string;
  }>();
  const catalogDest = mockDestinations.find((d) => d.id === destinationId) || mockDestinations[0];
  const spotLat = lat != null ? Number(Array.isArray(lat) ? lat[0] : lat) : NaN;
  const spotLng = lng != null ? Number(Array.isArray(lng) ? lng[0] : lng) : NaN;
  const hasSpotCoords = Number.isFinite(spotLat) && Number.isFinite(spotLng);
  const targetName = (Array.isArray(spotName) ? spotName[0] : spotName)?.trim() || catalogDest.name;
  const targetCoords = hasSpotCoords
    ? { latitude: spotLat, longitude: spotLng }
    : catalogDest.coordinates;
  /** Parent catalogue entry — cover/weather for journey story; routing uses targetCoords. */
  const dest = {
    ...catalogDest,
    name: targetName,
    coordinates: targetCoords,
  };

  const mapRef = useRef<MapView>(null);
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [sourceName, setSourceName] = useState('Current Location');
  const [sourceCoords, setSourceCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [cameraFollows, setCameraFollows] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  /** Full tour: outbound to place, then return to source before budget + story. */
  const [tourLeg, setTourLeg] = useState<'outbound' | 'returning'>('outbound');
  const [reachedDestination, setReachedDestination] = useState(false);
  const [returnedToSource, setReturnedToSource] = useState(false);
  const [showBudgetQuiz, setShowBudgetQuiz] = useState(false);
  const [outboundDistanceKm, setOutboundDistanceKm] = useState(0);
  const [outboundDurationMin, setOutboundDurationMin] = useState(0);
  const [phaseBanner, setPhaseBanner] = useState<string | null>(null);
  
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [activeMood, setActiveMood] = useState<RouteMood>('fastest');
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);
  const [smartStops, setSmartStops] = useState<SmartStop[]>([]);
  const [weatherAlert, setWeatherAlert] = useState<string | null>(null);

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [distanceRemaining, setDistanceRemaining] = useState<number>(0);
  const [etaMin, setEtaMin] = useState<number>(0);
  const [arrived, setArrived] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const storyOpened = useRef(false);
  const destArrivalHandled = useRef(false);
  const returnArrivalHandled = useRef(false);
  const beginStory = useJourneyStoryStore((s) => s.beginStory);
  const setCurrent = useJourneyStoryStore((s) => s.setCurrent);
  const saveToVault = useJourneyStoryStore((s) => s.saveToVault);
  const isGuest = useAuthStore((s) => s.isGuest);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const celebrate = useSharedValue(0);

  const activeRoute = routeOptions.find(r => r.mood === activeMood) || routeOptions[0];

  const estimatedBudgetInr = useMemo(() => {
    const km = Math.max(outboundDistanceKm, activeRoute?.distanceKm ?? distanceRemaining, 12) * (reachedDestination ? 2 : 1);
    const fuel = Math.round(km * 0.08 * 105);
    const parking = 80;
    const tolls = km > 100 ? 240 : 60;
    return fuel + parking + tolls + 450;
  }, [outboundDistanceKm, activeRoute?.distanceKm, distanceRemaining, reachedDestination]);

  const navTarget = tourLeg === 'returning' && sourceCoords ? sourceCoords : dest.coordinates;
  const navTargetName = tourLeg === 'returning' ? sourceName : dest.name;

  const openBudgetQuiz = useCallback(() => {
    if (storyOpened.current) return;
    setIsNavigating(false);
    setReturnedToSource(true);
    setShowBudgetQuiz(true);
    setPhaseBanner(null);
    setArrived(true);
  }, []);

  const startReturnLeg = useCallback(async () => {
    if (!sourceCoords || !location) {
      // Fallback: mark destination done and allow End to open budget after a soft return.
      setReachedDestination(true);
      setTourLeg('returning');
      setPhaseBanner(`Return to ${sourceName} to finish the tour`);
      setIsNavigating(true);
      return;
    }
    destArrivalHandled.current = true;
    setReachedDestination(true);
    setArrived(false);
    setPhaseBanner(`Heading back to ${sourceName}`);
    setTourLeg('returning');
    setActiveStepIndex(0);
    if (voiceEnabled) {
      Speech.speak(`You have arrived at ${dest.name}. Starting return to ${sourceName}.`);
    }
    const outKm = activeRoute?.distanceKm ?? outboundDistanceKm;
    const outMin = activeRoute?.durationMin ?? outboundDurationMin;
    setOutboundDistanceKm(outKm);
    setOutboundDurationMin(outMin);
    await fetchRoute(
      location.coords.latitude,
      location.coords.longitude,
      sourceCoords.latitude,
      sourceCoords.longitude,
      { silent: true },
    );
    setIsNavigating(true);
    setCameraFollows(true);
  }, [
    sourceCoords,
    location,
    sourceName,
    dest.name,
    voiceEnabled,
    activeRoute,
    outboundDistanceKm,
    outboundDurationMin,
  ]);

  const openJourneyStory = useCallback((costs?: TourActualCosts) => {
    if (storyOpened.current) return;
    storyOpened.current = true;
    setShowBudgetQuiz(false);
    setCelebrating(true);
    setIsNavigating(false);
    celebrate.value = withTiming(1, {
      duration: 1200,
      easing: Easing.inOut(Easing.cubic),
    });

    const totalKm =
      (outboundDistanceKm || activeRoute?.distanceKm || distanceRemaining) +
      (activeRoute?.distanceKm ?? 0);
    const totalMin =
      (outboundDurationMin || activeRoute?.durationMin || etaMin) +
      (activeRoute?.durationMin ?? 0);

    const seed = {
      destinationName: dest.name,
      destinationId: catalogDest.id,
      originName: sourceName,
      distanceKm: Math.max(totalKm, outboundDistanceKm || distanceRemaining),
      durationMinutes: Math.max(totalMin, outboundDurationMin || etaMin),
      weatherLabel: dest.weather,
      destinationImage: dest.coverImage,
      routeCoordinates: activeRoute?.geometry,
      estimatedBudgetInr,
      actualTotalBudgetInr: costs?.totalSpendInr,
      actualFuelCostInr: costs?.fuelCostInr,
      actualFoodCostInr: costs?.foodCostInr,
      actualOtherCostInr: costs?.otherCostInr,
    };

    const local = beginStory(seed);
    void saveToVault(local);
    void generateJourneyStoryRemote(seed).then(async (remote) => {
      setCurrent(remote);
      const saved = await saveToVault(remote);
      if (saved && isAuthenticated && !isGuest) {
        void persistJourneyStoryRemote(saved);
      }
    });

    setTimeout(() => {
      router.replace('/(app)/journey-story' as Href);
    }, 1180);
  }, [
    dest,
    catalogDest.id,
    sourceName,
    activeRoute,
    distanceRemaining,
    etaMin,
    outboundDistanceKm,
    outboundDurationMin,
    estimatedBudgetInr,
    beginStory,
    setCurrent,
    saveToVault,
    celebrate,
    isAuthenticated,
    isGuest,
  ]);

  const handleEndPress = useCallback(() => {
    if (tourLeg === 'outbound' && !reachedDestination) {
      void startReturnLeg();
      return;
    }
    if (tourLeg === 'returning' || reachedDestination) {
      openBudgetQuiz();
    }
  }, [tourLeg, reachedDestination, startReturnLeg, openBudgetQuiz]);

  // Animations
  const pulseVal = useSharedValue(1);
  const dropVal = useSharedValue(-80);
  const breathVal = useSharedValue(1);

  useEffect(() => {
    pulseVal.value = withRepeat(withTiming(2, { duration: 1500 }), -1, true);
    dropVal.value = withDelay(400, withSpring(0, { damping: 10, stiffness: 100 }));
    breathVal.value = withRepeat(withTiming(1.02, { duration: 1200 }), -1, true);
  }, []);

  const sourcePulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseVal.value }],
    opacity: 1.2 - (pulseVal.value * 0.6)
  }));
  const destDropStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dropVal.value }]
  }));
  const startBtnBreathStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathVal.value }]
  }));

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(loc);
      setSourceCoords({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      
      const geo = await Location.reverseGeocodeAsync(loc.coords);
      if (geo && geo.length > 0) {
        setSourceName(geo[0].city || geo[0].subregion || geo[0].name || 'Current Location');
      }

      fetchRoute(loc.coords.latitude, loc.coords.longitude, dest.coordinates.latitude, dest.coordinates.longitude);
    })();
  }, [dest.coordinates.latitude, dest.coordinates.longitude]);

  const fetchRoute = async (
    srcLat: number,
    srcLng: number,
    dstLat: number,
    dstLng: number,
    opts?: { silent?: boolean },
  ) => {
    if (!opts?.silent) setIsLoadingRoute(true);
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${srcLng},${srcLat};${dstLng},${dstLat}?alternatives=true&geometries=geojson&overview=full&steps=true`);
      const data = await res.json();
      
      if (data.routes && data.routes.length > 0) {
        const options: RouteOption[] = data.routes.map((route: any, index: number) => {
          let mood: RouteMood = 'fastest';
          if (index === 1) mood = 'scenic';
          if (index === 2) mood = 'budget';
          if (index === 3) mood = 'family';
          if (index === 4) mood = 'adventure';
          
          return {
            geometry: route.geometry.coordinates.map((c: number[]) => ({ latitude: c[1], longitude: c[0] })),
            distanceKm: route.distance / 1000,
            durationMin: route.duration / 60,
            steps: route.legs[0].steps,
            mood,
            label: MOOD_DEFS[mood].label,
            emoji: MOOD_DEFS[mood].emoji,
            routeColor: MOOD_DEFS[mood].routeColor
          };
        });
        
        setRouteOptions(options);
        setActiveMood(options[0].mood);
        setDistanceRemaining(options[0].distanceKm);
        setEtaMin(options[0].durationMin);

        if (!opts?.silent) {
          fetchPOIs(options[0].geometry);
          fetchWeather(options[0].geometry);
        }
      }
    } catch (e) {
      console.warn('OSRM error', e);
    }
    if (!opts?.silent) setIsLoadingRoute(false);
  };

  const fetchPOIs = async (routeGeom: {latitude: number, longitude: number}[]) => {
    try {
      const samples = [];
      const totalPoints = routeGeom.length;
      const step = Math.max(1, Math.floor(totalPoints / 6)); 
      for (let i = 0; i < totalPoints; i += step) samples.push(routeGeom[i]);
      
      let allStops: SmartStop[] = [];
      for (let pt of samples) {
        if (!pt) continue;
        const query = `
          [out:json];
          (
            node["amenity"="fuel"](around:4000,${pt.latitude},${pt.longitude});
            node["amenity"="cafe"](around:4000,${pt.latitude},${pt.longitude});
            node["amenity"="restaurant"](around:4000,${pt.latitude},${pt.longitude});
            node["tourism"="viewpoint"](around:4000,${pt.latitude},${pt.longitude});
            node["tourism"="hotel"](around:4000,${pt.latitude},${pt.longitude});
          );
          out center 2;
        `;
        const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: query, headers: { 'User-Agent': 'UrbanLens/1.0' }});
        const data = await res.json();
        
        data.elements.forEach((el: any) => {
          let category = 'Stop', emoji = '📍';
          if (el.tags?.amenity === 'fuel') { category = 'Petrol'; emoji = '⛽'; }
          if (el.tags?.amenity === 'cafe') { category = 'Cafe'; emoji = '☕'; }
          if (el.tags?.amenity === 'restaurant') { category = 'Restaurant'; emoji = '🍔'; }
          if (el.tags?.tourism === 'viewpoint') { category = 'Viewpoint'; emoji = '📸'; }
          if (el.tags?.tourism === 'hotel') { category = 'Hotel'; emoji = '🛌'; }
          
          if (el.tags?.name) {
            allStops.push({
              id: el.id.toString(), name: el.tags.name, category, emoji,
              distKm: getDistanceFromLatLonInKm(routeGeom[0].latitude, routeGeom[0].longitude, el.lat, el.lon),
              latitude: el.lat, longitude: el.lon
            });
          }
        });
      }
      const uniqueStops = Array.from(new Map(allStops.map(s => [s.id, s])).values()).sort((a,b) => a.distKm - b.distKm);
      setSmartStops(uniqueStops);
    } catch (e) {}
  };

  const fetchWeather = async (routeGeom: {latitude: number, longitude: number}[]) => {
    try {
      const midPt = routeGeom[Math.floor(routeGeom.length / 2)];
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${midPt.latitude}&longitude=${midPt.longitude}&hourly=precipitation_probability`);
      const data = await res.json();
      const rainProb = data.hourly.precipitation_probability[0];
      if (rainProb > 40) setWeatherAlert(`🌧 ${rainProb}% chance of rain mid-route. Drive carefully.`);
    } catch (e) {}
  };

  useEffect(() => {
    let sub: Location.LocationSubscription;
    if (isNavigating) {
      Location.watchPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 5
      }, (loc) => {
        setLocation(loc);
        const dist = getDistanceFromLatLonInKm(
          loc.coords.latitude,
          loc.coords.longitude,
          navTarget.latitude,
          navTarget.longitude,
        );
        setDistanceRemaining(dist);
        if (activeRoute) setEtaMin((dist / Math.max(activeRoute.distanceKm, 0.01)) * activeRoute.durationMin);

        if (activeRoute && activeRoute.steps && activeRoute.steps.length > activeStepIndex) {
          const currentStep = activeRoute.steps[activeStepIndex];
          const distToManeuver = getDistanceFromLatLonInKm(loc.coords.latitude, loc.coords.longitude, currentStep.maneuver.location[1], currentStep.maneuver.location[0]);
          if (distToManeuver < 0.05) { 
            const nextIdx = activeStepIndex + 1;
            if (nextIdx < activeRoute.steps.length) {
              setActiveStepIndex(nextIdx);
              if (voiceEnabled) {
                const nextStep = activeRoute.steps[nextIdx];
                const text = `${nextStep.maneuver.type} ${nextStep.maneuver.modifier?.replace('-', ' ') || ''} ${nextStep.name ? 'onto ' + nextStep.name : ''}`;
                Speech.speak(text);
              }
            }
          }
        }

        if (cameraFollows && mapRef.current) {
          mapRef.current.animateCamera({
            center: { latitude: loc.coords.latitude, longitude: loc.coords.longitude },
            heading: loc.coords.heading || 0, pitch: 60, zoom: 16
          });
        }

        // Full tour: arrive at destination → return home → then budget questions
        if (tourLeg === 'outbound' && dist < 0.1 && !destArrivalHandled.current) {
          destArrivalHandled.current = true;
          void startReturnLeg();
        } else if (
          tourLeg === 'returning' &&
          reachedDestination &&
          dist < 0.1 &&
          !returnArrivalHandled.current
        ) {
          returnArrivalHandled.current = true;
          if (voiceEnabled) Speech.speak(`Welcome back to ${sourceName}. Let's log your real trip budget.`);
          openBudgetQuiz();
        }
      }).then(s => sub = s);
    }
    return () => { if (sub) sub.remove(); }
  }, [
    isNavigating,
    activeRoute,
    activeStepIndex,
    cameraFollows,
    voiceEnabled,
    dest.name,
    sourceName,
    navTarget.latitude,
    navTarget.longitude,
    tourLeg,
    reachedDestination,
    startReturnLeg,
    openBudgetQuiz,
  ]);

  const handleStartTap = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false); // Clean up confetti
      setIsNavigating(true);
      setCameraFollows(true);
      if (activeRoute && voiceEnabled && activeRoute.steps[0]) {
        const step = activeRoute.steps[0];
        Speech.speak(`Starting route to ${dest.name}. Head ${step.maneuver.modifier || 'straight'}.`);
      }
    }, 500);
  };

  const getManeuverIcon = (type: string, modifier?: string) => {
    if (type === 'arrive') return 'flag';
    if (modifier?.includes('left')) return 'arrow-undo';
    if (modifier?.includes('right')) return 'arrow-redo';
    if (modifier?.includes('uturn')) return 'arrow-undo-circle';
    return 'arrow-up';
  };

  useEffect(() => {
    if (activeRoute && !isNavigating && mapRef.current) {
      mapRef.current.fitToCoordinates(activeRoute.geometry, { edgePadding: { top: 100, right: 50, bottom: 400, left: 50 }, animated: true });
    }
  }, [activeRoute, isNavigating]);

  if (isLoadingRoute) {
    return (
      <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={CLOUD.primary} />
        <Text style={{ marginTop: 16, color: CLOUD.muted }}>Calculating real route via OSRM...</Text>
      </View>
    );
  }

  const currentStep = activeRoute?.steps[activeStepIndex];
  const nextStep = activeRoute?.steps[activeStepIndex + 1];

  return (
    <View style={styles.root}>
      {/* HEADER */}
      {!isNavigating && (
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={24} color={CLOUD.ink} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{dest.name}</Text>
          <View style={styles.headerBtn}>
            <Ionicons name="share-outline" size={20} color={CLOUD.ink} />
          </View>
        </View>
      )}

      {/* TURN-BY-TURN TOP BANNER */}
      {isNavigating && currentStep && !arrived && (
        <Animated.View layout={Layout} entering={FadeInUp} style={[styles.tbtBanner, { paddingTop: insets.top + 16 }]}>
          <View style={styles.tbtRow}>
            <Ionicons name={getManeuverIcon(currentStep.maneuver.type, currentStep.maneuver.modifier) as any} size={48} color="#fff" style={{ marginRight: 16 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.tbtInstruction}>
                {currentStep.maneuver.type === 'arrive' ? 'Arriving at destination' : 
                 `${currentStep.maneuver.modifier ? currentStep.maneuver.modifier.replace('-', ' ') : 'Head straight'} ${currentStep.name ? 'onto ' + currentStep.name : ''}`.toUpperCase()}
              </Text>
              <Text style={styles.tbtDistance}>in {Math.round(currentStep.distance)} meters</Text>
            </View>
          </View>
          {nextStep && (
            <View style={styles.tbtNext}>
              <Text style={styles.tbtNextText}>Then {nextStep.maneuver.modifier?.replace('-', ' ')} {nextStep.name ? 'onto ' + nextStep.name : ''}</Text>
            </View>
          )}
        </Animated.View>
      )}

      {/* WEATHER ALERT */}
      {weatherAlert && !isNavigating && (
        <Animated.View entering={FadeInUp} style={[styles.alertBanner, { top: insets.top + 60 }]}>
          <Text style={styles.alertText}>{weatherAlert}</Text>
        </Animated.View>
      )}

      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          mapType="none" 
          onPanDrag={() => { if(isNavigating) setCameraFollows(false); }}
        >
          <UrlTile urlTemplate="https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png" maximumZ={19} />
          
          {activeRoute && <Polyline coordinates={activeRoute.geometry} strokeColor={activeRoute.routeColor} strokeWidth={6} />}
          {smartStops.map(stop => (
            <Marker key={stop.id} coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}>
              <View style={styles.poiMarker}><Text style={{fontSize: 14}}>{stop.emoji}</Text></View>
            </Marker>
          ))}
          {location && (
            <Marker coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }} anchor={{x: 0.5, y: 0.5}}>
              <View style={[styles.vehicleMarker, { transform: [{ rotate: `${location.coords.heading || 0}deg` }] }]}>
                <Ionicons name="navigate" size={20} color="#fff" />
              </View>
            </Marker>
          )}
          <Marker coordinate={{ latitude: dest.coordinates.latitude, longitude: dest.coordinates.longitude }}>
            <View style={styles.destMarker}><Text>🏔</Text></View>
          </Marker>
        </MapView>

        {isNavigating && !cameraFollows && (
          <Pressable style={styles.recenterBtn} onPress={() => setCameraFollows(true)}>
            <Ionicons name="navigate-outline" size={24} color={CLOUD.primary} />
            <Text style={{color: CLOUD.primary, fontWeight: '700', marginLeft: 8}}>Re-centre</Text>
          </Pressable>
        )}

        {isNavigating && (
          <Pressable style={styles.voiceBtn} onPress={() => setVoiceEnabled(!voiceEnabled)}>
            <Ionicons name={voiceEnabled ? "volume-high" : "volume-mute"} size={24} color={CLOUD.ink} />
          </Pressable>
        )}
      </View>

      {/* BOTTOM SHEET / CARDS */}
      {!isNavigating ? (
        <Animated.ScrollView 
          entering={FadeInUp.duration(400).springify()} 
          style={styles.bottomCard} 
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* MOOD SELECTOR */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodScroll}>
            {routeOptions.map(r => (
              <Animated.View key={r.mood}>
                <Pressable onPress={() => { setActiveMood(r.mood); setDistanceRemaining(r.distanceKm); setEtaMin(r.durationMin); Haptics.impactAsync(); }}>
                  {({ pressed }) => (
                    <Animated.View style={[
                      styles.moodChip, 
                      activeMood === r.mood && { borderColor: r.routeColor, backgroundColor: r.routeColor + '10' },
                      pressed && { transform: [{ scale: 0.95 }] }
                    ]}>
                      <Text style={styles.moodChipText}>{r.emoji} {r.label}</Text>
                    </Animated.View>
                  )}
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>

          {/* SOURCE -> DEST ROW */}
          <View style={styles.pathRow}>
            <View style={styles.pathNode}>
              <View style={[styles.dot, { backgroundColor: '#10B981', zIndex: 2 }]} />
              <Animated.View style={[styles.dotPulse, { backgroundColor: '#10B981' }, sourcePulseStyle]} />
              <Text style={styles.pathText} numberOfLines={1}>From: {sourceName}</Text>
            </View>
            <View style={styles.pathLine} />
            <View style={styles.pathNode}>
              <Animated.View style={[destDropStyle]}>
                <View style={[styles.dot, { backgroundColor: CLOUD.primary }]} />
              </Animated.View>
              <Text style={styles.pathText} numberOfLines={1}>To: {dest.name}</Text>
            </View>
          </View>

          {/* STATS WITH COUNT-UP */}
          <View style={styles.statsStrip}>
            <AnimatedNumber value={distanceRemaining} label="Distance" suffix="km" />
            <AnimatedNumber value={etaMin} label="Real ETA" isTime />
          </View>

          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handleStartTap} 
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>Start Live Navigation 🚀</Text>
          </TouchableOpacity>
          
          {/* CONFETTI BURST */}
          {showConfetti && (
            <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]} pointerEvents="none">
              {[...Array(20)].map((_, i) => (
                <Animated.View
                  key={i}
                  entering={FadeInUp.delay(i * 10).springify()}
                  style={{
                    position: 'absolute',
                    bottom: 60,
                    left: SCREEN_W / 2 + (Math.random() * 200 - 100),
                    width: 8, height: 8,
                    borderRadius: 4,
                    backgroundColor: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'][i % 4],
                    transform: [
                      { translateY: -(Math.random() * 150 + 50) },
                      { scale: Math.random() + 0.5 }
                    ]
                  }}
                />
              ))}
            </View>
          )}
        </Animated.ScrollView>
      ) : (
        <JourneyCompanionSheet
          isNavigating={isNavigating}
          destinationName={navTargetName}
          distanceRemaining={distanceRemaining}
          etaMin={etaMin}
          speed={Math.round((location?.coords?.speed || 0) * 3.6)}
          progressPct={Math.max(0, Math.min(1, 1 - (distanceRemaining / (activeRoute?.distanceKm || 1))))}
          tourLeg={tourLeg}
          onEndJourney={handleEndPress}
        />
      )}

      {phaseBanner && isNavigating ? (
        <View style={[styles.phaseBanner, { top: insets.top + 8 }]}>
          <Text style={styles.phaseBannerText}>{phaseBanner}</Text>
        </View>
      ) : null}

      {(celebrating) && (
        <Animated.View entering={FadeIn} style={[StyleSheet.absoluteFill, styles.arrivedOverlay]}>
          <View style={styles.arrivedBox}>
            <Text style={styles.arrivedTitle}>Crafting your journey story…</Text>
            <Text style={{ color: CLOUD.ink, marginBottom: 8 }}>{dest.name}</Text>
          </View>
        </Animated.View>
      )}

      <TourBudgetQuiz
        visible={showBudgetQuiz}
        estimatedBudgetInr={estimatedBudgetInr}
        destinationName={dest.name}
        onComplete={(costs) => openJourneyStory(costs)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#E2E8F0', zIndex: 10 },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: CLOUD.ink },
  bottomCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, ...CLOUD.shadows.card },
  moodScroll: { gap: 8, paddingBottom: 16 },
  moodChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#fff', borderWidth: 2, borderColor: '#E2E8F0' },
  moodChipText: { fontSize: 14, fontWeight: '600', color: CLOUD.ink },
  
  pathRow: { marginVertical: 16, paddingHorizontal: 8 },
  pathNode: { flexDirection: 'row', alignItems: 'center', height: 24 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  dotPulse: { position: 'absolute', width: 12, height: 12, borderRadius: 6, left: 0 },
  pathLine: { width: 2, height: 20, backgroundColor: '#E2E8F0', marginLeft: 5, marginVertical: 2 },
  pathText: { fontSize: 15, fontWeight: '600', color: CLOUD.ink, flex: 1 },

  statsStrip: { flexDirection: 'row', paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E2E8F0', marginBottom: 24 },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: CLOUD.ink },
  statLabel: { fontSize: 12, fontWeight: '600', color: CLOUD.muted, marginTop: 4 },
  
  primaryBtn: { backgroundColor: CLOUD.primary, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', width: '100%' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  poiMarker: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...CLOUD.shadows.card, borderWidth: 1, borderColor: '#E2E8F0' },
  vehicleMarker: { width: 44, height: 44, backgroundColor: '#2563EB', borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff', ...CLOUD.shadows.card },
  destMarker: { width: 36, height: 36, backgroundColor: '#fff', borderRadius: 18, alignItems: 'center', justifyContent: 'center', ...CLOUD.shadows.card },
  alertBanner: { position: 'absolute', left: 16, right: 16, backgroundColor: '#fff', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: CLOUD.warning, zIndex: 100, ...CLOUD.shadows.card },
  alertText: { fontSize: 14, fontWeight: '600', color: CLOUD.ink },
  
  tbtBanner: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#0F172A', padding: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, zIndex: 20, ...CLOUD.shadows.card },
  tbtRow: { flexDirection: 'row', alignItems: 'center' },
  tbtInstruction: { fontSize: 24, fontWeight: '800', color: '#fff', lineHeight: 32 },
  tbtDistance: { fontSize: 18, color: '#94A3B8', fontWeight: '600', marginTop: 4 },
  tbtNext: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: '#334155' },
  tbtNextText: { color: '#CBD5E1', fontSize: 15, fontWeight: '500' },
  
  navBottomBar: { backgroundColor: '#fff', padding: 24, paddingBottom: 40, borderTopLeftRadius: 24, borderTopRightRadius: 24, flexDirection: 'row', alignItems: 'center', ...CLOUD.shadows.card },
  navCloseBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  navBottomTime: { fontSize: 28, fontWeight: '800', color: CLOUD.primary },
  navBottomStats: { fontSize: 15, fontWeight: '600', color: CLOUD.muted, marginTop: 4 },
  
  recenterBtn: { position: 'absolute', bottom: 140, left: '50%', marginLeft: -60, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, ...CLOUD.shadows.card },
  voiceBtn: { position: 'absolute', bottom: 140, right: 16, width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...CLOUD.shadows.card },

  arrivedOverlay: { backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  arrivedBox: { backgroundColor: '#fff', padding: 32, borderRadius: 24, width: '80%', alignItems: 'center' },
  arrivedTitle: { fontSize: 24, fontWeight: '800', color: '#166534', marginBottom: 8 },
  phaseBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 30,
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  phaseBannerText: { color: '#fff', fontWeight: '700', fontSize: 13, textAlign: 'center' },
});
