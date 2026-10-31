import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { ChunkyButton } from '../components/ChunkyButton';
import { Plate } from '../components/Plate';
import { ScreenFrame } from '../components/ScreenFrame';
import { SoundToggle } from '../components/SoundToggle';
import { SpeakButton } from '../components/SpeakButton';
import { Stars } from '../components/Stars';
import { Txt } from '../components/Txt';
import { WoodBoard } from '../components/WoodBoard';
import { speak, spell, stopSpeaking, vibrate } from '../feedback';
import { makeQuestion, ROUND_LENGTH, starsFor, type Question } from '../game/questions';
import { useGame } from '../GameContext';
import { pools } from '../plates';
import { playSound, preloadSounds } from '../sounds';
import type { Mode } from '../storage';
import { colors } from '../theme';

const TITLES: Record<Mode, string> = { city: 'Stadt raten', state: 'Bundesland raten', timed: 'Zeit-Quiz' };
const PRAISE = ['Super!', 'Toll gemacht!', 'Richtig!', 'Klasse!', 'Spitze!', 'Prima!'];
const useNativeDriver = Platform.OS !== 'web';

type Result = { score: number; stars: 1 | 2 | 3; newRecord: boolean };

function questionText(q: Question): string {
  return q.kind === 'city'
    ? 'Aus welchem Ort kommt dieses Kennzeichen?'
    : `In welchem Bundesland liegt ${q.place.name}?`;
}

function spokenQuestion(q: Question): string {
  return q.kind === 'city'
    ? `Aus welchem Ort kommt das Kennzeichen ${spell(q.place.code)}?`
    : `In welchem Bundesland liegt ${q.place.name}? Das Kennzeichen ist ${spell(q.place.code)}.`;
}

