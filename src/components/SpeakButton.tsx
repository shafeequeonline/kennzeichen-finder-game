import { StyleSheet, Text } from 'react-native';
import { colors } from '../theme';
import { ChunkyButton } from './ChunkyButton';

/** Reads text aloud for children who can't read yet. */
export function SpeakButton({ onPress }: { onPress: () => void }) {
  return (
    <ChunkyButton
      onPress={onPress}
      face={colors.white}
      edge={colors.blueLight}
      radius={26}
      accessibilityLabel="Vorlesen"
      contentStyle={styles.button}
    >
      <Text style={styles.icon}>🔊</Text>
    </ChunkyButton>
  );
}

const styles = StyleSheet.create({
  button: { width: 52, height: 46, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 24 },
});
