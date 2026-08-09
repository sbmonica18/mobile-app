const fs = require('fs');
const file = 'app/(app)/(ai-flow)/intent.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add TextInput to react-native imports
code = code.replace(/Text,\n  View,\n\} from 'react-native';/, `Text,\n  View,\n  TextInput,\n} from 'react-native';`);

// 2. Add resetFilters to useAiFlowStore call
code = code.replace(/const setFilters = useAiFlowStore\(\(s\) => s\.setFilters\);/, `const setFilters = useAiFlowStore((s) => s.setFilters);\n  const resetFilters = useAiFlowStore((s) => s.resetFilters);`);

// 3. Skip Button logic
code = code.replace(/<ScalePressable onPress=\{goRecommendations\} style=\{styles\.skipBtn\}>/, `<ScalePressable onPress={() => { resetFilters(); goRecommendations(); }} style={styles.skipBtn}>`);

// 4. View All destinations shortcut
const viewAllCode = `{liveCount <= 20 && liveCount > 0 && (
          <Pressable onPress={goRecommendations} style={{ marginTop: 8 }}>
            <Text style={{ color: CLOUD.primary, fontSize: 13, fontWeight: '600' }}>
              View all {liveCount} destinations →
            </Text>
          </Pressable>
        )}`;
code = code.replace(/<\/Text>\n      <\/View>/, `</Text>\n        ${viewAllCode}\n      </View>`);

// 5. Options rendering logic and state for "Other"
code = code.replace(/const \[page, setPage\] = useState\(0\);/, `const [page, setPage] = useState(0);\n  const [customInputPage, setCustomInputPage] = useState<string | null>(null);`);

// 6. Custom Input component
const customInputComponent = `
function CustomInput({ field, onDone }: { field: 'budget' | 'time', onDone: () => void }) {
  const [text, setText] = useState('');
  const [unit, setUnit] = useState(field === 'time' ? 'Hours' : '');
  const setFilters = useAiFlowStore((s) => s.setFilters);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (text) {
        if (field === 'budget') {
          setFilters({ budget: text });
        } else if (field === 'time') {
          setFilters({ time: \`\${text} \${unit}\` });
        }
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [text, unit, field, setFilters]);

  return (
    <Animated.View entering={FadeInUp.duration(200)} style={styles.customInputContainer}>
      {field === 'budget' && <Text style={styles.prefix}>₹</Text>}
      <TextInput
        style={styles.input}
        placeholder={field === 'budget' ? 'Amount' : 'Duration'}
        placeholderTextColor={CLOUD.muted}
        keyboardType="numeric"
        value={text}
        onChangeText={setText}
        autoFocus
      />
      {field === 'time' && (
        <Pressable onPress={() => setUnit(unit === 'Hours' ? 'Days' : 'Hours')} style={styles.unitToggle}>
          <Text style={styles.unitText}>{unit}</Text>
        </Pressable>
      )}
      <ScalePressable onPress={onDone} style={styles.doneBtn}>
        <Ionicons name="checkmark" size={20} color="#fff" />
      </ScalePressable>
    </Animated.View>
  );
}
`;

code = code.replace(/export default function IntentSelectionScreen/, `${customInputComponent}\nexport default function IntentSelectionScreen`);

// 7. Inject Custom Input rendering inside the page map
const originalOptionsMap = `{p.options.map((opt, optIndex) => (
                <SelectChip
                  key={opt}
                  label={opt}
                  index={optIndex}
                  selected={
                  selectedFor(p.field) === opt || (p.field === 'transportMode' && filters.transportMode === opt) || (p.field === 'priority' && filters.priority === opt)
}
                  fullWidth={p.field === 'mood'}
                  icon={
                    p.field === 'mood'
                      ? MOOD_ICONS[opt as Mood]
                      : undefined
                  }
                  onSelect={() => selectAndAdvance(p.field, opt)}
                />
              ))}`;

const newOptionsMap = `{[...p.options, (p.field === 'budget' || p.field === 'time') ? 'Other' : null].filter(Boolean).map((opt, optIndex) => (
                <SelectChip
                  key={opt as string}
                  label={opt as string}
                  index={optIndex}
                  selected={
                    (opt === 'Other' ? customInputPage === p.field : (selectedFor(p.field) === opt || (p.field === 'transportMode' && filters.transportMode === opt) || (p.field === 'priority' && filters.priority === opt)))
                  }
                  fullWidth={p.field === 'mood'}
                  icon={p.field === 'mood' ? MOOD_ICONS[opt as Mood] : undefined}
                  onSelect={() => {
                    if (opt === 'Other') {
                      setCustomInputPage(p.field);
                    } else {
                      setCustomInputPage(null);
                      selectAndAdvance(p.field, opt as string);
                    }
                  }}
                />
              ))}
              {customInputPage === p.field && (
                <CustomInput
                  field={p.field as 'budget' | 'time'}
                  onDone={() => {
                    if (page >= PAGES.length - 1) goRecommendations();
                    else goTo(page + 1);
                  }}
                />
              )}`;

code = code.replace(originalOptionsMap, newOptionsMap);

// 8. Add styles for Custom Input
const newStyles = `  customInputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: CLOUD.primary,
    ...CLOUD.shadows.card,
  },
  prefix: {
    fontSize: 18,
    fontWeight: '600',
    color: CLOUD.ink,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: CLOUD.ink,
  },
  unitToggle: {
    backgroundColor: CLOUD.bg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    color: CLOUD.ink,
  },
  doneBtn: {
    backgroundColor: CLOUD.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },`;

code = code.replace(/chipSelected: \{ backgroundColor: CLOUD.primary \},/, `chipSelected: { backgroundColor: CLOUD.primary },\n${newStyles}`);

fs.writeFileSync(file, code);
