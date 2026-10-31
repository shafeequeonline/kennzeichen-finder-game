import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  onPress?: () => void;
  face: string;
  edge: string;
  rim?: string;
  radius?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
};

const DEPTH = 6;

/** A glossy, "pressable toy" button: a darker edge underneath that the face sinks into when pressed. */
export function ChunkyButton({
  onPress,
  face,
  edge,
  rim = 'rgba(255,255,255,0.55)',
  radius = 22,
  disabled,
  accessibilityLabel,
  style,
  contentStyle,
  children,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={style}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.edge,
            { backgroundColor: edge, borderRadius: radius, paddingBottom: pressed ? 2 : DEPTH, marginTop: pressed ? DEPTH - 2 : 0 },
          ]}
        >
          <View style={[styles.face, { backgroundColor: face, borderRadius: radius, borderColor: rim }, contentStyle]}>
            <View pointerEvents="none" style={[styles.gloss, { borderTopLeftRadius: radius, borderTopRightRadius: radius }]} />
            {children}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  edge: { shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 6, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  face: { borderWidth: 3, overflow: 'hidden' },
  gloss: { position: 'absolute', top: 0, left: 0, right: 0, height: '45%', backgroundColor: 'rgba(255,255,255,0.16)' },
});
