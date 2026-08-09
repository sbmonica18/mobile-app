import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAiFlowStore } from '@/store/aiFlowStore';
import { CLOUD } from '@/constants/cloudTheme';
import { router, Href } from 'expo-router';

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const savedDestinations = useAiFlowStore((s) => s.savedDestinations);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {savedDestinations.length === 0 ? (
          <Text style={styles.empty}>You have no saved destinations yet.</Text>
        ) : (
          savedDestinations.map(d => (
            <Pressable key={d.id} style={styles.card} onPress={() => router.push(`/(app)/(ai-flow)/destination/${d.id}` as Href)}>
              <Image source={{ uri: d.thumbnail }} style={styles.img} />
              <View style={styles.info}>
                <Text style={styles.name}>{d.name}</Text>
                <Text style={styles.score}>{d.matchScore}% Match</Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: CLOUD.bg },
  header: { paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '800', color: CLOUD.ink },
  list: { padding: 20, gap: 16 },
  empty: { color: CLOUD.muted, textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', ...CLOUD.shadows.card },
  img: { width: 100, height: 100 },
  info: { padding: 16, justifyContent: 'center' },
  name: { fontSize: 18, fontWeight: '700', color: CLOUD.ink },
  score: { fontSize: 14, color: CLOUD.primary, fontWeight: '600', marginTop: 4 },
});
