import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/src/constants/colors';

interface PhotoThumbProps {
  uri: string;
  size?: number;
  onPress?: () => void;
  onRemove?: () => void;
}

/**
 * Square photo thumbnail with an optional inset remove badge.
 * The badge sits inside the image bounds so it never gets clipped
 * by scroll containers.
 */
export function PhotoThumb({ uri, size = 100, onPress, onRemove }: PhotoThumbProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [styles.imageWrap, pressed && !!onPress && styles.pressed]}
      >
        <Image source={{ uri }} style={styles.image} />
      </Pressable>
      {onRemove && (
        <Pressable
          onPress={onRemove}
          hitSlop={10}
          style={({ pressed }) => [styles.removeBadge, pressed && styles.removePressed]}
        >
          <Text style={styles.removeGlyph}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imageWrap: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceRaised,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pressed: {
    opacity: 0.8,
  },
  removeBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(8,8,8,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePressed: {
    backgroundColor: 'rgba(8,8,8,0.95)',
  },
  removeGlyph: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
});
