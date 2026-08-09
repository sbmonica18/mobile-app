import { CLOUD } from '@/constants/cloudTheme';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export type TourActualCosts = {
  totalSpendInr: number;
  fuelCostInr: number;
  foodCostInr: number;
  otherCostInr: number;
};

type Step = {
  key: keyof TourActualCosts;
  question: string;
  hint: string;
};

const STEPS: Step[] = [
  {
    key: 'totalSpendInr',
    question: "What's your total trip budget?",
    hint: 'Real amount you spent for the full tour (out & back)',
  },
  {
    key: 'fuelCostInr',
    question: 'How much did fuel cost?',
    hint: 'Petrol / diesel / EV charge for the round trip',
  },
  {
    key: 'foodCostInr',
    question: 'How much on food & drinks?',
    hint: 'Meals, snacks, chai stops along the way',
  },
  {
    key: 'otherCostInr',
    question: 'Any other costs?',
    hint: 'Parking, tolls, tickets, parking fines — whatever else',
  },
];

type Props = {
  visible: boolean;
  estimatedBudgetInr: number;
  destinationName: string;
  onComplete: (costs: TourActualCosts) => void;
};

export function TourBudgetQuiz({
  visible,
  estimatedBudgetInr,
  destinationName,
  onComplete,
}: Props) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<keyof TourActualCosts, string>>({
    totalSpendInr: '',
    fuelCostInr: '',
    foodCostInr: '',
    otherCostInr: '',
  });

  const current = STEPS[step];
  const parsed = useMemo(() => {
    const n = Number(String(values[current.key]).replace(/[^\d.]/g, ''));
    return Number.isFinite(n) ? Math.max(0, Math.round(n)) : null;
  }, [values, current.key]);

  const canNext = parsed != null && parsed >= 0;

  const onNext = () => {
    if (!canNext || parsed == null) return;
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    const num = (key: keyof TourActualCosts) => {
      const n = Number(String(values[key]).replace(/[^\d.]/g, ''));
      return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
    };
    onComplete({
      totalSpendInr: num('totalSpendInr') || parsed,
      fuelCostInr: num('fuelCostInr'),
      foodCostInr: num('foodCostInr'),
      otherCostInr: num('otherCostInr'),
    });
  };

  const diff =
    parsed != null ? parsed - estimatedBudgetInr : null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View entering={FadeInUp.duration(320)} style={styles.sheet}>
          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={18} color={CLOUD.success} />
            <Text style={styles.badgeText}>Full tour complete · back at start</Text>
          </View>
          <Text style={styles.title}>Trip costs</Text>
          <Text style={styles.sub}>
            You reached {destinationName} and returned. Tell us what you actually spent —
            we’ll compare it with the default estimate (₹{estimatedBudgetInr.toLocaleString('en-IN')}).
          </Text>

          <Animated.View key={current.key} entering={FadeInDown.duration(280)} style={styles.card}>
            <Text style={styles.stepLabel}>
              Question {step + 1} of {STEPS.length}
            </Text>
            <Text style={styles.question}>{current.question}</Text>
            <Text style={styles.hint}>{current.hint}</Text>
            <View style={styles.inputRow}>
              <Text style={styles.rupee}>₹</Text>
              <TextInput
                value={values[current.key]}
                onChangeText={(t) =>
                  setValues((prev) => ({ ...prev, [current.key]: t.replace(/[^\d]/g, '') }))
                }
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={CLOUD.muted}
                style={styles.input}
                autoFocus
              />
            </View>
            {current.key === 'totalSpendInr' && diff != null ? (
              <Text
                style={[
                  styles.diff,
                  { color: diff > 0 ? CLOUD.danger : CLOUD.success },
                ]}
              >
                {diff === 0
                  ? 'Matches the default estimate'
                  : diff > 0
                    ? `₹${diff.toLocaleString('en-IN')} over the default estimate`
                    : `₹${Math.abs(diff).toLocaleString('en-IN')} under the default estimate`}
              </Text>
            ) : null}
          </Animated.View>

          <View style={styles.actions}>
            {step > 0 ? (
              <Pressable style={styles.secondary} onPress={() => setStep((s) => s - 1)}>
                <Text style={styles.secondaryText}>Back</Text>
              </Pressable>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <Pressable
              style={[styles.primary, !canNext && { opacity: 0.45 }]}
              onPress={onNext}
              disabled={!canNext}
            >
              <Text style={styles.primaryText}>
                {step === STEPS.length - 1 ? 'See journey story' : 'Next'}
              </Text>
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
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingBottom: 36,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 12,
  },
  badgeText: { color: CLOUD.success, fontWeight: '700', fontSize: 12 },
  title: { fontSize: 24, fontWeight: '900', color: CLOUD.ink },
  sub: { color: CLOUD.muted, marginTop: 8, lineHeight: 20, marginBottom: 16 },
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CLOUD.border,
    padding: 16,
  },
  stepLabel: { color: CLOUD.primary, fontWeight: '700', fontSize: 12, marginBottom: 8 },
  question: { color: CLOUD.ink, fontSize: 20, fontWeight: '800' },
  hint: { color: CLOUD.muted, marginTop: 6, marginBottom: 14, lineHeight: 18 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CLOUD.border,
    paddingHorizontal: 14,
  },
  rupee: { fontSize: 22, fontWeight: '800', color: CLOUD.ink, marginRight: 6 },
  input: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: CLOUD.ink,
    paddingVertical: 14,
  },
  diff: { marginTop: 10, fontWeight: '700', fontSize: 13 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  secondary: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CLOUD.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { fontWeight: '700', color: CLOUD.ink },
  primary: {
    flex: 1.4,
    height: 52,
    borderRadius: 16,
    backgroundColor: CLOUD.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '800' },
});
