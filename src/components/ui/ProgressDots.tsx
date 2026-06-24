import { StyleSheet, View } from 'react-native';
import { Colors } from '@/src/constants/colors';

interface ProgressDotsProps {
  total: number;   // total number of steps
  current: number; // 0-indexed current step
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i === current ? styles.dotActive : styles.dotInactive]}
        />
      ))}
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
    width: 16,
    backgroundColor: Colors.accent,
  },
  dotInactive: {
    width: 6,
    backgroundColor: Colors.surfaceBorder,
  },
});
