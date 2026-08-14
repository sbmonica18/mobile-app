import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Text,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CLOUD } from '@/constants/cloudTheme';
import { useThemeStore } from '@/store/themeStore';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { getPlaceSuggestions, Place } from '@/mocks/places';
import {
  findDestinationByName,
  looksLikeIntentPhrase,
} from '@/mocks/destinations';
import { useAiFlowStore } from '@/store/aiFlowStore';
import { cleanPhraseLabel } from '@/utils/phraseLabel';
import { Href, useRouter } from 'expo-router';

export function SearchDestination() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const setFilters = useAiFlowStore((s) => s.setFilters);
  const colors = useThemeStore((s) => s.colors);
  const focus = useSharedValue(0);
  const iconBob = useSharedValue(0);

  const suggestions = query.length > 1 ? getPlaceSuggestions(query) : [];
  const showDropdown = focused && query.length > 1;

  useEffect(() => {
    focus.value = withTiming(focused ? 1 : 0, {
      duration: 200,
      easing: Easing.inOut(Easing.quad),
    });
  }, [focus, focused]);

  useEffect(() => {
    iconBob.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [iconBob]);

  const shellStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focus.value, [0, 1], [CLOUD.border, CLOUD.primary]),
    shadowOpacity: 0.06 + focus.value * 0.08,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: focused || query.length > 0 ? 1 : 0,
    transform: [{ translateY: focused || query.length > 0 ? 0 : 6 }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (iconBob.value - 0.5) * 2 }],
  }));

  const openDestinationDetail = (id: string) => {
    Keyboard.dismiss();
    setFocused(false);
    setQuery('');
    router.push(`/(app)/(ai-flow)/destination/${id}` as Href);
  };

  const handleSelect = (place: Place) => {
    const matched = findDestinationByName(place.name) || findDestinationByName(place.id);
    openDestinationDetail(matched?.id || place.id);
  };

  const onSubmit = () => {
    const q = query.trim();
    if (!q) return;

    if (looksLikeIntentPhrase(q)) {
      Keyboard.dismiss();
      setFocused(false);
      setQuery('');
      const label = cleanPhraseLabel(q);
      setFilters({ phrase: label });
      router.push(
        `/(app)/(ai-flow)/recommendations?phrase=${encodeURIComponent(label)}` as Href,
      );
      return;
    }

    const byName = findDestinationByName(q);
    if (byName) {
      openDestinationDetail(byName.id);
      return;
    }

    if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
        shellStyle,
        showDropdown && styles.containerRaised,
      ]}
      collapsable={false}
    >
      <View style={styles.inputRow}>
        <Animated.View style={iconStyle}>
          <Ionicons
            name="search"
            size={20}
            color={focused ? colors.primary : colors.muted}
          />
        </Animated.View>
        <View style={styles.inputCol}>
          <Animated.Text style={[styles.floatLabel, labelStyle]}>Search destination</Animated.Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 220)}
            placeholder={focused || query ? '' : 'Search destination...'}
            placeholderTextColor={colors.muted}
            style={[styles.input, { color: colors.ink }]}
            returnKeyType="search"
            onSubmitEditing={onSubmit}
          />
        </View>
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} style={{ padding: 4 }} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={CLOUD.muted} />
          </Pressable>
        )}
      </View>

      {showDropdown && (
        <Animated.View
          entering={FadeIn.duration(140)}
          exiting={FadeOut.duration(120)}
          style={styles.dropdown}
          pointerEvents="auto"
        >
          {suggestions.length === 0 ? (
            <View style={styles.emptyItem}>
              <Text style={styles.emptyText}>No matching places found</Text>
            </View>
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              style={styles.dropdownScroll}
              bounces={false}
            >
              {suggestions.map((place, index) => (
                <Pressable
                  key={place.id}
                  style={({ pressed }) => [
                    styles.item,
                    index > 0 && styles.itemBorder,
                    pressed && styles.itemPressed,
                  ]}
                  onPress={() => handleSelect(place)}
                >
                  <View style={styles.itemIcon}>
                    <Ionicons name="location" size={16} color={CLOUD.primary} />
                  </View>
                  <View style={styles.itemTextContent}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {place.name}
                    </Text>
                    <Text style={styles.itemRegion} numberOfLines={1}>
                      {place.region}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={CLOUD.muted} />
                </Pressable>
              ))}
            </ScrollView>
          )}
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: CLOUD.border,
    overflow: 'visible',
    zIndex: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  containerRaised: {
    zIndex: 100,
    elevation: 28,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    minHeight: 56,
    gap: 10,
  },
  inputCol: {
    flex: 1,
    justifyContent: 'center',
  },
  floatLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: CLOUD.primary,
    marginBottom: 2,
  },
  input: {
    color: CLOUD.ink,
    fontSize: 16,
    paddingVertical: 2,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CLOUD.border,
    zIndex: 110,
    elevation: 30,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 260,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 56,
  },
  itemBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: CLOUD.border,
  },
  itemPressed: {
    backgroundColor: CLOUD.lightBlue,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CLOUD.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTextContent: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemRegion: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  emptyItem: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
});
