import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Image, Modal } from 'react-native';
import { router, useLocalSearchParams, Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withTiming, Easing, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import Svg, { Polygon, Line, Text as SvgText } from 'react-native-svg';
import { CLOUD } from '@/constants/cloudTheme';
import { mockDestinations } from '@/mocks/destinations';

const { width: SCREEN_W } = Dimensions.get('window');

// --------------------------------------------------
// MOCK & TYPES
// --------------------------------------------------
interface ComparisonDestination {
  id: string;
  name: string;
  thumbnail: string;
  matchScore: number;
  metrics: {
    weather: number;   
    aqi: number;
    budget: number;    
    time: number;       
    safety: number;
    crowd: number;
  };
  rawValues: { weatherLabel: string; aqiValue: number; budgetAmount: number; timeMin: number; safetyLabel: string; crowdLabel: string };
  color: string;
}

const DEST_COLORS = [CLOUD.primary, CLOUD.aiAccent, CLOUD.success];

function mapToComparison(d: any, index: number): ComparisonDestination {
  const budgetVal = parseInt(d.budgetEstimate.replace(/[^0-9]/g, '')) || 5000;
  const timeVal = parseInt(d.travelTime.replace(/[^0-9]/g, '')) * 60 || 120;
  return {
    id: d.id,
    name: d.name,
    thumbnail: d.coverImage,
    matchScore: d.matchScore,
    metrics: {
      weather: 60 + Math.random() * 40,
      aqi: Math.max(0, 100 - (d.aqi || 50)),
      budget: Math.max(0, 100 - (budgetVal / 100)),
      time: Math.max(0, 100 - (timeVal / 10)),
      safety: 80 + Math.random() * 20,
      crowd: 50 + Math.random() * 50,
    },
    rawValues: {
      weatherLabel: d.weather,
      aqiValue: d.aqi || 50,
      budgetAmount: budgetVal,
      timeMin: timeVal,
      safetyLabel: 'High',
      crowdLabel: 'Moderate'
    },
    color: DEST_COLORS[index % DEST_COLORS.length],
  };
}

// --------------------------------------------------
// COMPONENTS
// --------------------------------------------------

function PrioritySlider({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: CLOUD.ink }}>{label}</Text>
        <Text style={{ fontSize: 13, color: CLOUD.muted }}>{Math.round(value * 100)}%</Text>
      </View>
      <View style={{ flexDirection: 'row', height: 24, gap: 4 }}>
        {[0.2, 0.4, 0.6, 0.8, 1.0].map(v => (
          <Pressable 
            key={v} 
            style={{ flex: 1, backgroundColor: value >= v ? CLOUD.primary : '#E2E8F0', borderRadius: 4 }}
            onPress={() => onChange(v)}
          />
        ))}
      </View>
    </View>
  );
}

