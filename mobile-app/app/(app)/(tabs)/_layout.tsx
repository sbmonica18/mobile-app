import { CLOUD } from '@/constants/cloudTheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

function AnimatedIcon({ name, focused, color, size }: { name: any; focused: boolean; color: string; size: number }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.15 : 1, {
      mass: 1,
      damping: 10,
      stiffness: 200,
    });
  }, [focused, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <Ionicons name={name} color={color} size={size} />
    </Animated.View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: true,
        tabBarStyle: {
          height: CLOUD.navH,
          paddingTop: 8,
          paddingBottom: 14,
          backgroundColor: CLOUD.card,
          borderTopColor: CLOUD.border,
          borderTopWidth: 1,
          ...CLOUD.shadows.card,
        },
        tabBarActiveTintColor: CLOUD.primary,
        tabBarInactiveTintColor: CLOUD.muted,
        tabBarLabelStyle: {
          fontFamily: CLOUD.fonts.body,
          fontSize: 11,
          fontWeight: '600',
        },
        sceneStyle: { backgroundColor: CLOUD.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedIcon name={focused ? "home" : "home-outline"} focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedIcon name={focused ? "compass" : "compass-outline"} focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedIcon name={focused ? "sparkles" : "sparkles-outline"} focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedIcon name={focused ? "heart" : "heart-outline"} focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedIcon name={focused ? "person" : "person-outline"} focused={focused} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
