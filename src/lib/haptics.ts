import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Thin wrappers — no-ops on web, never throw.

/** Subtle tick for selections (choosing a sport, toggling). */
export function tapHaptic() {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => {});
}

/** Light impact for small confirmations (tapping a star). */
export function lightHaptic() {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** Success notification for completed moments (game saved). */
export function successHaptic() {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
