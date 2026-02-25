import { StyleSheet, Text, View } from 'react-native';

// Placeholder — full welcome/onboarding UI built in v0.2.
export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PostGame</Text>
      <Text style={styles.subtitle}>Welcome screen — v0.2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
});
