import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

const SOURCES = {
  correct: require('../assets/sounds/correct.wav'),
  wrong: require('../assets/sounds/wrong.wav'),
};

export type Sound = keyof typeof SOURCES;

let players: Record<Sound, AudioPlayer> | undefined;

/** Players are made once and reused, so each answer plays without a loading delay. */
function getPlayers(): Record<Sound, AudioPlayer> {
  if (!players) {
    // Mix with the read-aloud voice and other apps, and play like the voice does when the phone is on silent.
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch((error) =>
      console.error('Unable to set the audio mode.', error),
    );
    players = { correct: createAudioPlayer(SOURCES.correct), wrong: createAudioPlayer(SOURCES.wrong) };
  }
  return players;
}

/** Loads the sounds ahead of the first answer. */
export function preloadSounds() {
  getPlayers();
}

/** Applause for a right answer, a soft "oh-oh" for a wrong one. */
export function playSound(sound: Sound) {
  try {
    const player = getPlayers()[sound];
    player.seekTo(0);
    player.play();
  } catch (error) {
    console.error(`Unable to play the ${sound} sound.`, error);
  }
}
