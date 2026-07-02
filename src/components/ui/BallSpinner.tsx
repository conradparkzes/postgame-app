import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Colors } from '@/src/constants/colors';

type BallKind = 'basketball' | 'baseball' | 'soccer' | 'football' | 'puck';

const KINDS: BallKind[] = ['basketball', 'baseball', 'soccer', 'football', 'puck'];

const STROKE = 1.8;

/** Circle outline with cross seams and side arcs. */
function Basketball({ size, color }: { size: number; color: string }) {
  const arc = size * 0.78;
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, borderColor: color }]}>
      <View style={{ position: 'absolute', width: size, height: STROKE, backgroundColor: color }} />
      <View style={{ position: 'absolute', width: STROKE, height: size, backgroundColor: color }} />
      <View style={[styles.circleAbs, { width: arc, height: arc, borderRadius: arc / 2, borderColor: color, left: -arc * 0.72, top: (size - arc) / 2 - STROKE }]} />
      <View style={[styles.circleAbs, { width: arc, height: arc, borderRadius: arc / 2, borderColor: color, right: -arc * 0.72, top: (size - arc) / 2 - STROKE }]} />
    </View>
  );
}

/** Circle outline with two facing seam arcs. */
function Baseball({ size, color }: { size: number; color: string }) {
  const arc = size * 0.95;
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, borderColor: color }]}>
      <View style={[styles.circleAbs, { width: arc, height: arc, borderRadius: arc / 2, borderColor: color, left: -arc * 0.6, top: (size - arc) / 2 - STROKE }]} />
      <View style={[styles.circleAbs, { width: arc, height: arc, borderRadius: arc / 2, borderColor: color, right: -arc * 0.6, top: (size - arc) / 2 - STROKE }]} />
    </View>
  );
}

/** Circle outline with a center pentagon dot and radiating panel lines. */
function Soccer({ size, color }: { size: number; color: string }) {
  const dot = size * 0.24;
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, borderColor: color }]}>
      <View style={{ width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color }} />
      {[0, 72, 144, 216, 288].map((deg) => (
        <View
          key={deg}
          style={{
            position: 'absolute',
            width: STROKE,
            height: size * 0.17,
            backgroundColor: color,
            transform: [{ rotate: `${deg}deg` }, { translateY: -size * 0.24 }],
          }}
        />
      ))}
    </View>
  );
}

/** Rotated ellipse outline with a lace spine and ticks. */
function Football({ size, color }: { size: number; color: string }) {
  return (
    <View
      style={{
        width: size,
        height: size * 0.62,
        borderRadius: size * 0.31,
        borderWidth: STROKE,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-40deg' }],
      }}
    >
      <View style={{ position: 'absolute', width: size * 0.36, height: STROKE, backgroundColor: color }} />
      <View style={{ flexDirection: 'row', gap: size * 0.09 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ width: STROKE, height: size * 0.16, backgroundColor: color }} />
        ))}
      </View>
    </View>
  );
}

/** Flat rounded-rect outline. */
function Puck({ size, color }: { size: number; color: string }) {
  return (
    <View
      style={{
        width: size * 0.92,
        height: size * 0.42,
        borderRadius: size * 0.13,
        borderWidth: STROKE,
        borderColor: color,
      }}
    />
  );
}

const BALL_COMPONENTS: Record<BallKind, typeof Basketball> = {
  basketball: Basketball,
  baseball: Baseball,
  soccer: Soccer,
  football: Football,
  puck: Puck,
};

interface BallSpinnerProps {
  visible: boolean;
  size?: number;
  color?: string;
}

/**
 * Pull-to-refresh indicator: a randomly chosen sports ball — drawn as
 * outline elements matching the tab-icon style — spinning in place.
 * A new ball is drawn each time a refresh starts.
 */
export function BallSpinner({ visible, size = 28, color = Colors.accent }: BallSpinnerProps) {
  const spin = useRef(new Animated.Value(0)).current;
  const [kind, setKind] = useState<BallKind>('basketball');

  useEffect(() => {
    if (!visible) return;
    setKind(KINDS[Math.floor(Math.random() * KINDS.length)]);
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
      spin.setValue(0);
    };
  }, [visible, spin]);

  if (!visible) return null;

  const Ball = BALL_COMPONENTS[kind];

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [
          {
            rotate: spin.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            }),
          },
        ],
      }}
    >
      <Ball size={size} color={color} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderWidth: STROKE,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleAbs: {
    position: 'absolute',
    borderWidth: STROKE,
  },
});
