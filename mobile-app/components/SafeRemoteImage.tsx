import { CLOUD } from '@/constants/cloudTheme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Image,
  type ImageProps,
  type ImageStyle,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type Props = {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  iconSize?: number;
  accessibilityLabel?: string;
} & Omit<ImageProps, 'source' | 'style'>;

/**
 * Remote image with neutral icon fallback — never ships as a blank gray rectangle.
 */
export function SafeRemoteImage({
  uri,
  style,
  containerStyle,
  iconSize = 28,
  accessibilityLabel,
  ...rest
}: Props) {
  const [failed, setFailed] = useState(!uri);

  if (failed || !uri) {
    return (
      <View
        style={[styles.fallback, style as ViewStyle, containerStyle]}
        accessibilityLabel={accessibilityLabel || 'Image unavailable'}
      >
        <Ionicons name="image-outline" size={iconSize} color={CLOUD.muted} />
      </View>
    );
  }

  return (
    <Image
      {...rest}
      source={{ uri }}
      style={style}
      accessibilityLabel={accessibilityLabel}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: CLOUD.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
