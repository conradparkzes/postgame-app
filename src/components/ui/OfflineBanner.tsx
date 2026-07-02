import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { Colors } from '@/src/constants/colors';

/**
 * Slim banner that slides down from the top edge whenever the device
 * loses its internet connection, and slides away when it returns.
 * Mounted once at the root so it overlays every screen.
 */
export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const [offline, setOffline] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOffline(state.isConnected === false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: offline ? 1 : 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [offline, anim]);

  const height = insets.top + 34;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.banner,
        {
          height,
          paddingTop: insets.top,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [-height, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.text}>No internet connection</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: Colors.surfaceRaised,
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
