import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAiFlowStore } from '@/store/aiFlowStore';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import { CLOUD, layoutPad } from '@/constants/cloudTheme';
import { useThemeStore } from '@/store/themeStore';
import { router, Href } from 'expo-router';

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const savedDestinations = useAiFlowStore((s) => s.savedDestinations);
  const priorByDestination = useIntelligenceStore((s) => s.priorByDestination);
  const colors = useThemeStore((s) => s.colors);
  const { width } = useWindowDimensions();
  const pad = layoutPad(width);

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingHorizontal: pad }]}>
        <Text style={[styles.title, { color: colors.ink }]}>Saved</Text>
        <Text style={[styles.sub, { color: colors.muted }]}>Bookmarks with living intelligence</Text>
      </View>
      <ScrollView contentContainerStyle={[styles.list, { paddingHorizontal: pad }]}>
        {savedDestinations.length === 0 ? (
          <Text style={styles.empty}>You have no saved destinations yet.</Text>
        ) : (
          savedDestinations.map((d) => {
            const prior = priorByDestination[d.id];
            return (
              <Pressable
                key={d.id}
                style={[styles.card, { backgroundColor: colors.card }]}
                onPress={() => router.push(`/(app)/(ai-flow)/destination/${d.id}` as Href)}
              >
                <Image source={{ uri: d.thumbnail }} style={styles.img} />
                <View style={styles.info}>
                  <Text style={[styles.name, { color: colors.ink }]}>{d.name}</Text>
                  <Text style={[styles.score, { color: colors.primary }]}>{d.matchScore}% Match</Text>
                  {prior ? (
                    <Text style={styles.changed} numberOfLines={2}>
                      Since you saved this: {prior.interpretation}
                    </Text>
                  ) : (
                    <Text style={styles.changed}>Tap to re-evaluate with UrbanLens Now</Text>
                  )}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: CLOUD.bg },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#fff',
  },
  title: { fontSize: 24, fontWeight: '800', color: CLOUD.ink },
  sub: { fontSize: 12, color: CLOUD.muted, marginTop: 2, fontWeight: '600' },
  list: { paddingVertical: 20, gap: 16 },
  img: { width: 88, height: 88 },
  info: { flex: 1, minWidth: 0, padding: 12, justifyContent: 'center' },
  empty: { color: CLOUD.muted, textAlign: 'center', marginTop: 40 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    ...CLOUD.shadows.card,
  },
  name: { fontSize: 18, fontWeight: '700', color: CLOUD.ink },
  score: { fontSize: 14, color: CLOUD.primary, fontWeight: '600', marginTop: 4 },
  changed: { fontSize: 12, color: CLOUD.aiAccent, marginTop: 6, lineHeight: 16, fontWeight: '600' },
});
