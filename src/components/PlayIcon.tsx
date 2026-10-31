import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

/** The round yellow play button from the design. */
export function PlayIcon({ size = 58 }: { size?: number }) {
  const tri = size * 0.22;
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <View
        style={{
          marginLeft: tri * 0.35,
          width: 0,
          height: 0,
          borderTopWidth: tri,
          borderBottomWidth: tri,
          borderLeftWidth: tri * 1.5,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: colors.woodDark,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.yellow,
    borderWidth: 3,
    borderColor: '#FFF3B0',
    borderBottomColor: colors.yellowDark,
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
