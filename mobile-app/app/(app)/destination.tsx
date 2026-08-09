import React from 'react';
import { StyleSheet, Text, View, Pressable, ImageBackground, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CLOUD } from '@/constants/cloudTheme';
import { mockPlaces } from '@/mocks/places';
import Svg, { Polyline, Circle as SvgCircle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DestinationIntelligenceScreen() {
  const router = useRouter();
  const { placeId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const place = mockPlaces.find(p => p.id === placeId);
  const destinationName = place?.name || 'Destination';
  const region = place?.region || 'Unknown Region';

  // Mock data for the destination intelligence since we don't have a real API
  const mockWeather = { temp: '24°C', condition: 'Sunny' };
  const mockDistance = '340 km';
  const mockCost = '₹4,500';
  const mockTime = '6h 30m';
  const mockHeroImage = 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=800&auto=format&fit=crop'; // A generic nice landscape

  const StatBlock = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
    <View style={styles.statBlock}>
      <View style={styles.statIconWrap}>
        <Ionicons name={icon} size={20} color={CLOUD.primary} />
      </View>
      <View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Hero Image Header */}
        <ImageBackground source={{ uri: mockHeroImage }} style={styles.hero}>
          <View style={[styles.heroOverlay, { paddingTop: Math.max(insets.top, 20) }]}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={CLOUD.ink} />
            </Pressable>
            <View style={styles.heroTitleWrap}>
              <Text style={styles.heroTitle}>{destinationName}</Text>
              <Text style={styles.heroRegion}>{region}</Text>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Overview</Text>
          
          <View style={styles.statsGrid}>
            <StatBlock icon="thermometer-outline" label="Weather" value={`${mockWeather.temp}, ${mockWeather.condition}`} />
            <StatBlock icon="location-outline" label="Distance" value={mockDistance} />
            <StatBlock icon="wallet-outline" label="Est. Cost" value={mockCost} />
            <StatBlock icon="time-outline" label="Travel Time" value={mockTime} />
          </View>

          <Text style={styles.sectionTitle}>Route Map</Text>
          
          {/* Mock Map View using a soft colored background and SVG polyline */}
          <View style={styles.mapContainer}>
            <View style={styles.mockMapBg}>
              <Svg height="100%" width="100%" viewBox="0 0 100 100">
                <Polyline
                  points="15,85 30,60 50,70 75,30 85,15"
                  fill="none"
                  stroke={CLOUD.primary}
                  strokeWidth="3"
                  strokeDasharray="4 4"
                />
                {/* Start Pin */}
                <SvgCircle cx="15" cy="85" r="4" fill={CLOUD.ink} />
                {/* End Pin */}
                <SvgCircle cx="85" cy="15" r="5" fill={CLOUD.primary} />
              </Svg>
              <View style={styles.mapLabels}>
                <Text style={styles.mapLabel}>Current Location</Text>
                <Text style={[styles.mapLabel, { color: CLOUD.primary, fontWeight: '700' }]}>{destinationName}</Text>
              </View>
            </View>
            
            <Pressable style={styles.navigateBtn}>
              <Ionicons name="navigate" size={18} color="#FFFFFF" />
              <Text style={styles.navigateText}>Navigate</Text>
            </Pressable>
          </View>
          
          <View style={{ height: 60 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CLOUD.bg,
  },
  hero: {
    width: '100%',
    height: 320,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    padding: CLOUD.pad,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...CLOUD.shadow,
  },
  heroTitleWrap: {
    marginBottom: 20,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroRegion: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: CLOUD.pad,
    marginTop: -20,
    backgroundColor: CLOUD.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: CLOUD.ink,
    marginTop: 20,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBlock: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: CLOUD.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: CLOUD.muted,
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    color: CLOUD.ink,
    fontWeight: '700',
  },
  mapContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  mockMapBg: {
    width: '100%',
    height: 160,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mapLabels: {
    ...StyleSheet.absoluteFillObject,
    padding: 12,
    justifyContent: 'space-between',
  },
  mapLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: CLOUD.ink,
  },
  navigateBtn: {
    backgroundColor: CLOUD.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: CLOUD.buttons.height,
    borderRadius: CLOUD.radii.button,
    gap: 8,
  },
  navigateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
