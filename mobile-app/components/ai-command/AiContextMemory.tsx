import { CLOUD } from '@/constants/cloudTheme';
import {
  BUDGETS,
  TIME_OPTIONS,
  TRAVEL_STYLES,
  TRANSPORT_MODES,
} from '@/mocks/intentOptions';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export type AiContextData = {
  city: string;
  weather: string;
  vehicle: string;
  budget: string;
  timing: string;
  company: string;
};

type EditableKey = 'budget' | 'timing' | 'company' | 'vehicle';

type ContextProps = {
  data: AiContextData;
  onChange?: (patch: Partial<AiContextData>) => void;
};

const PICKER_OPTIONS: Record<EditableKey, readonly string[]> = {
  budget: BUDGETS,
  timing: ['Weekend', ...TIME_OPTIONS],
  company: TRAVEL_STYLES,
  vehicle: TRANSPORT_MODES,
};

const PICKER_TITLES: Record<EditableKey, string> = {
  budget: 'Budget',
  timing: 'Time',
  company: 'Travel style',
  vehicle: 'Transport',
};

function formatBudgetLabel(value: string): string {
  if (/budget/i.test(value)) return value;
  return `${value} Budget`;
}

export const AiContextCard = memo(function AiContextCard({ data, onChange }: ContextProps) {
  const [editing, setEditing] = useState<EditableKey | null>(null);

  const chips = useMemo(
    () =>
      [
        { key: 'city' as const, icon: 'location-outline' as const, label: data.city, editable: false },
        {
          key: 'weather' as const,
          icon: 'partly-sunny-outline' as const,
          label: data.weather,
          editable: false,
        },
        {
          key: 'vehicle' as const,
          icon: 'bicycle-outline' as const,
          label: data.vehicle,
          editable: true,
        },
        {
          key: 'budget' as const,
          icon: 'wallet-outline' as const,
          label: data.budget,
          editable: true,
        },
        {
          key: 'timing' as const,
          icon: 'calendar-outline' as const,
          label: data.timing,
          editable: true,
        },
        {
          key: 'company' as const,
          icon: 'people-outline' as const,
          label: data.company,
          editable: true,
        },
      ] as const,
    [data],
  );

  const applyOption = (key: EditableKey, value: string) => {
    const patch: Partial<AiContextData> =
      key === 'budget'
        ? { budget: formatBudgetLabel(value) }
        : key === 'timing'
          ? { timing: value }
          : key === 'company'
            ? { company: value }
            : { vehicle: value };
    onChange?.(patch);
    setEditing(null);
  };

  return (
    <Animated.View entering={FadeInUp.delay(160).duration(450)} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Current Context</Text>
      </View>
      <View style={styles.chips}>
        {chips.map((c) => {
          const ChipWrap = c.editable ? Pressable : View;
          return (
            <ChipWrap
              key={c.key}
              style={styles.chip}
              onPress={c.editable ? () => setEditing(c.key) : undefined}
              accessibilityRole={c.editable ? 'button' : undefined}
              accessibilityLabel={c.editable ? `Edit ${c.key}` : undefined}
            >
              <Ionicons name={c.icon} size={13} color={CLOUD.primary} />
              <Text style={styles.chipText}>{c.label}</Text>
              {c.editable ? (
                <Ionicons name="chevron-down" size={12} color={CLOUD.muted} />
              ) : null}
            </ChipWrap>
          );
        })}
      </View>

      <Modal
        visible={editing != null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditing(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setEditing(null)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>
              {editing ? PICKER_TITLES[editing] : ''}
            </Text>
            <View style={styles.optionWrap}>
              {(editing ? PICKER_OPTIONS[editing] : []).map((opt) => (
                <Pressable
                  key={opt}
                  style={styles.optionChip}
                  onPress={() => editing && applyOption(editing, opt)}
                >
                  <Text style={styles.optionText}>{opt}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.cancelBtn} onPress={() => setEditing(null)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </Animated.View>
  );
});

type MemoryProps = {
  places: string[];
  onSelect: (name: string) => void;
};

export const AiMemorySection = memo(function AiMemorySection({ places, onSelect }: MemoryProps) {
  if (places.length === 0) return null;

  return (
    <Animated.View entering={FadeInUp.delay(280).duration(450)} style={styles.memory}>
      <Text style={styles.title}>Recently planned</Text>
      <View style={styles.memoryScrollWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={156}
          contentContainerStyle={styles.memoryRow}
        >
          {places.map((name, i) => (
            <Animated.View key={name} entering={FadeInUp.delay(180 + i * 50).duration(360)}>
              <Pressable style={styles.memoryCard} onPress={() => onSelect(name)}>
                <Ionicons name="time-outline" size={14} color={CLOUD.aiAccent} />
                <Text style={styles.memoryText} numberOfLines={1}>
                  {name}
                </Text>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(247,249,252,0.98)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.fadeLeft}
        />
        <LinearGradient
          pointerEvents="none"
          colors={['transparent', 'rgba(247,249,252,0.98)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.fadeRight}
        />
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: CLOUD.card,
    borderRadius: CLOUD.radii.card,
    padding: CLOUD.cardPad,
    borderWidth: 1,
    borderColor: CLOUD.border,
    ...CLOUD.shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: CLOUD.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: CLOUD.soft,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  chipText: {
    color: CLOUD.body,
    fontSize: 12,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: CLOUD.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 28,
    gap: 14,
  },
  sheetTitle: {
    color: CLOUD.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    backgroundColor: CLOUD.lightBlue,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  optionText: {
    color: CLOUD.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  cancelBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: CLOUD.muted,
    fontWeight: '600',
  },
  memory: {
    gap: 12,
  },
  memoryScrollWrap: {
    position: 'relative',
  },
  memoryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 2,
    paddingRight: 20,
  },
  fadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 18,
  },
  fadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 22,
  },
  memoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: CLOUD.card,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: CLOUD.border,
    width: 148,
    ...CLOUD.shadows.search,
  },
  memoryText: {
    color: CLOUD.ink,
    fontWeight: '700',
    fontSize: 13,
    flex: 1,
  },
});
