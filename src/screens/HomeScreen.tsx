import { Image, ScrollView, StyleSheet, useWindowDimensions, View, type ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChunkyButton } from '../components/ChunkyButton';
import { PlayIcon } from '../components/PlayIcon';
import { Txt } from '../components/Txt';
import { WoodBoard } from '../components/WoodBoard';
import type { Mode } from '../storage';
import { colors, MAX_WIDTH } from '../theme';

export type MenuTarget = 'highscore' | 'knowledge' | 'settings';

const hero = require('../../assets/images/hero.png');
const HERO_RATIO = 941 / 702;

const MODES: { mode: Mode; title: string; subtitle: string; icon: ImageSourcePropType; face: string; edge: string; rim: string }[] = [
  {
    mode: 'city',
    title: 'Stadt raten',
    subtitle: 'Aus welchem Ort kommt dieses Kennzeichen?',
    icon: require('../../assets/images/icon-city.png'),
    face: colors.blue,
    edge: colors.blueDark,
    rim: colors.blueLight,
  },
  {
    mode: 'state',
    title: 'Bundesland raten',
    subtitle: 'In welchem Bundesland liegt dieses Kennzeichen?',
    icon: require('../../assets/images/icon-state.png'),
    face: colors.purple,
    edge: colors.purpleDark,
    rim: colors.purpleLight,
  },
  {
    mode: 'timed',
    title: 'Zeit-Quiz',
    subtitle: 'Wie viele schaffst du in der vorgegebenen Zeit?',
    icon: require('../../assets/images/icon-timer.png'),
    face: colors.orange,
    edge: colors.orangeDark,
    rim: colors.orangeLight,
  },
];

const TILES: { target: MenuTarget; label: string; icon: ImageSourcePropType; face: string; edge: string }[] = [
  { target: 'highscore', label: 'Highscore', icon: require('../../assets/images/icon-trophy.png'), face: colors.tilePurple, edge: '#9C78CC' },
  { target: 'knowledge', label: 'Wissen', icon: require('../../assets/images/icon-book.png'), face: colors.tileGreen, edge: '#6DAF4A' },
  { target: 'settings', label: 'Einstellungen', icon: require('../../assets/images/icon-gear.png'), face: colors.tileGray, edge: '#8796AD' },
];

export function HomeScreen({ onPlay, onOpen }: { onPlay: (mode: Mode) => void; onOpen: (target: MenuTarget) => void }) {
  const insets = useSafeAreaInsets();
  // An explicit height: react-native-web doesn't size an <Image> from aspectRatio alone.
  const heroHeight = Math.min(useWindowDimensions().width, MAX_WIDTH) / HERO_RATIO;
  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingTop: insets.top }]}>
      <View style={[styles.column, styles.top]}>
        <Image
          source={hero}
          style={[styles.hero, { height: heroHeight }]}
          resizeMode="cover"
          accessibilityLabel="Kennzeichen Abenteuer – Spielerisch Deutschlands Autokennzeichen entdecken!"
        />

        <WoodBoard style={styles.board}>
          {MODES.map((m) => (
            <ChunkyButton
              key={m.mode}
              onPress={() => onPlay(m.mode)}
              face={m.face}
              edge={m.edge}
              rim={m.rim}
              accessibilityLabel={`${m.title}. ${m.subtitle}`}
              contentStyle={styles.mode}
            >
              <Image source={m.icon} style={styles.modeIcon} resizeMode="contain" />
              <View style={styles.modeText}>
                <Txt weight="bold" style={styles.modeTitle}>
                  {m.title}
                </Txt>
                <Txt style={styles.modeSubtitle}>{m.subtitle}</Txt>
              </View>
              <PlayIcon size={48} />
            </ChunkyButton>
          ))}
        </WoodBoard>
      </View>

      <View style={styles.grass}>
        <View style={[styles.column, styles.tiles, { paddingBottom: insets.bottom + 28 }]}>
          {TILES.map((t) => (
            <ChunkyButton
              key={t.target}
              onPress={() => onOpen(t.target)}
              face={t.face}
              edge={t.edge}
              radius={26}
              style={styles.tileWrap}
              contentStyle={styles.tile}
            >
              <Image source={t.icon} style={styles.tileIcon} resizeMode="contain" />
              <Txt weight="semibold" style={styles.tileLabel} numberOfLines={1}>
                {t.label}
              </Txt>
            </ChunkyButton>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sky },
  content: { flexGrow: 1 },
  column: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
  // Keeps the wooden board above the grass, which tucks in under its bottom edge.
  top: { zIndex: 1 },
  hero: { width: '100%' },
  board: { marginHorizontal: 8, marginTop: -14, padding: 12, gap: 12 },
  mode: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingLeft: 6, paddingRight: 10, gap: 8 },
  modeIcon: { width: 66, height: 62 },
  modeText: { flex: 1, gap: 2 },
  modeTitle: {
    fontSize: 22,
    lineHeight: 26,
    color: colors.white,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  modeSubtitle: { fontSize: 14, lineHeight: 18, color: colors.white },
  grass: {
    flexGrow: 1,
    backgroundColor: colors.grass,
    marginTop: -40,
    paddingTop: 64,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  tiles: { flexDirection: 'row', gap: 10, paddingHorizontal: 12 },
  tileWrap: { flex: 1 },
  tile: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, gap: 4 },
  tileIcon: { width: 58, height: 48 },
  tileLabel: { fontSize: 14, color: colors.text },
});
