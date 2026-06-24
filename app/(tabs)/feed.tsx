import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/src/constants/colors';

// Placeholder — Fan Feed (Friends / For You / Trending) built in v1.1.
export default function FeedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Feed</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  label: { fontSize: 18, color: Colors.textTertiary },
});
