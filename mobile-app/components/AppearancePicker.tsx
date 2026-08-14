import { APPEARANCE_OPTIONS, type AppearanceId } from '@/constants/appThemes';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function AppearancePicker() {
  const appearance = useThemeStore((s) => s.appearance);
  const colors = useThemeStore((s) => s.colors);
  const setAppearance = useThemeStore((s) => s.setAppearance);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, { color: colors.ink }]}>Appearance</Text>
      <Text style={[styles.hint, { color: colors.muted }]}>
        Light, Dark, and Advanced Cloud Intelligence
      </Text>
      <View style={styles.row}>
        {APPEARANCE_OPTIONS.map((opt) => {
          const selected = appearance === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => void setAppearance(opt.id)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: selected ? colors.lightBlue : colors.soft },
                ]}
              >
                <Ionicons
                  name={opt.icon}
                  size={20}
                  color={selected ? colors.primary : colors.muted}
                />
              </View>
              <Text style={[styles.title, { color: colors.ink }]}>{opt.title}</Text>
              <Text style={[styles.sub, { color: colors.muted }]}>{opt.subtitle}</Text>
              <Swatch preview={opt.id} selected={selected} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Swatch({ preview, selected }: { preview: AppearanceId; selected: boolean }) {
  const map = {
    light: ['#F7F9FC', '#FFFFFF', '#2563EB'],
    dark: ['#0B1220', '#151E32', '#60A5FA'],
    advanced: ['#EEF2FF', '#FFFFFF', '#7C3AED'],
  } as const;
  const [a, b, c] = map[preview];
  return (
    <View style={[styles.swatchRow, selected && { opacity: 1 }]}>
      <View style={[styles.dot, { backgroundColor: a }]} />
      <View style={[styles.dot, { backgroundColor: b }]} />
      <View style={[styles.dot, { backgroundColor: c }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 24 },
  heading: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  hint: { fontSize: 13, fontWeight: '600', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8 },
  card: {
    flex: 1,
    minWidth: 0,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 13, fontWeight: '800' },
  sub: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  swatchRow: { flexDirection: 'row', gap: 4, marginTop: 4 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.12)',
  },
});
