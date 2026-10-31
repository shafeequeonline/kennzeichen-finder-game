import { useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { ChunkyButton } from '../components/ChunkyButton';
import { Choice } from '../components/Choice';
import { ScreenFrame } from '../components/ScreenFrame';
import { Section } from '../components/Section';
import { Txt } from '../components/Txt';
import { WoodBoard } from '../components/WoodBoard';
import { speak } from '../feedback';
import { useGame } from '../GameContext';
import { colors } from '../theme';
import { DIFFICULTIES, TIMER_OPTIONS } from './labels';

const ON_OFF = [
  { value: true, label: 'An' },
  { value: false, label: 'Aus' },
];

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { settings, updateSettings, resetHighscores } = useGame();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const difficulty = DIFFICULTIES.find((d) => d.value === settings.difficulty)!;

  return (
    <ScreenFrame title="Einstellungen" onBack={onBack}>
      <WoodBoard>
        <Section title="Schwierigkeit" note={difficulty.note}>
          <Choice options={DIFFICULTIES} value={settings.difficulty} onChange={(d) => updateSettings({ difficulty: d })} />
        </Section>

        <Section title="Zeit für das Zeit-Quiz">
          <Choice options={TIMER_OPTIONS} value={settings.timerSeconds} onChange={(t) => updateSettings({ timerSeconds: t })} />
        </Section>

        <Section title="Vorlesen" note="Die Fragen werden laut vorgelesen. Gut für Kinder, die noch nicht lesen können.">
          <Choice
            options={ON_OFF}
            value={settings.readAloud}
            onChange={(on) => {
              updateSettings({ readAloud: on });
              if (on) speak('Ich lese dir die Fragen vor!');
            }}
          />
        </Section>

        {Platform.OS !== 'web' && (
          <Section title="Vibrieren" note="Das Handy vibriert kurz bei richtigen und falschen Antworten.">
            <Choice options={ON_OFF} value={settings.vibration} onChange={(on) => updateSettings({ vibration: on })} />
          </Section>
        )}

        <Section
          title="Highscores löschen"
          note={confirmReset ? 'Wirklich alle Rekorde löschen? Frag lieber vorher deine Eltern.' : undefined}
        >
          {resetDone ? (
            <Txt weight="semibold" style={styles.done}>✅ Alle Highscores wurden gelöscht.</Txt>
          ) : confirmReset ? (
            <Choice
              options={[
                { value: 'yes', label: 'Ja, löschen' },
                { value: 'no', label: 'Nein' },
              ]}
              value=""
              onChange={(answer) => {
                if (answer === 'yes') {
                  resetHighscores();
                  setResetDone(true);
                }
                setConfirmReset(false);
              }}
            />
          ) : (
            <ChunkyButton
              onPress={() => setConfirmReset(true)}
              face={colors.white}
              edge={colors.wrongDark}
              rim={colors.woodLight}
              radius={16}
              contentStyle={styles.reset}
            >
              <Txt weight="bold" style={styles.resetText}>🗑️ Highscores löschen</Txt>
            </ChunkyButton>
          )}
        </Section>
      </WoodBoard>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  reset: { paddingVertical: 12, alignItems: 'center' },
  resetText: { fontSize: 18, color: colors.wrongDark },
  done: { fontSize: 17, color: colors.correctDark },
});
