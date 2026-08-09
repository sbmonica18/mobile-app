const fs = require('fs');
const file = 'app/(app)/(ai-flow)/intent.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Imports
code = code.replace(/import \{([^\}]+)\} from '@\/mocks\/intentOptions';/, `import {
  BUDGETS,
  MOOD_ICONS,
  MOODS,
  TIME_OPTIONS,
  TRAVEL_STYLES,
  TRANSPORT_MODES,
  PRIORITIES,
  type Mood,
} from '@/mocks/intentOptions';`);

code = code.replace(/withTiming,\n\} from 'react-native-reanimated';/, `withTiming,
  interpolate,
  interpolateColor,
  FadeInDown,
  FadeInUp,
  FadeIn,
} from 'react-native-reanimated';`);

code = code.replace(/import \{ useAiFlowStore \} from '@\/store\/aiFlowStore';/, `import { useAiFlowStore } from '@/store/aiFlowStore';\nimport { getRecommendations } from '@/mocks/destinations';`);

// 2. PAGES
code = code.replace(/key: 'style',[^\]]+?\},/s, `$&
  {
    key: 'transport',
    question: 'How are you getting there?',
    options: TRANSPORT_MODES as readonly string[],
    field: 'transportMode' as const,
  },
  {
    key: 'priority',
    question: 'What matters most today?',
    options: PRIORITIES as readonly string[],
    field: 'priority' as const,
  },`);

// 3. SelectChip Update
const oldSelectChip = /function SelectChip.*?return \(.*?\);\n\}/s;
const newSelectChip = `function SelectChip({
  label,
  selected,
  onSelect,
  icon,
  fullWidth,
  index,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
  index: number;
}) {
  const scale = useSharedValue(1);
  const fill = useSharedValue(selected ? 1 : 0);
  
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const fillStyle = useAnimatedStyle(() => ({
    opacity: fill.value,
    transform: [{ scale: interpolate(fill.value, [0, 1], [0.8, 1]) }],
  }));

  useEffect(() => {
    fill.value = withTiming(selected ? 1 : 0, { duration: 250, easing: Easing.out(Easing.ease) });
  }, [selected, fill]);

  const handle = () => {
    scale.value = withSpring(1.08, { damping: 12, stiffness: 220 }, () => {
      scale.value = withSpring(1, { damping: 14, stiffness: 220 });
    });
    onSelect();
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify().damping(16).stiffness(150)} style={fullWidth ? { width: '100%' } : undefined}>
      <ScalePressable onPress={handle}>
        <Animated.View
          style={[
            styles.chip,
            fullWidth && styles.chipFull,
            styles.chipIdle,
            selected && { borderColor: CLOUD.primary },
            anim,
            { overflow: 'hidden' }
          ]}
        >
          <Animated.View style={[StyleSheet.absoluteFill, styles.chipSelected, fillStyle, { borderRadius: 20 }]} />
          {icon ? (
            <Ionicons name={icon} size={22} color={selected ? '#fff' : CLOUD.primary} />
          ) : null}
          <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
          {selected && (
            <Animated.View entering={FadeIn.duration(150)} style={{ marginLeft: 'auto' }}>
              <Ionicons name="checkmark" size={18} color="#fff" />
            </Animated.View>
          )}
        </Animated.View>
      </ScalePressable>
    </Animated.View>
  );
}`;
code = code.replace(oldSelectChip, newSelectChip);

// 4. Live Match Count component & bgColors inside IntentSelectionScreen
code = code.replace(/export default function IntentSelectionScreen\(\) \{/, `
function AnimatedCount({ count }: { count: number }) {
  const display = useSharedValue(count);
  const [val, setVal] = useState(count);

  useEffect(() => {
    display.value = withTiming(count, { duration: 300 }, () => {
      // Optional JS callback if needed
    });
    // Interval just to update text fast enough without re-renders getting missed
    const t = setInterval(() => {
      setVal(Math.round(display.value));
    }, 16);
    return () => clearInterval(t);
  }, [count, display]);

  return <Text style={{ fontWeight: '800', color: CLOUD.primary }}>{val}</Text>;
}

export default function IntentSelectionScreen() {`);

// 5. Add Live Count logic and backgrounds
code = code.replace(/const filters = useAiFlowStore[^\n]+;/g, `$&`);
code = code.replace(/const progress = useSharedValue[^;]+;/, `$&
  const liveCount = getRecommendations(filters).length;
  const bgColors = ['#e0f2fe88', '#fef3c788', '#dcfce788', '#f3e8ff88', '#ffedd588', '#e0e7ff88'];
  const bgWash = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(bgColors[page % bgColors.length], { duration: 400 }),
    };
  });
`);

// 6. Tweak progress tracking physics and Add background wash to JSX
code = code.replace(/progress.value = withSpring\(\(next \+ 1\) \/ PAGES\.length, \{ damping: 16, stiffness: 180 \}\);/g, `progress.value = withSpring((next + 1) / PAGES.length, { damping: 12, stiffness: 100 });`);

code = code.replace(/<ScrollView/, `
      <Animated.View style={[StyleSheet.absoluteFill, bgWash, { top: '35%', bottom: 0, borderTopLeftRadius: 40, borderTopRightRadius: 40 }]} pointerEvents="none" />
      $&`);

// 7. Update rendering inside map
code = code.replace(/<Text style=\{styles\.question\}>\{p\.question\}<\/Text>/, `<Animated.Text key={p.key + "-title"} entering={FadeInUp.duration(200)} style={styles.question}>
              {p.question}
              {p.field === 'transportMode' || p.field === 'priority' ? (
                <Text style={styles.optionalLabel}>{"\\nOptional — helps us fine-tune"}</Text>
              ) : null}
            </Animated.Text>`);

code = code.replace(/<SelectChip[\s\S]*?\/>/g, (match) => {
  return match.replace(/label=\{opt\}/, `label={opt}\n                  index={optIndex}`);
});

code = code.replace(/\{p\.options\.map\(\(opt\) => \(/, `{p.options.map((opt, optIndex) => (`);

code = code.replace(/selectedFor\(p\.field\) === opt/, `
                  selectedFor(p.field) === opt || (p.field === 'transportMode' && filters.transportMode === opt) || (p.field === 'priority' && filters.priority === opt)
`);

// 8. Add live match count above footer
code = code.replace(/<View style=\{\[styles\.footer/, `
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 13, color: CLOUD.muted, fontWeight: '600' }}>
          <AnimatedCount count={liveCount} /> destinations match so far
        </Text>
      </View>
      $&`);

// 9. SelectedFor logic fix
code = code.replace(/return filters\.travelStyle;/, `
    if (field === 'travelStyle') return filters.travelStyle;
    if (field === 'transportMode') return filters.transportMode;
    return filters.priority;
`);

// 10. Styles fix
code = code.replace(/chipSelected: \{[^}]+\},/, `chipSelected: { backgroundColor: CLOUD.primary },
  optionalLabel: { fontSize: 13, color: CLOUD.muted, fontWeight: '500', marginTop: 4 },`);


fs.writeFileSync(file, code);
