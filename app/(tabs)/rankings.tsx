import { StyleSheet, View } from 'react-native';
import { Colors } from '@/src/constants/colors';
import { StateView } from '@/src/components/ui/StateView';

// Rankings / Leaderboards ship after the core loop is polished.
export default function RankingsScreen() {
  return (
    <View style={styles.container}>
      <StateView
        icon="🏆"
        title="Rankings are coming"
        message={
          'Rank every game and stadium you’ve been to, and see how they stack up.\nArriving in an upcoming update.'
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
