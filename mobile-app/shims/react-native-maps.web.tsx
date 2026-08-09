import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/** Web stub — react-native-maps is native-only. */
const MapView = React.forwardRef(function MapViewWeb(
  { style, children, ...rest }: any,
  _ref: any,
) {
  return (
    <View style={[styles.map, style]} {...rest}>
      <Text style={styles.hint}>Map preview is available on iOS / Android</Text>
      {children}
    </View>
  );
});

export const Marker = ({ children }: any) => <>{children ?? null}</>;
export const Polyline = (_props: any) => null;
export const UrlTile = (_props: any) => null;
export const Callout = ({ children }: any) => <>{children ?? null}</>;
export const Circle = (_props: any) => null;
export const Polygon = (_props: any) => null;
export const Overlay = (_props: any) => null;
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';

const styles = StyleSheet.create({
  map: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

export default MapView;