export function QuizScreen({ mode, onExit }: { mode: Mode; onExit: () => void }) {
  const { settings, recordScore } = useGame();
  const { difficulty, readAloud, sounds, vibration, timerSeconds } = settings;
  const timed = mode === 'timed';
  const pool = pools[difficulty];

  const asked = useRef(new Set<string>());
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [question, setQuestion] = useState<Question>(() => nextQuestion());
  const [number, setNumber] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [praise, setPraise] = useState(PRAISE[0]);
  const [timeLeft, setTimeLeft] = useState<number>(timerSeconds);
  const [result, setResult] = useState<Result | null>(null);

  const pop = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;

  function nextQuestion(): Question {
    const kind = mode === 'timed' ? (Math.random() < 0.5 ? 'city' : 'state') : mode;
    const q = makeQuestion(kind, pool, difficulty, Math.random, asked.current);
    asked.current.add(q.place.code);
    return q;
  }

  const say = useCallback((text: string) => readAloud && speak(text), [readAloud]);

  const finish = useCallback(
    (finalScore: number) => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      const stars = starsFor(finalScore, timed ? timerSeconds / 5 : ROUND_LENGTH);
      const newRecord = recordScore(mode, finalScore);
      setResult({ score: finalScore, stars, newRecord });
      say(
        timed
          ? `Die Zeit ist um! Du hast ${finalScore} richtig.${newRecord ? ' Neuer Rekord!' : ''}`
          : `Geschafft! Du hast ${finalScore} von ${ROUND_LENGTH} richtig.${newRecord ? ' Neuer Rekord!' : ''}`,
      );
      if (sounds) playSound('correct');
      if (vibration) vibrate('correct');
    },
    [mode, timed, timerSeconds, recordScore, say, sounds, vibration],
  );

  // Read each new question aloud. The timed quiz moves too fast for that; its speaker button still works.
  useEffect(() => {
    if (!timed && !result) say(spokenQuestion(question));
  }, [question, timed, result, say]);

  useEffect(() => {
    preloadSounds();
    return () => {
      stopSpeaking();
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  // Countdown for the timed quiz. Refs keep the tick steady: re-renders from answering don't restart it.
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const finishRef = useRef(finish);
  finishRef.current = finish;
  useEffect(() => {
    if (!timed || result) return;
    if (timeLeft <= 0) {
      finishRef.current(scoreRef.current);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timed, timeLeft, result]);

  const choose = (option: string) => {
    if (picked || result) return;
    const correct = option === question.answer;
    const nextScore = correct ? score + 1 : score;
    setPicked(option);
    setScore(nextScore);
    setStreak(correct ? streak + 1 : 0);
    if (sounds) playSound(correct ? 'correct' : 'wrong');
    if (vibration) vibrate(correct ? 'correct' : 'wrong');

    if (correct) {
      const word = PRAISE[Math.floor(Math.random() * PRAISE.length)];
      setPraise(word);
      if (!timed) say(word);
      pop.setValue(0);
      Animated.spring(pop, { toValue: 1, friction: 4, useNativeDriver }).start();
    } else {
      if (!timed) say(`Fast! Richtig ist ${question.answer}.`);
      shake.setValue(0);
      Animated.sequence(
        [10, -10, 8, -8, 0].map((toValue) => Animated.timing(shake, { toValue, duration: 60, useNativeDriver })),
      ).start();
    }

    const delay = timed ? (correct ? 500 : 1300) : correct ? 1400 : 2600;
    advanceTimer.current = setTimeout(() => {
      if (!timed && number >= ROUND_LENGTH) {
        finish(nextScore);
        return;
      }
      setPicked(null);
      setNumber((n) => n + 1);
      setQuestion(nextQuestion());
    }, delay);
  };

  const restart = () => {
    asked.current = new Set();
    setScore(0);
    setStreak(0);
    setNumber(1);
    setPicked(null);
    setTimeLeft(timerSeconds);
    setResult(null);
    setQuestion(nextQuestion());
  };

  const speakAll = () =>
    speak(`${spokenQuestion(question)} Ist es ${question.options.slice(0, -1).join(', ')} oder ${question.options.at(-1)}?`);

  if (result) {
    return (
      <ScreenFrame title={TITLES[mode]} onBack={onExit}>
        <ResultView mode={mode} result={result} timerSeconds={timerSeconds} onAgain={restart} onMenu={onExit} />
      </ScreenFrame>
    );
  }

  const progress = timed ? timeLeft / timerSeconds : (number - (picked ? 0 : 1)) / ROUND_LENGTH;
  const isCorrect = picked === question.answer;

  return (
    <ScreenFrame
      title={TITLES[mode]}
      onBack={onExit}
      right={
        <View style={styles.headerButtons}>
          <SoundToggle />
          <SpeakButton onPress={speakAll} />
        </View>
      }
    >
      <View style={styles.status}>
        <Txt weight="bold" style={styles.statusText}>
          {timed ? `⏱️ ${timeLeft} s` : `Frage ${number} von ${ROUND_LENGTH}`}
        </Txt>
        <Txt weight="bold" style={styles.statusText}>⭐ {score}</Txt>
      </View>
      <Road progress={progress} timed={timed} warning={timed && timeLeft <= 10} />

      <WoodBoard style={styles.board}>
        <Animated.View style={{ transform: [{ translateX: shake }] }}>
          <Plate code={question.place.code} scale={1.15} />
        </Animated.View>
        {question.kind === 'state' && (
          <Txt weight="semibold" style={styles.hint}>
            📍 {question.place.name}
          </Txt>
        )}
        <Txt weight="semibold" style={styles.question}>
          {questionText(question)}
        </Txt>

        <View style={styles.answers}>
          {question.options.map((option) => {
            const isAnswer = option === question.answer;
            const state = !picked ? 'idle' : isAnswer ? 'right' : option === picked ? 'wrong' : 'faded';
            return (
              <ChunkyButton
                key={option}
                onPress={() => choose(option)}
                disabled={!!picked}
                face={state === 'right' ? colors.correct : state === 'wrong' ? colors.wrong : colors.white}
                edge={state === 'right' ? colors.correctDark : state === 'wrong' ? colors.wrongDark : colors.woodBorder}
                rim={state === 'idle' || state === 'faded' ? colors.woodLight : 'rgba(255,255,255,0.5)'}
                radius={18}
                style={state === 'faded' && styles.faded}
                contentStyle={styles.answer}
                accessibilityLabel={option}
              >
                <Txt
                  weight="bold"
                  style={[styles.answerText, (state === 'right' || state === 'wrong') && { color: colors.white }]}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                >
                  {state === 'right' ? '✅ ' : state === 'wrong' ? '❌ ' : ''}
                  {option}
                </Txt>
              </ChunkyButton>
            );
          })}
        </View>

        <View style={styles.feedback}>
          {picked && isCorrect && (
            <Animated.View style={{ transform: [{ scale: pop }] }}>
              <Txt weight="bold" style={[styles.feedbackText, { color: colors.correctDark }]}>
                🎉 {praise}
                {streak >= 3 ? `  🔥 ${streak} hintereinander!` : ''}
              </Txt>
            </Animated.View>
          )}
          {picked && !isCorrect && (
            <Txt weight="bold" style={[styles.feedbackText, { color: colors.woodDark }]}>
              Fast! Richtig ist: {question.answer}
            </Txt>
          )}
        </View>
      </WoodBoard>
    </ScreenFrame>
  );
}

/** A little road the car drives along as the round goes on; in the timed quiz it shows the time left. */
function Road({ progress, timed, warning }: { progress: number; timed: boolean; warning: boolean }) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={styles.road}>
      <View style={styles.roadLine} />
      {timed ? (
        <View style={[styles.timeFill, { width: `${clamped * 100}%`, backgroundColor: warning ? colors.wrong : colors.yellow }]} />
      ) : (
        <Text style={[styles.flag]}>🏁</Text>
      )}
      <View style={[styles.carSlot, { left: `${clamped * 88}%` }]}>
        <Text style={styles.car}>🚗</Text>
      </View>
    </View>
  );
}

function ResultView({
  mode,
  result,
  timerSeconds,
  onAgain,
  onMenu,
}: {
  mode: Mode;
  result: Result;
  timerSeconds: number;
  onAgain: () => void;
  onMenu: () => void;
}) {
  return (
    <WoodBoard style={styles.resultBoard}>
      <Text style={styles.resultEmoji}>{result.newRecord ? '🏆' : result.stars === 3 ? '🎉' : '🚗'}</Text>
      <Txt weight="bold" style={styles.resultTitle}>
        {mode === 'timed' ? 'Zeit ist um!' : 'Geschafft!'}
      </Txt>
      <Stars count={result.stars} size={44} />
      <Txt weight="semibold" style={styles.resultText}>
        {mode === 'timed'
          ? `Du hast in ${timerSeconds} Sekunden ${result.score} Kennzeichen richtig erraten!`
          : `Du hast ${result.score} von ${ROUND_LENGTH} Kennzeichen richtig erraten!`}
      </Txt>
      {result.newRecord && (
        <View style={styles.record}>
          <Txt weight="bold" style={styles.recordText}>Neuer Rekord! 🥳</Txt>
        </View>
      )}
      <ChunkyButton onPress={onAgain} face={colors.orange} edge={colors.orangeDark} rim={colors.orangeLight} contentStyle={styles.resultButton}>
        <Txt weight="bold" style={styles.resultButtonText}>🔁 Nochmal spielen</Txt>
      </ChunkyButton>
      <ChunkyButton onPress={onMenu} face={colors.blue} edge={colors.blueDark} rim={colors.blueLight} contentStyle={styles.resultButton}>
        <Txt weight="bold" style={styles.resultButtonText}>🏠 Zum Menü</Txt>
      </ChunkyButton>
    </WoodBoard>
  );
}

const styles = StyleSheet.create({
  headerButtons: { flexDirection: 'row', gap: 8 },
  status: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 6 },
  statusText: {
    fontSize: 20,
    color: colors.white,
    textShadowColor: 'rgba(14,79,166,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  road: {
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B7280',
    borderWidth: 3,
    borderColor: '#4B5563',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 14,
  },
  roadLine: { position: 'absolute', left: 12, right: 12, borderTopWidth: 3, borderStyle: 'dashed', borderColor: '#F9FAFB' },
  timeFill: { position: 'absolute', left: 0, top: 0, bottom: 0, opacity: 0.85 },
  flag: { position: 'absolute', right: 8, fontSize: 22 },
  carSlot: { position: 'absolute', top: 2 },
  car: { fontSize: 26, transform: [{ scaleX: -1 }] },
  board: { paddingTop: 24 },
  hint: { fontSize: 22, textAlign: 'center', color: colors.woodDark },
  question: { fontSize: 21, lineHeight: 27, textAlign: 'center' },
  answers: { gap: 10 },
  answer: { minHeight: 62, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  answerText: { fontSize: 22, textAlign: 'center' },
  faded: { opacity: 0.45 },
  feedback: { minHeight: 34, alignItems: 'center', justifyContent: 'center' },
  feedbackText: { fontSize: 21, textAlign: 'center' },
  resultBoard: { alignItems: 'stretch', paddingVertical: 28 },
  resultEmoji: { fontSize: 72, textAlign: 'center' },
  resultTitle: { fontSize: 36, textAlign: 'center', color: colors.woodDark },
  resultText: { fontSize: 20, lineHeight: 26, textAlign: 'center' },
  record: { alignSelf: 'center', backgroundColor: colors.yellow, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 6 },
  recordText: { fontSize: 20, color: colors.woodDark },
  resultButton: { paddingVertical: 14, alignItems: 'center' },
  resultButtonText: { fontSize: 22, color: colors.white },
});
