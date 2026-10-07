import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

// Same sports as the Log tab's sport tiles: NFL, NBA, MLB, NHL, Soccer
const BALLS = ['🏈', '🏀', '⚾', '🏒', '⚽'];

interface BallSpinnerProps {
  visible: boolean;
  size?: number;
}

/**
 * Pull-to-refresh indicator: a randomly chosen sports emoji spinning
 * in place. A new one is drawn each time a refresh starts.
 */
export function BallSpinner({ visible, size = 26 }: BallSpinnerProps) {
  const spin = useRef(new Animated.Value(0)).current;
  const [ball, setBall] = useState(BALLS[0]);

  useEffect(() => {
    if (!visible) return;
    setBall(BALLS[Math.floor(Math.random() * BALLS.length)]);
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

  return (
    <Animated.Text
      style={{
        fontSize: size,
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
      {ball}
    </Animated.Text>
  );
}
