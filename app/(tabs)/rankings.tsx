import { StyleSheet, Text, View } from 'react-native';

// Placeholder — Rankings / Leaderboards built in v1.1+.
export default function RankingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Rankings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  label: { fontSize: 18, color: '#888' },
});
