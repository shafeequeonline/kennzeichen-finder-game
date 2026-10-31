import { StyleSheet, Text, View } from 'react-native';

/** Filled and empty stars, e.g. ★★☆. */
export function Stars({ count, size = 34 }: { count: number; size?: number }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${count} von 3 Sternen`}>
      {[0, 1, 2].map((i) => (
        <Text key={i} style={{ fontSize: size, opacity: i < count ? 1 : 0.25 }}>
          ⭐
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, justifyContent: 'center' },
});
