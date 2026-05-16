import 'react-native-gesture-handler';

import { DatabaseProvider } from '../context/DatabaseContext';
import { palette, paperDark, paperLight } from '../constants/theme';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const theme = dark ? paperDark : paperLight;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: dark ? palette.bg : '#f8fafc' }}>
      <DatabaseProvider>
        <SafeAreaProvider>
          <PaperProvider theme={theme}>
            <StatusBar style={dark ? 'light' : 'dark'} />
            <Stack
              screenOptions={{
                contentStyle: { backgroundColor: theme.colors.background },
                headerStyle: { backgroundColor: theme.colors.surface },
                headerTintColor: theme.colors.onSurface,
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ title: 'Welcome', presentation: 'modal' }} />
              <Stack.Screen name="scan-barcode" options={{ title: 'Scan barcode', presentation: 'modal' }} />
              <Stack.Screen name="add-meal" options={{ title: 'Log meal', presentation: 'modal' }} />
            </Stack>
          </PaperProvider>
        </SafeAreaProvider>
      </DatabaseProvider>
    </GestureHandlerRootView>
  );
}
