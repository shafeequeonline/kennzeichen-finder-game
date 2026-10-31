import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Plate } from '../components/Plate';
import { ScreenFrame } from '../components/ScreenFrame';
import { Section } from '../components/Section';
import { Txt } from '../components/Txt';
import { WoodBoard } from '../components/WoodBoard';
import { speak, vibrate } from '../feedback';
import { ALL_STATES } from '../game/questions';
import { useGame } from '../GameContext';
import { pools } from '../plates';
import { colors } from '../theme';

const FACTS = [
  { emoji: '🔤', text: 'Die Buchstaben vorne verraten, woher ein Auto kommt. WOB steht zum Beispiel für Wolfsburg.' },
  { emoji: '🏙️', text: 'Große Städte haben oft nur einen Buchstaben: B ist Berlin, M ist München und K ist Köln.' },
  { emoji: '🇪🇺', text: 'Das blaue Feld links zeigt die Sterne der Europäischen Union. Das D darunter steht für Deutschland.' },
  { emoji: '🔵', text: 'In der Mitte kleben runde Plaketten. Sie zeigen, dass das Auto richtig angemeldet ist.' },
  { emoji: '🔢', text: 'Danach kommen noch ein oder zwei Buchstaben und ein paar Zahlen. Die kann man sich oft selbst aussuchen.' },
  { emoji: '🗺️', text: 'Deutschland hat 16 Bundesländer und über 700 verschiedene Ortskennzeichen.' },
  { emoji: '🚒', text: 'Manche Kennzeichen sind besonders: Y fahren Autos der Bundeswehr und THW das Technische Hilfswerk.' },
];

/** The capital of each federal state and its code, so every state has a memorable example. */
const CAPITALS: Record<string, string> = {
  'Baden-Württemberg': 'S',
  Bayern: 'M',
  Berlin: 'B',
  Brandenburg: 'P',
  Bremen: 'HB',
  Hamburg: 'HH',
  Hessen: 'WI',
  'Mecklenburg-Vorpommern': 'SN',
  Niedersachsen: 'H',
  'Nordrhein-Westfalen': 'D',
  'Rheinland-Pfalz': 'MZ',
  Saarland: 'SB',
  Sachsen: 'DD',
  'Sachsen-Anhalt': 'MD',
  'Schleswig-Holstein': 'KI',
  Thüringen: 'EF',
};

const MORE_PER_STATE = 8;

export function KnowledgeScreen({ onBack }: { onBack: () => void }) {
  const { settings } = useGame();
  const [open, setOpen] = useState<string | null>(null);
  const tap = () => settings.vibration && vibrate('tap');

  return (
    <ScreenFrame title="Wissen" onBack={onBack}>
      <WoodBoard>
        <Section title="Schon gewusst?" note="Tippe auf eine Karte, dann wird sie vorgelesen.">
          {FACTS.map((f) => (
            <Pressable
              key={f.emoji}
              onPress={() => {
                tap();
                speak(f.text);
              }}
              style={({ pressed }) => [styles.fact, pressed && styles.pressed]}
              accessibilityRole="button"
            >
              <Text style={styles.factEmoji}>{f.emoji}</Text>
              <Txt style={styles.factText}>{f.text}</Txt>
            </Pressable>
          ))}
        </Section>

        <Section title="Die 16 Bundesländer" note="Tippe auf ein Bundesland, um mehr Kennzeichen zu sehen.">
          {ALL_STATES.map((state) => {
            const capital = pools.leicht.find((p) => p.code === CAPITALS[state])!;
            const isOpen = open === state;
            const more = pools.mittel.filter((p) => p.state === state && p.code !== capital.code).slice(0, MORE_PER_STATE);
            return (
              <View key={state} style={styles.state}>
                <Pressable
                  onPress={() => {
                    tap();
                    setOpen(isOpen ? null : state);
                    if (!isOpen) speak(`${state}. Die Hauptstadt ist ${capital.name}.`);
                  }}
                  style={({ pressed }) => [styles.stateHeader, pressed && styles.pressed]}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isOpen }}
                >
                  <Plate code={capital.code} scale={0.5} />
                  <View style={styles.flex}>
                    <Txt weight="bold" style={styles.stateName}>{state}</Txt>
                    <Txt style={styles.capital}>Hauptstadt: {capital.name}</Txt>
                  </View>
                  <Txt weight="bold" style={styles.chevron}>{isOpen ? '−' : '+'}</Txt>
                </Pressable>
                {isOpen && more.length > 0 && (
                  <View style={styles.codes}>
                    {more.map((p) => (
                      <View key={p.code} style={styles.codeChip}>
                        <Txt weight="bold" style={styles.codeChipCode}>{p.code}</Txt>
                        <Txt style={styles.codeChipName}>{p.name}</Txt>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </Section>
      </WoodBoard>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.7 },
  fact: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: colors.woodLight,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.woodBorder,
    padding: 14,
  },
  factEmoji: { fontSize: 34 },
  factText: { flex: 1, fontSize: 18, lineHeight: 24 },
  state: {
    backgroundColor: colors.woodLight,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.woodBorder,
    overflow: 'hidden',
  },
  stateHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  stateName: { fontSize: 19 },
  capital: { fontSize: 16, color: colors.textMuted },
  chevron: { fontSize: 30, color: colors.woodDark, width: 24, textAlign: 'center' },
  codes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 12, paddingBottom: 12 },
  codeChip: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'baseline',
    backgroundColor: colors.white,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.plateText,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  codeChipCode: { fontSize: 17 },
  codeChipName: { fontSize: 15, color: colors.textMuted },
});
