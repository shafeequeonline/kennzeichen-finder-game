import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, MAX_WIDTH } from '../theme';
import { ChunkyButton } from './ChunkyButton';
import { Txt } from './Txt';

type Props = {
  title: string;
  onBack: () => void;
  right?: ReactNode;
  /** Game screens lay out their own content; menu screens scroll. */
  scroll?: boolean;
  children: ReactNode;
};

/** Sky background, a title bar with a big back button, and grass along the bottom. */
export function ScreenFrame({ title, onBack, right, scroll = true, children }: Props) {
  const body = <View style={styles.inner}>{children}</View>;
  return (
    <View style={styles.root}>
      <View style={styles.grass} />
      <SafeAreaView edges={['top', 'bottom']} style={styles.flex}>
        <View style={[styles.bar, styles.inner]}>
          <ChunkyButton
            onPress={onBack}
            face={colors.yellow}
            edge={colors.yellowDark}
            radius={26}
            accessibilityLabel="Zurück"
            contentStyle={styles.back}
          >
            <Txt weight="bold" style={styles.backText}>‹</Txt>
          </ChunkyButton>
          <Txt weight="bold" style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            {title}
          </Txt>
          <View style={styles.right}>{right}</View>
        </View>
        {scroll ? (
          <ScrollView contentContainerStyle={styles.scroll}>{body}</ScrollView>
        ) : (
          <View style={[styles.flex, styles.fixed]}>{body}</View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sky },
  flex: { flex: 1 },
  grass: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
    backgroundColor: colors.grass,
    borderTopLeftRadius: 400,
    borderTopRightRadius: 400,
    transform: [{ scaleX: 1.6 }],
  },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  back: { width: 52, height: 46, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 40, lineHeight: 44, color: colors.woodDark, marginTop: -4 },
  title: {
    flex: 1,
    fontSize: 28,
    color: colors.white,
    textShadowColor: 'rgba(14,79,166,0.8)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 4,
  },
  right: { minWidth: 52, alignItems: 'flex-end' },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  fixed: { paddingHorizontal: 16, paddingBottom: 16 },
});
