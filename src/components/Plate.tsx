import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

const STAR_COUNT = 12;

/**
 * A German licence plate showing only the area code, e.g. [EU|D] WOB.
 * The letters use a plain bold system font: closer to real plates than Fredoka, whose rounded B is easy to misread.
 */
export function Plate({ code, scale = 1 }: { code: string; scale?: number }) {
  const s = (n: number) => n * scale;
  return (
    <View
      style={[styles.plate, { height: s(76), borderRadius: s(10), borderWidth: Math.max(2, s(3)) }]}
      accessible
      accessibilityLabel={`Kennzeichen ${code.split('').join(' ')}`}
    >
      <View style={[styles.euBand, { width: s(36), paddingTop: s(8), paddingBottom: s(5) }]}>
        <View style={{ width: s(22), height: s(22) }}>
          {Array.from({ length: STAR_COUNT }, (_, i) => {
            const angle = (i / STAR_COUNT) * 2 * Math.PI;
            return (
              <View
                key={i}
                style={[
                  styles.star,
                  { width: s(3.5), height: s(3.5), left: s(9 + 8 * Math.cos(angle)), top: s(9 + 8 * Math.sin(angle)) },
                ]}
              />
            );
          })}
        </View>
        <Text style={[styles.country, { fontSize: s(17) }]}>D</Text>
      </View>
      <Text style={[styles.code, { fontSize: s(50), paddingHorizontal: s(18), letterSpacing: s(3) }]}>{code}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  plate: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderColor: colors.plateText,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  euBand: { backgroundColor: colors.plateBlue, alignItems: 'center', justifyContent: 'space-between' },
  star: { position: 'absolute', borderRadius: 2, backgroundColor: colors.plateStar },
  country: { color: colors.white, fontWeight: '700' },
  code: { alignSelf: 'center', color: colors.plateText, fontWeight: '800' },
});
