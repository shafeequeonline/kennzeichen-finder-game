import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

/** A raised pitch makes the system voice sound younger and more playful. iOS allows 0.5–2. */
const KID_PITCH = 1.45;
/** Female German voices sit higher, so they sound most child-like once the pitch is raised. */
const PREFERRED_VOICES = ['Anna', 'Helena', 'Petra', 'Marlene', 'Vicki'];

let voiceId: string | undefined;
let voiceLookup: Promise<void> | undefined;

/** Picks the nicest installed German voice once: enhanced quality first, then a preferred name. */
function findVoice(): Promise<void> {
  voiceLookup ??= Speech.getAvailableVoicesAsync()
    .then((voices) => {
      const german = voices.filter((v) => v.language.toLowerCase().startsWith('de'));
      const rank = (v: Speech.Voice) => {
        const named = PREFERRED_VOICES.findIndex((n) => v.name.includes(n));
        return (v.quality === Speech.VoiceQuality.Enhanced ? 0 : 100) + (named === -1 ? 50 : named);
      };
      voiceId = german.sort((a, b) => rank(a) - rank(b))[0]?.identifier;
    })
    .catch((error) => console.error('Unable to list voices.', error));
  return voiceLookup;
}

let latestRequest = 0;

export function speak(text: string) {
  Speech.stop();
  const request = ++latestRequest;
  findVoice().then(() => {
    if (request !== latestRequest) return; // a newer prompt replaced this one
    Speech.speak(text, { language: 'de-DE', voice: voiceId, pitch: KID_PITCH, rate: 0.9 });
  });
}

export function stopSpeaking() {
  latestRequest++;
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
