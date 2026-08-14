import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CLOUD, tabBarBottomPad } from '@/constants/cloudTheme';
import { useThemeStore } from '@/store/themeStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';

const ICONS: Record<string, { on: keyof typeof Ionicons.glyphMap; off: keyof typeof Ionicons.glyphMap }> = {
  index: { on: 'home', off: 'home-outline' },
  explore: { on: 'compass', off: 'compass-outline' },
  ai: { on: 'sparkles', off: 'sparkles-outline' },
  saved: { on: 'heart', off: 'heart-outline' },
  profile: { on: 'person', off: 'person-outline' },
};

/**
 * Custom tab bar — height comes from content + device safe inset
 * (iPhone home indicator, Android gesture/3-button, web).
 * No fixed height, so labels are never clipped.
 */
export function SafeTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeStore((s) => s.colors);
  const padBottom = tabBarBottomPad(insets.bottom);

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: padBottom,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        if (route.name === 'plan' || (options as { href?: unknown }).href === null) return null;

        const focused = state.index === index;
        const label =
          typeof options.title === 'string'
            ? options.title
            : route.name === 'index'
              ? 'Home'
              : route.name;
        const icons = ICONS[route.name] || { on: 'ellipse', off: 'ellipse-outline' };
        const color = focused ? colors.primary : colors.muted;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            }}
            style={styles.item}
          >
            <Ionicons name={focused ? icons.on : icons.off} size={22} color={color} />
            <Text
              style={[styles.label, { color }]}
              numberOfLines={1}
              allowFontScaling={false}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Standalone bar used on AI-flow screens (not inside Tabs). */
export function BottomTabBar({ activeTab = 'Explore' }: { activeTab?: string }) {
  const insets = useSafeAreaInsets();
  const colors = useThemeStore((s) => s.colors);
  const router = useRouter();
  const padBottom = tabBarBottomPad(insets.bottom);

  const tabs = [
    { name: 'Home', route: '/(app)/(tabs)', icon: ICONS.index },
    { name: 'Explore', route: '/(app)/(tabs)/explore', icon: ICONS.explore },
    { name: 'AI', route: '/(app)/(tabs)/ai', icon: ICONS.ai },
    { name: 'Saved', route: '/(app)/(tabs)/saved', icon: ICONS.saved },
    { name: 'Profile', route: '/(app)/(tabs)/profile', icon: ICONS.profile },
  ] as const;

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: padBottom,
        },
      ]}
    >
      {tabs.map((tab) => {
        const focused = tab.name === activeTab;
        const color = focused ? colors.primary : colors.muted;
        return (
          <Pressable
            key={tab.name}
            style={styles.item}
            onPress={() => router.navigate(tab.route as never)}
          >
            <Ionicons name={focused ? tab.icon.on : tab.icon.off} size={22} color={color} />
            <Text style={[styles.label, { color }]} numberOfLines={1} allowFontScaling={false}>
              {tab.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    ...CLOUD.shadows.card,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minHeight: 44,
    paddingVertical: 4,
  },
  label: {
    fontFamily: CLOUD.fonts.body,
    fontSize: 10,
    fontWeight: '600',
  },
});
