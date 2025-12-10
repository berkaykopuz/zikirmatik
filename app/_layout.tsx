import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { ZikhrProvider } from '@/context/ZikhrContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#2c2f34',
    card: '#2c2f34',
    border: '#3a3d42',
    text: '#e6e7e9',
    primary: '#58d5ba',
  },
};

export default function App() {
  // Use `useFonts` only if you can't use the config plugin.
  const [loaded, error] = useFonts({
    'DSdigi': require('@/assets/fonts/DS-DIGI.ttf'),
    'JosefinSans': require('@/assets/fonts/JosefinSans-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  //Theme section can be changed.
  return (
    <ZikhrProvider>
      <ThemeProvider value={navTheme}> 
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#2c2f34' },
            headerTintColor: '#e6e7e9',
            headerTitleStyle: { color: '#e6e7e9' },
            contentStyle: { backgroundColor: '#1f2025' },
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ animation: 'none' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="light" backgroundColor="#2c2f34" />
      </ThemeProvider>
    </ZikhrProvider>
  );
}