function RadarChart({ destinations }: { destinations: ComparisonDestination[] }) {
  const size = SCREEN_W - 64;
  const center = size / 2;
  const radius = (size - 40) / 2;

  const getPoints = (metrics: any) => {
    // 4 axes: Top, Right, Bottom, Left
    const vals = [metrics.weather, metrics.aqi, metrics.budget, metrics.time];
    return vals.map((v, i) => {
      const angle = (Math.PI * 2 * i) / 4 - Math.PI / 2;
      const r = (v / 100) * radius;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(' ');
  };

  return (
    <View style={{ alignItems: 'center', marginVertical: 24 }}>
      <Svg width={size} height={size}>
        <Line x1={center} y1={20} x2={center} y2={size-20} stroke="#E2E8F0" strokeWidth="1" />
        <Line x1={20} y1={center} x2={size-20} y2={center} stroke="#E2E8F0" strokeWidth="1" />
        <SvgText x={center} y={15} fontSize="10" fill={CLOUD.muted} textAnchor="middle">Weather</SvgText>
        <SvgText x={size-5} y={center+4} fontSize="10" fill={CLOUD.muted} textAnchor="end">AQI</SvgText>
        <SvgText x={center} y={size-5} fontSize="10" fill={CLOUD.muted} textAnchor="middle">Budget</SvgText>
        <SvgText x={15} y={center+4} fontSize="10" fill={CLOUD.muted} textAnchor="start">Time</SvgText>
        
        {destinations.map(d => (
          <Polygon key={d.id} points={getPoints(d.metrics)} fill={d.color} fillOpacity="0.3" stroke={d.color} strokeWidth="2" />
        ))}
      </Svg>
    </View>
  );
}

function ComparisonMatrix({ destinations }: { destinations: ComparisonDestination[] }) {
  if (destinations.length < 2) return null;

  const metrics = [
    { label: 'Weather', key: 'weatherLabel', isBest: (d1: any, d2: any) => false }, // complex
    { label: 'AQI', key: 'aqiValue', isBest: (val: number, all: number[]) => val === Math.min(...all) },
    { label: 'Budget', key: 'budgetAmount', prefix: '₹', isBest: (val: number, all: number[]) => val === Math.min(...all) },
    { label: 'Time', key: 'timeMin', format: (v: number) => `${Math.floor(v/60)}h ${v%60}m`, isBest: (val: number, all: number[]) => val === Math.min(...all) },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Comparison Matrix</Text>
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#E2E8F0', paddingBottom: 8, marginBottom: 8 }}>
        <View style={{ flex: 1.5 }} />
        {destinations.map(d => (
          <Text key={d.id} style={{ flex: 1, fontSize: 12, fontWeight: '700', color: CLOUD.ink, textAlign: 'center' }} numberOfLines={1}>{d.name}</Text>
        ))}
      </View>
      {metrics.map(m => {
        const allVals = destinations.map(d => (d.rawValues as any)[m.key]);
        return (
          <View key={m.label} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#F1F5F9' }}>
            <Text style={{ flex: 1.5, fontSize: 13, color: CLOUD.muted, fontWeight: '600' }}>{m.label}</Text>
            {destinations.map(d => {
              const val = (d.rawValues as any)[m.key];
              const best = typeof val === 'number' && m.isBest(val, allVals);
              const display = m.format ? m.format(val) : `${m.prefix || ''}${val}`;
              return (
                <View key={d.id} style={{ flex: 1, alignItems: 'center' }}>
                  <View style={[best && { backgroundColor: CLOUD.success + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }]}>
                    <Text style={{ fontSize: 13, fontWeight: best ? '700' : '500', color: best ? CLOUD.success : CLOUD.ink, textAlign: 'center' }}>
                      {display}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

export default function DecisionCanvasScreen() {
  const insets = useSafeAreaInsets();
  const { baseId } = useLocalSearchParams<{ baseId: string }>();

  const [dests, setDests] = useState<ComparisonDestination[]>([]);
  const [weights, setWeights] = useState({ weather: 0.5, aqi: 0.5, budget: 0.5, time: 0.5 });
  const [pickerTarget, setPickerTarget] = useState<'new' | string | null>(null);

  useEffect(() => {
    if (baseId) {
      const base = mockDestinations.find(d => d.id === baseId);
      if (base) setDests([mapToComparison(base, 0)]);
    } else {
      setDests([mapToComparison(mockDestinations[0], 0)]);
    }
  }, [baseId]);

  const addDest = (destId: string) => {
    const dest = mockDestinations.find(m => m.id === destId);
    if (!dest) return;

    if (pickerTarget === 'new') {
      if (dests.length >= 2) return;
      setDests([...dests, mapToComparison(dest, dests.length)]);
    } else if (pickerTarget) {
      // Replace existing slot
      setDests(dests.map(d => d.id === pickerTarget ? mapToComparison(dest, dests.indexOf(d)) : d));
    }
    setPickerTarget(null);
  };

  const removeDest = (id: string) => {
    setDests(dests.filter(d => d.id !== id));
  };

  const verdict = useMemo(() => {
    if (dests.length < 2) return null;
    let scores = dests.map(d => {
      const score = 
        d.metrics.weather * weights.weather +
        d.metrics.aqi * weights.aqi +
        d.metrics.budget * weights.budget +
        d.metrics.time * weights.time;
      return { ...d, total: score };
    }).sort((a, b) => b.total - a.total);

    const winner = scores[0];
    const runnerUp = scores[1];
    
    const diffs = [
      { key: 'weather', diff: winner.metrics.weather - runnerUp.metrics.weather },
      { key: 'air quality', diff: winner.metrics.aqi - runnerUp.metrics.aqi },
      { key: 'budget', diff: winner.metrics.budget - runnerUp.metrics.budget },
      { key: 'travel time', diff: winner.metrics.time - runnerUp.metrics.time },
    ].sort((a, b) => b.diff - a.diff);

    const bestAdvantage = diffs[0].key;
    const runnerUpAdvantage = diffs[diffs.length - 1].key;

    return {
      winner,
      runnerUp,
      reasoning: `${winner.name} edges ahead with better ${bestAdvantage}. If ${runnerUpAdvantage} matters more to you, ${runnerUp.name} is a stronger pick.`
    };
  }, [dests, weights]);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={CLOUD.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Decision Canvas</Text>
        <Pressable onPress={() => setDests(dests.slice(0, 1))} style={styles.headerBtn}>
          <Text style={{ fontSize: 12, color: CLOUD.primary, fontWeight: '600' }}>Reset</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* SLOTS */}
        <View style={styles.slotsRow}>
          {dests.map(d => (
            <View key={d.id} style={styles.slot}>
              <Image source={{ uri: d.thumbnail }} style={styles.slotImg} />
              <Text style={styles.slotName} numberOfLines={1}>{d.name}</Text>
              {dests.length > 1 && (
                <View style={styles.slotActions}>
                  <Pressable onPress={() => setPickerTarget(d.id)} style={styles.slotActionBtn}>
                    <Ionicons name="swap-horizontal" size={12} color="#fff" />
                  </Pressable>
                </View>
              )}
            </View>
          ))}
          {dests.length < 2 && (
            <Pressable onPress={() => setPickerTarget('new')} style={styles.addSlot}>
              <Ionicons name="add" size={24} color={CLOUD.muted} />
              <Text style={styles.addSlotText}>Add</Text>
            </Pressable>
          )}
        </View>

        {dests.length < 2 ? (
          <View style={styles.emptyState}>
            <Ionicons name="git-compare-outline" size={48} color={CLOUD.muted} />
            <Text style={styles.emptyText}>Add at least one more destination to see the AI comparison.</Text>
          </View>
        ) : (
          <Animated.View entering={FadeIn}>
            {/* VERDICT HERO */}
            {verdict && (
              <View style={styles.verdictCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Ionicons name="sparkles" size={14} color={CLOUD.aiAccent} />
                  <Text style={styles.verdictLabel}>AI Recommendation</Text>
                </View>
                <Text style={styles.verdictHeadline}>{verdict.winner.name} is your best choice today</Text>
                <Text style={styles.verdictReasoning}>{verdict.reasoning}</Text>
              </View>
            )}

            {/* Phase 11 — Why UrbanLens chose this */}
            {verdict && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Why UrbanLens chose this</Text>
                <Text style={{ fontSize: 22, fontWeight: '900', color: CLOUD.ink }}>
                  {verdict.winner.name}
                </Text>
                <Text style={{ color: CLOUD.primary, fontWeight: '800', marginBottom: 10 }}>
                  Best current conditions for your intent
                </Text>
                {[
                  ['Weather', 'Excellent'],
                  ['Crowd', 'Good'],
                  ['Budget', 'Moderate'],
                  ['Travel time', 'Good'],
                ].map(([k, v]) => (
                  <View
                    key={k}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingVertical: 6,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: CLOUD.border,
                    }}
                  >
                    <Text style={{ color: CLOUD.body, fontWeight: '600' }}>{k}</Text>
                    <Text style={{ color: CLOUD.ink, fontWeight: '800' }}>{v}</Text>
                  </View>
                ))}
                <Text style={{ marginTop: 12, color: CLOUD.body, lineHeight: 20 }}>
                  {verdict.winner.name} currently offers the strongest overall experience for your
                  selected intent. Open UrbanLens Now for live area signals before you leave.
                </Text>
              </View>
            )}

            {/* WEIGHT SLIDERS */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Priority Weighting</Text>
              <PrioritySlider label="Weather" value={weights.weather} onChange={v => setWeights({...weights, weather: v})} />
              <PrioritySlider label="Air Quality" value={weights.aqi} onChange={v => setWeights({...weights, aqi: v})} />
              <PrioritySlider label="Budget" value={weights.budget} onChange={v => setWeights({...weights, budget: v})} />
              <PrioritySlider label="Travel Time" value={weights.time} onChange={v => setWeights({...weights, time: v})} />
            </View>
            
            <ComparisonMatrix destinations={dests} />

            {/* RADAR CHART */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Radar Overview</Text>
              <RadarChart destinations={dests} />
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
                {dests.map(d => (
                  <View key={d.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: d.color }} />
                    <Text style={{ fontSize: 12, color: CLOUD.ink }}>{d.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* FINAL ACTIONS */}
            {verdict && (
              <View style={{ gap: 12, marginTop: 24, marginBottom: 40 }}>
                {dests.map(d => {
                  const isWinner = d.id === verdict.winner.id;
                  return (
                    <Pressable 
                      key={d.id}
                      style={isWinner ? styles.primaryBtn : styles.secondaryBtn}
                      onPress={() => router.push(`/(app)/(ai-flow)/route-navigation?destinationId=${d.id}` as Href)}
                    >
                      <Text style={isWinner ? styles.primaryBtnText : styles.secondaryBtnText}>
                        Choose {d.name}
                      </Text>
                    </Pressable>
                  );
                })}
                <Pressable style={{ alignItems: 'center', padding: 12 }}>
                  <Text style={{ color: CLOUD.muted, fontWeight: '600' }}>Save this comparison</Text>
                </Pressable>
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* MODAL BOTTOM SHEET */}
      {!!pickerTarget && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setPickerTarget(null)}>
          <View style={styles.overlay}>
            <Pressable style={styles.backdrop} onPress={() => setPickerTarget(null)} />
            <Animated.View 
              entering={SlideInDown.springify().damping(18).stiffness(200)} 
              exiting={SlideOutDown}
              style={styles.sheet}
            >
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{pickerTarget === 'new' ? 'Add Destination to Compare' : 'Swap Destination'}</Text>
                <Pressable onPress={() => setPickerTarget(null)} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={CLOUD.muted} />
                </Pressable>
              </View>
              <ScrollView style={styles.sheetContent} showsVerticalScrollIndicator={false}>
                {mockDestinations.filter(m => !dests.find(d => d.id === m.id)).map((dest) => (
                  <Pressable key={dest.id} style={styles.pickerRow} onPress={() => addDest(dest.id)}>
                    <Image source={{ uri: dest.coverImage }} style={styles.pickerImg} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pickerName}>{dest.name}</Text>
                      <Text style={styles.pickerMeta}>{dest.weather}</Text>
                    </View>
                    <View style={styles.pickerScore}>
                      <Text style={styles.pickerScoreText}>{dest.matchScore}%</Text>
                    </View>
                  </Pressable>
                ))}
                <View style={{ height: 40 }} />
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F9FC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 10,
  },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: CLOUD.ink },
  scrollContent: { padding: 16 },
  slotsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  slot: {
    flex: 1,
    height: 64,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
    ...CLOUD.shadows.card,
  },
  slotImg: { width: 48, height: 48, borderRadius: 8 },
  slotName: { flex: 1, fontSize: 13, fontWeight: '700', color: CLOUD.ink },
  slotActions: {
    position: 'absolute', top: -6, right: -6,
    flexDirection: 'row', gap: 4,
  },
  slotActionBtn: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: CLOUD.primary,
    alignItems: 'center', justifyContent: 'center',
    ...CLOUD.shadows.card,
  },
  addSlot: {
    flex: 1,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: CLOUD.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSlotText: { fontSize: 12, color: CLOUD.muted, fontWeight: '600', marginTop: 2 },
  emptyState: { padding: 40, alignItems: 'center', gap: 16 },
  emptyText: { textAlign: 'center', color: CLOUD.muted, fontSize: 15 },
  verdictCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    ...CLOUD.shadows.hero,
  },
  verdictLabel: { color: CLOUD.aiAccent, fontSize: 13, fontWeight: '700' },
  verdictHeadline: { fontSize: 24, fontWeight: '800', color: CLOUD.ink, marginBottom: 12 },
  verdictReasoning: { fontSize: 15, color: CLOUD.body, lineHeight: 22 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    ...CLOUD.shadows.card,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: CLOUD.ink, marginBottom: 16 },
  primaryBtn: { backgroundColor: CLOUD.primary, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: CLOUD.primary, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText: { color: CLOUD.primary, fontSize: 16, fontWeight: '700' },
  
  // Sheet styles
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, maxHeight: '80%' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: CLOUD.ink },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  sheetContent: { padding: 20 },
  pickerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  pickerImg: { width: 48, height: 48, borderRadius: 12 },
  pickerName: { fontSize: 16, fontWeight: '700', color: CLOUD.ink },
  pickerMeta: { fontSize: 13, color: CLOUD.muted, marginTop: 2 },
  pickerScore: { backgroundColor: CLOUD.primary + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  pickerScoreText: { color: CLOUD.primary, fontWeight: '800', fontSize: 13 },
});
