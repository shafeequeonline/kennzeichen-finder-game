import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { ChunkyButton } from './ChunkyButton';
import { Txt } from './Txt';

type Option<T> = { value: T; label: string };

/** A row of big buttons where exactly one is selected. */
export function Choice<T extends string | number | boolean>({
  options,
  value,
  onChange,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <ChunkyButton
            key={String(o.value)}
            onPress={() => onChange(o.value)}
            face={selected ? colors.blue : colors.white}
            edge={selected ? colors.blueDark : colors.woodBorder}
            rim={selected ? colors.blueLight : colors.woodLight}
            radius={16}
            style={styles.item}
            contentStyle={styles.button}
            accessibilityLabel={`${o.label}${selected ? ', ausgewählt' : ''}`}
          >
            <Txt weight="bold" style={[styles.label, selected && { color: colors.white }]} numberOfLines={1} adjustsFontSizeToFit>
              {o.label}
            </Txt>
          </ChunkyButton>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  item: { flex: 1 },
  button: { paddingVertical: 12, paddingHorizontal: 6, alignItems: 'center' },
  label: { fontSize: 18 },
});
