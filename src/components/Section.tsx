import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { Txt } from './Txt';

/** A heading with optional explanation, used on the settings and highscore boards. */
export function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Txt weight="bold" style={styles.title}>{title}</Txt>
      {note && <Txt style={styles.note}>{note}</Txt>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  title: { fontSize: 22, color: colors.woodDark },
  note: { fontSize: 16, lineHeight: 21, color: colors.textMuted },
});
