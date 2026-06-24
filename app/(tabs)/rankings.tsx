import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/src/constants/colors';

// Placeholder — Rankings / Leaderboards built in v1.1+.
export default function RankingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Rankings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  label: { fontSize: 18, color: Colors.textTertiary },
});
