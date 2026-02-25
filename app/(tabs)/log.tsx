import { StyleSheet, Text, View } from 'react-native';

// Placeholder — Game log list built in v0.4.
export default function LogScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Log</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  label: { fontSize: 18, color: '#888' },
});
