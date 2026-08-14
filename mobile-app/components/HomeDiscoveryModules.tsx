import { CLOUD } from '@/constants/cloudTheme';
import { useAiFlowStore } from '@/store/aiFlowStore';
import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

type Module = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  mood?: string;
};

const MODULES: Module[] = [
  {
    id: 'perfect-now',
    icon: 'sunny-outline',
    title: 'Perfect right now',
    subtitle: 'Scenic spots within reach →',
    mood: 'scenic',
  },
  {
    id: 'near-you',
    icon: 'navigate-outline',
    title: 'Near you',
    subtitle: 'Places worth exploring nearby →',
    mood: 'nearby',
  },
  {
    id: 'weekend',
    icon: 'sparkles',
    title: 'Weekend idea',
    subtitle: 'Short getaways · AI matched →',
    mood: 'weekend',
  },
];

/** Compact discovery modules — not dashboards. */
export function HomeDiscoveryModules() {
  const setFilters = useAiFlowStore((s) => s.setFilters);
  const resetFilters = useAiFlowStore((s) => s.resetFilters);

  const open = (mood?: string) => {
    resetFilters();
    if (mood) setFilters({ mood });
    router.push('/(app)/(ai-flow)/destination-showcase' as Href);
  };

  return (
    <Animated.View entering={FadeInUp.delay(120).duration(420)} style={styles.wrap}>
      <Text style={styles.heading}>Discover</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {MODULES.map((m) => (
          <Pressable
            key={m.id}
            onPress={() => open(m.mood)}
            style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.97 }] }]}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name={m.icon}
                size={16}
                color={m.id === 'weekend' ? CLOUD.aiAccent : CLOUD.primary}
              />
            </View>
            <Text style={styles.title}>{m.title}</Text>
            <Text style={styles.sub}>{m.subtitle}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  heading: {
    fontSize: 16,
    fontWeight: '800',
    color: CLOUD.ink,
  },
  row: { gap: 10, paddingRight: 8 },
  card: {
    width: 168,
    backgroundColor: CLOUD.card,
    borderRadius: CLOUD.radii.card,
    borderWidth: 1,
    borderColor: CLOUD.border,
    padding: 14,
    gap: 6,
    ...CLOUD.shadows.card,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: CLOUD.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  title: { fontSize: 14, fontWeight: '800', color: CLOUD.ink },
  sub: { fontSize: 12, lineHeight: 16, color: CLOUD.muted, fontWeight: '600' },
});
