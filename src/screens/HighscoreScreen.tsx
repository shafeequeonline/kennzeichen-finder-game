import { useState } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { Choice } from '../components/Choice';
import { ScreenFrame } from '../components/ScreenFrame';
import { Stars } from '../components/Stars';
import { Txt } from '../components/Txt';
import { WoodBoard } from '../components/WoodBoard';
import { ROUND_LENGTH, starsFor, type Difficulty } from '../game/questions';
import { useGame } from '../GameContext';
import { highscoreKey } from '../storage';
import { colors } from '../theme';
import { DIFFICULTIES, TIMER_OPTIONS } from './labels';

const ROUNDS: { mode: 'city' | 'state'; title: string; icon: ImageSourcePropType }[] = [
  { mode: 'city', title: 'Stadt raten', icon: require('../../assets/images/icon-city.png') },
  { mode: 'state', title: 'Bundesland raten', icon: require('../../assets/images/icon-state.png') },
];

export function HighscoreScreen({ onBack }: { onBack: () => void }) {
  const { settings, highscores } = useGame();
  const [difficulty, setDifficulty] = useState<Difficulty>(settings.difficulty);

  return (
    <ScreenFrame title="Highscore" onBack={onBack}>
      <WoodBoard>
        <Choice options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />

        {ROUNDS.map((r) => {
          const best = highscores[highscoreKey(r.mode, difficulty, 60)];
          return (
            <View key={r.mode} style={styles.card}>
              <Image source={r.icon} style={styles.icon} resizeMode="contain" />
              <View style={styles.flex}>
                <Txt weight="bold" style={styles.title}>{r.title}</Txt>
                {best === undefined ? (
                  <Txt style={styles.empty}>Noch nicht gespielt</Txt>
                ) : (
                  <View style={styles.scoreRow}>
                    <Txt weight="bold" style={styles.score}>{best} / {ROUND_LENGTH}</Txt>
                    <Stars count={starsFor(best)} size={22} />
                  </View>
                )}
              </View>
            </View>
          );
        })}

        <View style={styles.card}>
          <Image source={require('../../assets/images/icon-timer.png')} style={styles.icon} resizeMode="contain" />
          <View style={[styles.flex, styles.timed]}>
            <Txt weight="bold" style={styles.title}>Zeit-Quiz</Txt>
            {TIMER_OPTIONS.map((t) => {
              const best = highscores[highscoreKey('timed', difficulty, t.value)];
              return (
                <View key={t.value} style={styles.timedRow}>
                  <Txt style={styles.timedLabel}>⏱️ {t.label}</Txt>
                  <Txt weight="bold" style={best === undefined ? styles.empty : styles.score}>
                    {best === undefined ? '–' : `${best} richtig`}
                  </Txt>
                </View>
              );
            })}
          </View>
        </View>
      </WoodBoard>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.woodLight,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.woodBorder,
    padding: 12,
  },
  icon: { width: 64, height: 60 },
  title: { fontSize: 21 },
  empty: { fontSize: 17, color: colors.textMuted },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  score: { fontSize: 20, color: colors.blueDark },
  timed: { gap: 2 },
  timedRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timedLabel: { fontSize: 18 },
});
