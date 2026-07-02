import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Colors } from '@/src/constants/colors';

interface SkeletonProps {
  style?: StyleProp<ViewStyle>;
}

/**
 * Pulsing placeholder block. Size/shape it with the style prop:
 *   <Skeleton style={{ height: 78, borderRadius: 12 }} />
 */
export function Skeleton({ style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 650, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.base, style, { opacity }]} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surfaceRaised,
    borderRadius: 8,
  },
});
