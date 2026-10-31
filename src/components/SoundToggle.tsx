import { StyleSheet, Text } from 'react-native';
import { useGame } from '../GameContext';
import { playSound } from '../sounds';
import { colors } from '../theme';
import { ChunkyButton } from './ChunkyButton';

/** Header button that turns the answer sounds on and off; same setting as in Einstellungen. */
export function SoundToggle() {
  const { settings, updateSettings } = useGame();
  const on = settings.sounds;
  return (
    <ChunkyButton
      onPress={() => {
        updateSettings({ sounds: !on });
        if (!on) playSound('correct');
      }}
      face={on ? colors.white : colors.tileGray}
      edge={colors.blueLight}
      radius={26}
      accessibilityLabel={on ? 'Geräusche ausschalten' : 'Geräusche einschalten'}
      contentStyle={styles.button}
    >
      <Text style={styles.icon}>{on ? '🔔' : '🔕'}</Text>
    </ChunkyButton>
  );
}

const styles = StyleSheet.create({
  button: { width: 52, height: 46, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 24 },
});
