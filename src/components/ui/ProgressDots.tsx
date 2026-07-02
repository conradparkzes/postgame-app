import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Colors } from '@/src/constants/colors';

interface ProgressDotsProps {
  total: number;   // total number of steps
  current: number; // 0-indexed current step
}

/**
 * Step indicator: completed steps are dim honey dots, the current step
 * is a honey pill that grows into place on mount, upcoming steps are grey.
 */
export function ProgressDots({ total, current }: ProgressDotsProps) {
  const grow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(grow, {
      toValue: 1,
      tension: 120,
      friction: 9,
      useNativeDriver: false, // animates width (layout prop)
    }).start();
  }, [grow]);

  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => {
        if (i === current) {
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                styles.dotActive,
                { width: grow.interpolate({ inputRange: [0, 1], outputRange: [6, 18] }) },
              ]}
            />
          );
        }
        return (
          <View
            key={i}
            style={[styles.dot, i < current ? styles.dotDone : styles.dotUpcoming]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  dot: {
    borderRadius: 4,
    height: 6,
  },
  dotActive: {
    backgroundColor: Colors.accent,
  },
  dotDone: {
    width: 6,
    backgroundColor: Colors.accentDim,
  },
  dotUpcoming: {
    width: 6,
    backgroundColor: Colors.surfaceBorder,
  },
});
