import { Text, View } from 'react-native';

const ITEMS = [
  'Expo + TypeScript project',
  'Expo Router navigation',
  'Zustand + TanStack Query + Axios',
  'NativeWind styling',
  'Spring Boot backend scaffold',
  'MySQL / local H2 config',
];

export function PhaseChecklist() {
  return (
    <View className="mt-12">
      <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-fog">
        Phase 1 ready
      </Text>
      {ITEMS.map((item) => (
        <View key={item} className="mb-2 flex-row items-center gap-2">
          <View className="h-1.5 w-1.5 rounded-full bg-sand" />
          <Text className="text-sm text-mist/90">{item}</Text>
        </View>
      ))}
    </View>
  );
}
