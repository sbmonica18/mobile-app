import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { CLOUD } from '@/constants/cloudTheme';

const LOADING_STEPS = [
  '✨ UrbanLens AI',
  'Analyzing weather...',
  'Checking AQI...',
  'Finding the best destination...',
];

export function AiLoadingState() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 300); // 4 steps * 300ms = 1200ms total
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text
        key={step}
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.text}
      >
        {LOADING_STEPS[step]}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  text: {
    fontFamily: CLOUD.fonts.heading,
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },
});
