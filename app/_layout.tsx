import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { I18nProvider } from '@/i18n';
import { useAppFonts } from '@/theme/useAppFonts';
import { useOnboarded } from '@/hooks/useOnboarded';

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function ThemedShell() {
  const T = useTheme();
  const { completed, loaded } = useOnboarded();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!loaded) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!completed && !inOnboarding) {
      router.replace('/onboarding');
    } else if (completed && inOnboarding) {
      router.replace('/');
    }
  }, [completed, loaded, segments, router]);

  return (
    <>
      <StatusBar style={T.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: T.colors.bg },
          headerTintColor: T.colors.text,
          contentStyle: { backgroundColor: T.colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="dataset/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const fontsLoaded = useAppFonts();

  useEffect(() => {
    if (fontsLoaded) void SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <I18nProvider>
              <ThemedShell />
            </I18nProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
