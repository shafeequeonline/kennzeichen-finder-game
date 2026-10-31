import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

export function speak(text: string) {
  Speech.stop();
  Speech.speak(text, { language: 'de-DE', rate: 0.9 });
}

export function stopSpeaking() {
  Speech.stop();
}

/** "WOB" → "W, O, B", so the voice spells the code instead of reading it as a word. */
export function spell(code: string): string {
  return code.split('').join(', ');
}

export function vibrate(kind: 'correct' | 'wrong' | 'tap') {
  if (Platform.OS === 'web') return;
  if (kind === 'tap') {
    Haptics.selectionAsync();
    return;
  }
  Haptics.notificationAsync(
    kind === 'correct' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
  );
}
