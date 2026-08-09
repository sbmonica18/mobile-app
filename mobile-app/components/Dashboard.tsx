import { AUTH_COLORS } from '@/components/AuthTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <LinearGradient colors={['#071E52', '#0A2A6E', '#123A8A']} style={styles.shell}>
      {children}
    </LinearGradient>
  );
}

export function ProfileHeader({
  name,
  email,
  isGuest,
  onLogout,
}: {
  name: string;
  email: string;
  isGuest: boolean;
  onLogout: () => void;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || 'U';
  return (
    <View style={styles.profileRow}>
      <View style={styles.profileLeft}>
        <LinearGradient colors={[AUTH_COLORS.navy, AUTH_COLORS.blue]} style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </LinearGradient>
        <View style={styles.profileTextWrap}>
          <Text style={styles.hello}>Welcome back</Text>
          <Text style={styles.profileName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.profileEmail} numberOfLines={1}>
            {isGuest ? 'Guest explorer' : email}
          </Text>
        </View>
      </View>
      <Pressable onPress={onLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>{isGuest ? 'Exit' : 'Logout'}</Text>
      </Pressable>
    </View>
  );
}

export function WeatherCard({
  loading,
  label,
  temperatureC,
  description,
  humidity,
  windKph,
  error,
  onRefresh,
}: {
  loading: boolean;
  label?: string;
  temperatureC?: number;
  description?: string;
  humidity?: number;
  windKph?: number;
  error?: string | null;
  onRefresh: () => void;
}) {
  return (
    <View style={styles.weatherCard}>
      <View style={styles.weatherTop}>
        <View>
          <Text style={styles.sectionEyebrow}>Current weather</Text>
          <Text style={styles.weatherPlace} numberOfLines={1}>
            {label ?? 'Detecting location…'}
          </Text>
        </View>
        <Pressable onPress={onRefresh} style={styles.refreshChip}>
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.weatherLoading}>
          <ActivityIndicator color={AUTH_COLORS.blue} />
          <Text style={styles.muted}>Fetching live conditions…</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.weatherBody}>
          <Text style={styles.temp}>{temperatureC ?? '--'}°</Text>
          <View style={styles.weatherMeta}>
            <Text style={styles.weatherDesc}>{description}</Text>
            <Text style={styles.muted}>
              Humidity {humidity ?? '--'}% · Wind {windKph ?? '--'} km/h
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

export function RouteCard({
  sourceLabel,
  destinationLabel,
  destinationQuery,
  onChangeDestination,
  onFocusSearch,
  suggestions,
  onPickSuggestion,
  searching,
}: {
  sourceLabel: string;
  destinationLabel?: string;
  destinationQuery: string;
  onChangeDestination: (value: string) => void;
  onFocusSearch: () => void;
  suggestions: Array<{ placeKey: string; placeName: string; address: string }>;
  onPickSuggestion: (placeKey: string) => void;
  searching: boolean;
}) {
  return (
    <View style={styles.routeCard}>
      <Text style={styles.sectionEyebrow}>Your trip</Text>
      <Text style={styles.sectionTitle}>Source & destination</Text>

      <View style={styles.routeRow}>
        <View style={[styles.dot, styles.dotSource]} />
        <View style={styles.routeField}>
          <Text style={styles.fieldLabel}>Source (current location)</Text>
          <Text style={styles.fieldValue} numberOfLines={2}>
            {sourceLabel || 'Waiting for location…'}
          </Text>
        </View>
      </View>

      <View style={styles.routeLine} />

      <View style={styles.routeRow}>
        <View style={[styles.dot, styles.dotDest]} />
        <View style={styles.routeField}>
          <Text style={styles.fieldLabel}>Destination</Text>
          <TextInput
            value={destinationQuery}
            onChangeText={onChangeDestination}
            onFocus={onFocusSearch}
            placeholder="Search a city, area, or landmark"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
          {destinationLabel ? (
            <Text style={styles.selectedDest} numberOfLines={2}>
              Selected: {destinationLabel}
            </Text>
          ) : null}
        </View>
      </View>

      {searching ? <Text style={styles.hint}>Searching places…</Text> : null}

      {suggestions.length > 0 ? (
        <View style={styles.suggestionBox}>
          {suggestions.map((item) => (
            <Pressable
              key={item.placeKey}
              style={styles.suggestionItem}
              onPress={() => onPickSuggestion(item.placeKey)}
            >
              <Text style={styles.suggestionTitle}>{item.placeName}</Text>
              <Text style={styles.suggestionSub} numberOfLines={1}>
                {item.address}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function PlaceCardsRow({
  title,
  emptyText,
  items,
  onPressItem,
  onAction,
  actionLabel,
}: {
  title: string;
  emptyText: string;
  items: Array<{ id: string; placeName: string; address: string }>;
  onPressItem: (id: string) => void;
  onAction?: (id: string) => void;
  actionLabel?: string;
}) {
  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionEyebrow}>{title}</Text>
      {items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.muted}>{emptyText}</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
          {items.map((item) => (
            <Pressable key={item.id} style={styles.placeCard} onPress={() => onPressItem(item.id)}>
              <Text style={styles.placeCardTitle} numberOfLines={1}>
                {item.placeName}
              </Text>
              <Text style={styles.placeCardSub} numberOfLines={2}>
                {item.address}
              </Text>
              {onAction && actionLabel ? (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation?.();
                    onAction(item.id);
                  }}
                  style={styles.cardAction}
                >
                  <Text style={styles.cardActionText}>{actionLabel}</Text>
                </Pressable>
              ) : null}
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  profileLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  profileTextWrap: { flex: 1 },
  hello: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  profileName: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 2 },
  profileEmail: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  logoutBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  weatherCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    marginBottom: 16,
  },
  weatherTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  sectionEyebrow: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  weatherPlace: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 4, maxWidth: 220 },
  refreshChip: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  refreshText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  weatherLoading: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 10 },
  weatherBody: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 14 },
  temp: { color: '#fff', fontSize: 52, fontWeight: '800', letterSpacing: -1 },
  weatherMeta: { flex: 1 },
  weatherDesc: { color: '#fff', fontSize: 16, fontWeight: '700' },
  muted: { color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 4 },
  errorText: { color: '#FCA5A5', marginTop: 14, fontSize: 13 },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },
  sectionTitle: {
    color: AUTH_COLORS.ink,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 16,
  },
  routeRow: { flexDirection: 'row', gap: 12 },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 28 },
  dotSource: { backgroundColor: AUTH_COLORS.blue },
  dotDest: { backgroundColor: '#F59E0B' },
  routeLine: {
    width: 2,
    height: 18,
    backgroundColor: '#E5E7EB',
    marginLeft: 5,
    marginVertical: 4,
  },
  routeField: { flex: 1 },
  fieldLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  fieldValue: {
    color: AUTH_COLORS.ink,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: AUTH_COLORS.ink,
    backgroundColor: '#F9FAFB',
  },
  selectedDest: {
    marginTop: 8,
    color: AUTH_COLORS.link,
    fontSize: 13,
    fontWeight: '600',
  },
  hint: { marginTop: 10, color: '#6B7280', fontSize: 12 },
  suggestionBox: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  suggestionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionTitle: { color: AUTH_COLORS.ink, fontWeight: '700', fontSize: 14 },
  suggestionSub: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  sectionBlock: { marginBottom: 18 },
  emptyCard: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cardRow: { gap: 12, paddingTop: 12, paddingRight: 8 },
  placeCard: {
    width: 200,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  placeCardTitle: { color: '#fff', fontWeight: '800', fontSize: 15 },
  placeCardSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 6, lineHeight: 17 },
  cardAction: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cardActionText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
