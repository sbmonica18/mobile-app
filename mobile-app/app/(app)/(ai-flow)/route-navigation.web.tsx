import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CLOUD } from '@/constants/cloudTheme';
import { mockDestinations } from '@/mocks/destinations';

export default function RouteNavigationScreenWeb() {
  const insets = useSafeAreaInsets();
  const { destinationId, name: spotName } = useLocalSearchParams<{
    destinationId: string;
    name?: string;
  }>();
  const catalogDest = mockDestinations.find((d) => d.id === destinationId) || mockDestinations[0];
  const title = (Array.isArray(spotName) ? spotName[0] : spotName)?.trim() || catalogDest?.name;

  return (
    <View style={styles.root}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={CLOUD.ink} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerBtn}>
          <Ionicons name="share-outline" size={20} color={CLOUD.ink} />
        </View>
      </View>

      <View style={styles.centerContainer}>
        <Ionicons name="compass-outline" size={64} color={CLOUD.muted} style={{ marginBottom: 16 }} />
        <Text style={styles.title}>Live Navigation Unavailable</Text>
        <Text style={styles.subtitle}>
          The real-time Map and GPS tracking features are designed exclusively for mobile devices. 
        </Text>
        <Text style={styles.subtitle}>
          Please open this app on your physical iOS or Android phone using Expo Go to experience Phase 5!
        </Text>
        
        <Pressable onPress={() => router.back()} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Go Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 10,
  },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: CLOUD.ink },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: CLOUD.ink,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: CLOUD.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  primaryBtn: { 
    backgroundColor: CLOUD.primary, 
    height: 48, 
    borderRadius: 24, 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: 24
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
