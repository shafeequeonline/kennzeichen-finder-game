import { Text, type TextProps } from 'react-native';
import { colors, fonts } from '../theme';

type Props = TextProps & { weight?: keyof typeof fonts };

/** Text in the game's rounded Fredoka font. */
export function Txt({ weight = 'medium', style, ...rest }: Props) {
  return <Text {...rest} style={[{ fontFamily: fonts[weight], color: colors.text }, style]} />;
}
