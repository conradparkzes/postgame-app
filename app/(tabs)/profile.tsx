import { StyleSheet, Text, View } from 'react-native';

// Placeholder — Profile screen (game count, stats, log) built in v0.4.
export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Profile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  label: { fontSize: 18, color: '#888' },
});
