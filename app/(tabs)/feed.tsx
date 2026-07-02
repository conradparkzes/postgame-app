import { StyleSheet, View } from 'react-native';
import { Colors } from '@/src/constants/colors';
import { StateView } from '@/src/components/ui/StateView';

// Fan Feed (Friends / For You / Trending) ships in the social layer (v0.7).
export default function FeedScreen() {
  return (
    <View style={styles.container}>
      <StateView
        icon="📡"
        title="The Fan Feed is coming"
        message={
          "Your friends' best in-stadium moments, ranked by the crowd.\nArriving in an upcoming update."
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
