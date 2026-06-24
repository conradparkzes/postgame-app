import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/src/constants/colors';

// Placeholder — tab press is intercepted in _layout.tsx to open the (log) modal.
export default function LogScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Log</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  label: { fontSize: 18, color: Colors.textTertiary },
});
