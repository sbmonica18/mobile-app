import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CLOUD } from '@/constants/cloudTheme';
import { ExperienceCategory } from '@/mocks/experienceCategories';
import { BUDGETS, TIME_OPTIONS } from '@/mocks/intentOptions';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Href, useRouter } from 'expo-router';

const MONTHS = ['Anytime', 'This Month', 'Next Month', 'Within 3 Months'];

type Props = {
  category: ExperienceCategory;
  onClose: () => void;
};

export function ExperienceRefineSheet({ category, onClose }: Props) {
  const [selectedMonth, setSelectedMonth] = useState('Anytime');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const router = useRouter();
  const poolSize = category.destinationIds?.length || category.placesCount || 0;

  const handleSubmit = () => {
    onClose();
    const params = new URLSearchParams();
    params.append('categoryId', category.id);
    if (selectedTime) params.append('time', selectedTime);
    if (selectedBudget) params.append('budget', selectedBudget);

    router.push(`/(app)/(ai-flow)/recommendations?${params.toString()}` as Href);
  };

  const OptionChip = ({
    label,
    selected,
    onSelect,
  }: {
    label: string;
    selected: boolean;
    onSelect: () => void;
  }) => (
    <Pressable style={[styles.chip, selected && styles.chipSelected]} onPress={onSelect}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <Animated.View
          entering={SlideInDown.springify().damping(18).stiffness(200)}
          exiting={SlideOutDown}
          style={styles.sheet}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name={category.icon as any} size={20} color={CLOUD.ink} />
              <View>
                <Text style={styles.title}>{category.label}</Text>
                <Text style={styles.poolHint}>{poolSize} fixed places in this experience</Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={CLOUD.muted} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionTitle}>When</Text>
            <View style={styles.optionsWrap}>
              {MONTHS.map((m) => (
                <OptionChip
                  key={m}
                  label={m}
                  selected={selectedMonth === m}
                  onSelect={() => setSelectedMonth(m)}
                />
              ))}
            </View>

            <Text style={styles.sectionTitle}>Time available</Text>
            <View style={styles.optionsWrap}>
              {TIME_OPTIONS.map((t) => (
                <OptionChip
                  key={t}
                  label={t}
                  selected={selectedTime === t}
                  onSelect={() => setSelectedTime(selectedTime === t ? null : t)}
                />
              ))}
            </View>

            <Text style={styles.sectionTitle}>Budget</Text>
            <View style={styles.optionsWrap}>
              {BUDGETS.map((b) => (
                <OptionChip
                  key={b}
                  label={b}
                  selected={selectedBudget === b}
                  onSelect={() => setSelectedBudget(selectedBudget === b ? null : b)}
                />
              ))}
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>Show Matches</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: CLOUD.ink,
  },
  poolHint: {
    fontSize: 12,
    color: CLOUD.muted,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: CLOUD.ink,
    marginBottom: 12,
    marginTop: 8,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: CLOUD.primary + '15',
    borderColor: CLOUD.primary,
  },
  chipText: {
    color: CLOUD.muted,
    fontWeight: '600',
    fontSize: 14,
  },
  chipTextSelected: {
    color: CLOUD.primary,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  submitBtn: {
    backgroundColor: CLOUD.ink,
    height: CLOUD.buttons.height,
    borderRadius: CLOUD.radii.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
