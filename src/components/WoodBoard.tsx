import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme';

/** The light wooden board with corner nails that holds the menu and game content. */
export function WoodBoard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.board, style]}>
      {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
        <View key={corner} style={[styles.nail, nailPosition[corner]]} />
      ))}
      {children}
    </View>
  );
}

const nailPosition = {
  tl: { top: 8, left: 8 },
  tr: { top: 8, right: 8 },
  bl: { bottom: 8, left: 8 },
  br: { bottom: 8, right: 8 },
};

const styles = StyleSheet.create({
  board: {
    backgroundColor: colors.wood,
    borderColor: colors.woodBorder,
    borderWidth: 4,
    borderRadius: 24,
    padding: 18,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  nail: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#B98A55',
    borderWidth: 2,
    borderColor: '#E9C995',
  },
});
