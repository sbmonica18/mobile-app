import { CLOUD } from '@/constants/cloudTheme';
import {
  describeLocationError,
  requireLiveUserLocation,
} from '@/services/locationService';
import { useDashboardStore } from '@/store/dashboardStore';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Blocks the app until this device returns a live GPS fix.
 * Never uses Navalur or another session's cached place.
 */
export function LiveLocationGate({ children }: { children: React.ReactNode }) {
  const colors = useThemeStore((s) => s.colors);
  const hasLiveFix = useDashboardStore((s) => s.hasLiveFix);
  const setLiveSource = useDashboardStore((s) => s.setLiveSource);
  const [busy, setBusy] = useState(!hasLiveFix);
  const [error, setError] = useState<string | null>(null);

  const capture = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const location = await requireLiveUserLocation();
      setLiveSource(location);
    } catch (e) {
      setError(describeLocationError(e));
    } finally {
      setBusy(false);
    }
  }, [setLiveSource]);

  useEffect(() => {
    if (!hasLiveFix) {
      void capture();
    }
  }, [capture, hasLiveFix]);

  if (hasLiveFix) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.lightBlue }]}>
          <Ionicons name="location" size={28} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.ink }]}>Your location is required</Text>
        <Text style={[styles.body, { color: colors.muted }]}>
          UrbanLens uses this device’s GPS when you sign in. Allow location when the browser or
          phone asks — this is your place, not a shared or demo location.
        </Text>
        {busy ? (
          <View style={styles.busyRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.busyText, { color: colors.body }]}>Finding your location…</Text>
          </View>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          onPress={() => void capture()}
          disabled={busy}
          style={[styles.btn, { backgroundColor: colors.primary, opacity: busy ? 0.7 : 1 }]}
        >
          <Text style={styles.btnText}>{busy ? 'Detecting…' : 'Use my location'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
        borderRadius: CLOUD.radius,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    ...CLOUD.shadows.card,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 18,
  },
  busyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  busyText: { fontSize: 14, fontWeight: '600' },
  error: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 14,
  },
  btn: {
    alignSelf: 'stretch',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
