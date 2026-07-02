import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/src/constants/colors';

interface IconProps {
  color: string;
  size?: number;
}

/**
 * Feed — globe outline with feed lines inside.
 * The varied bar widths follow the circle's curve, reading as
 * latitude lines / a content feed at the same time.
 */
export function FeedIcon({ color, size = 25 }: IconProps) {
  return (
    <View
      style={[
        styles.globe,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
        },
      ]}
    >
      <View style={[styles.feedBar, { width: size * 0.42, backgroundColor: color }]} />
      <View style={[styles.feedBar, { width: size * 0.56, backgroundColor: color }]} />
      <View style={[styles.feedBar, { width: size * 0.42, backgroundColor: color }]} />
    </View>
  );
}

/** Log — plus symbol. */
export function LogIcon({ color, size = 25 }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          width: size * 0.72,
          height: 2.4,
          borderRadius: 1.2,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 2.4,
          height: size * 0.72,
          borderRadius: 1.2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

/** Rankings — podium (2nd / 1st / 3rd). */
export function PodiumIcon({ color, size = 25 }: IconProps) {
  return (
    <View style={[styles.podium, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.26,
          height: size * 0.55,
          backgroundColor: color,
          borderTopLeftRadius: 2,
        }}
      />
      <View
        style={{
          width: size * 0.26,
          height: size * 0.8,
          backgroundColor: color,
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
        }}
      />
      <View
        style={{
          width: size * 0.26,
          height: size * 0.4,
          backgroundColor: color,
          borderTopRightRadius: 2,
        }}
      />
    </View>
  );
}

interface ProfileTabIconProps extends IconProps {
  focused: boolean;
  avatarUrl: string | null;
  initial: string;
}

/** Profile — the user's avatar photo (honey ring when active), initials fallback. */
export function ProfileTabIcon({ color, focused, avatarUrl, initial, size = 26 }: ProfileTabIconProps) {
  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: focused ? 1.8 : 1,
          borderColor: focused ? Colors.accent : Colors.border,
        }}
      />
    );
  }
  return (
    <View
      style={[
        styles.initialCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
        },
      ]}
    >
      <Text style={[styles.initial, { color }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  globe: {
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  feedBar: {
    height: 2,
    borderRadius: 1,
  },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
  },
  initialCircle: {
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontSize: 11,
    fontWeight: '700',
  },
});
