import { useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold, useFonts } from '@expo-google-fonts/fredoka';
import { GameProvider, useGame } from './src/GameContext';
import { HighscoreScreen } from './src/screens/HighscoreScreen';
import { HomeScreen, type MenuTarget } from './src/screens/HomeScreen';
import { KnowledgeScreen } from './src/screens/KnowledgeScreen';
import { QuizScreen } from './src/screens/QuizScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import type { Mode } from './src/storage';
import { colors } from './src/theme';

type Screen = { name: 'home' } | { name: 'quiz'; mode: Mode } | { name: MenuTarget };

export default function App() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <Main />
      </GameProvider>
    </SafeAreaProvider>
  );
}

function Main() {
  const [fontsLoaded] = useFonts({ Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold });
  const { ready } = useGame();
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const home = () => setScreen({ name: 'home' });

  // Android's back button goes to the menu instead of closing the app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen.name === 'home') return false;
      home();
      return true;
    });
    return () => sub.remove();
  }, [screen.name]);

  if (!fontsLoaded || !ready) return <View style={{ flex: 1, backgroundColor: colors.sky }} />;

  return (
    <>
      <StatusBar style="dark" />
      {screen.name === 'home' && (
        <HomeScreen onPlay={(mode) => setScreen({ name: 'quiz', mode })} onOpen={(name) => setScreen({ name })} />
      )}
      {screen.name === 'quiz' && <QuizScreen key={screen.mode} mode={screen.mode} onExit={home} />}
      {screen.name === 'highscore' && <HighscoreScreen onBack={home} />}
      {screen.name === 'knowledge' && <KnowledgeScreen onBack={home} />}
      {screen.name === 'settings' && <SettingsScreen onBack={home} />}
    </>
  );
}
