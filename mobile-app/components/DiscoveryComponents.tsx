import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, Dimensions, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { CLOUD } from '@/constants/cloudTheme';
import { INTENT_CATEGORIES } from '@/data/intentCategories';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// ----------------------------------------------------
// 1. Suggestions Row (Minimal entry points)
// ----------------------------------------------------
export function SuggestionsRow() {
  const router = useRouter();

  const suggestions = [
    { id: 'nature', label: 'Nature', icon: 'leaf' },
    { id: 'drives', label: 'Scenic', icon: 'car' },
    { id: 'food', label: 'Food', icon: 'restaurant' },
    { id: 'photography', label: 'Photo', icon: 'camera' },
    { id: 'heritage', label: 'Heritage', icon: 'business' },
  ];

  return (
    <View style={styles.section}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, paddingHorizontal: CLOUD.pad }}>
        Suggestions
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: CLOUD.pad, gap: 12 }}>
        {suggestions.map((s) => (
          <Pressable
            key={s.id}
            style={({ pressed }) => [
              { alignItems: 'center', gap: 6 },
              pressed && { opacity: 0.7 }
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/(app)/(tabs)/explore?category=${s.id}`);
            }}
          >
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
              <Ionicons name={s.icon as any} size={24} color={CLOUD.primary} />
            </View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#475569' }}>{s.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// ----------------------------------------------------
// 2. AI Intent Builder Modal
// ----------------------------------------------------
export function IntentBuilderModal({ 
  visible, 
  onClose,
  onGenerate 
}: { 
  visible: boolean;
  onClose: () => void;
  onGenerate: (intent: string) => void;
}) {
  const experiences = [
    { id: 'nature', icon: '🌿', title: 'Nature Escape', desc: 'Fresh air, lakes, forests' },
    { id: 'scenic', icon: '🚗', title: 'Scenic Drive', desc: 'Beautiful highways' },
    { id: 'photo', icon: '📸', title: 'Photography', desc: 'Golden hour locations' },
    { id: 'family', icon: '👨‍👩‍👧', title: 'Family Day Out', desc: 'Family friendly spots' },
    { id: 'food', icon: '🍜', title: 'Food Trail', desc: 'Local cuisine & street food' },
    { id: 'heritage', icon: '🏛', title: 'Heritage', desc: 'Historic places & ruins' },
    { id: 'adventure', icon: '🏕', title: 'Adventure', desc: 'Trekking & camping' },
    { id: 'sunrise', icon: '🌅', title: 'Sunrise Journey', desc: 'Best early morning views' },
    { id: 'sunset', icon: '🌇', title: 'Sunset Route', desc: 'Evening viewpoints' },
    { id: 'shopping', icon: '🛍', title: 'Shopping Trail', desc: 'Local markets & boutiques' },
    { id: 'culture', icon: '🎭', title: 'Cultural', desc: 'Art, music & traditions' },
    { id: 'hidden', icon: '💎', title: 'Hidden Gems', desc: 'Off the beaten path' },
    { id: 'coastal', icon: '🌊', title: 'Coastal Escape', desc: 'Beaches & sea breeze' },
    { id: 'forest', icon: '🌲', title: 'Forest Retreat', desc: 'Deep woods & cabins' },
    { id: 'cafe', icon: '☕', title: 'Cafe Discovery', desc: 'Best coffee & aesthetics' },
    { id: 'outdoor', icon: '🚲', title: 'Outdoor', desc: 'Cycling & activities' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalDismiss} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose your experience</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#0F172A" />
            </Pressable>
          </View>
          
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }}>
              {experiences.map((exp) => (
                <Pressable
                  key={exp.id}
                  style={({ pressed }) => [
                    {
                      width: (width - 44) / 2, // 2 column accounting for padding and gap
                      backgroundColor: '#F8FAFC',
                      padding: 16,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                    },
                    pressed && { backgroundColor: '#F1F5F9', opacity: 0.9 }
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onGenerate(exp.id);
                    onClose();
                  }}
                >
                  <Text style={{ fontSize: 28, marginBottom: 12 }}>{exp.icon}</Text>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 4 }}>
                    {exp.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#64748B', lineHeight: 16 }}>
                    {exp.desc}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
  },
  carouselContent: {
    paddingHorizontal: CLOUD.pad,
    gap: 16,
  },
  imageCard: {
    width: 240,
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    ...CLOUD.shadow,
  },
  imageCardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  imageCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  imageCardSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: height * 0.75,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  builderRow: {},
  builderLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  builderChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  builderChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  builderChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  builderChipTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  generateBtn: {
    backgroundColor: '#7C3AED',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  picksCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    ...CLOUD.shadow,
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pickMedal: {
    fontSize: 28,
  },
  pickName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  pickReason: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  pickScoreBox: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pickScoreText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 13,
  },
  pickDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
});

// ----------------------------------------------------
// 3. Daily AI Picks
// ----------------------------------------------------
export function DailyAiPicks() {
  const picks = [
    { name: 'Ooty', match: 95, medal: '🥇', reason: 'Perfect weather • Excellent AQI' },
    { name: 'Munnar', match: 92, medal: '🥈', reason: 'Light traffic • Cool climate' },
    { name: 'Hampi', match: 89, medal: '🥉', reason: 'Historic sites • Comfortable temp' }
  ];

  return (
    <View style={styles.section}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A' }}>✨ Today's AI Picks</Text>
      </View>
      <View style={styles.picksCard}>
        {picks.map((p, i) => (
          <View key={p.name}>
            <View style={styles.pickRow}>
              <Text style={styles.pickMedal}>{p.medal}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.pickName}>{p.name}</Text>
                <Text style={styles.pickReason}>{p.reason}</Text>
              </View>
              <View style={styles.pickScoreBox}>
                <Text style={styles.pickScoreText}>{p.match}% Match</Text>
              </View>
            </View>
            {i < picks.length - 1 && <View style={styles.pickDivider} />}
          </View>
        ))}
      </View>
    </View>
  );
}
