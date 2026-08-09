import { Stack } from 'expo-router';

export default function AiFlowLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#F7F8FA' },
      }}
    >
      <Stack.Screen name="destination-showcase" />
      <Stack.Screen name="intent" />
      <Stack.Screen
        name="recommendations"
        options={{ animation: 'fade' }}
      />
      <Stack.Screen name="destination/[id]" />
    </Stack>
  );
}
