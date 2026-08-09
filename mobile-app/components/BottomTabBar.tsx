import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CLOUD } from '@/constants/cloudTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const TABS = [
  { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: '/(app)/(tabs)' },
  { name: 'Explore', icon: 'compass-outline', activeIcon: 'compass', route: '/(app)/(tabs)/explore' },
  { name: 'AI', icon: 'sparkles-outline', activeIcon: 'sparkles', route: '/(app)/(tabs)/ai' },
  { name: 'Saved', icon: 'heart-outline', activeIcon: 'heart', route: '/(app)/(tabs)/saved' },
  { name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: '/(app)/(tabs)/profile' },
];

export function BottomTabBar({ activeTab = 'Explore' }: { activeTab?: string }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      {TABS.map((tab) => {
        const isActive = tab.name === activeTab;
        return (
          <Pressable
            key={tab.name}
            style={styles.tabItem}
            onPress={() => router.navigate(tab.route as any)}
          >
            <Ionicons
              name={isActive ? (tab.activeIcon as any) : (tab.icon as any)}
              size={24}
              color={isActive ? CLOUD.primary : CLOUD.muted}
            />
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: CLOUD.navH,
    paddingTop: 8,
    backgroundColor: CLOUD.card,
    borderTopColor: CLOUD.border,
    borderTopWidth: 1,
    ...CLOUD.shadows.card,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 4,
  },
  tabText: {
    fontFamily: CLOUD.fonts.body,
    fontSize: 11,
    fontWeight: '600',
    color: CLOUD.muted,
  },
  tabTextActive: {
    color: CLOUD.primary,
  },
});
