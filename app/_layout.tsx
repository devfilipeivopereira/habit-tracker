import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform, Linking } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { HabitsProvider } from "@/lib/habits-context";
import { ThemeProvider } from "@/lib/ThemeContext";
import { useTheme } from "@/lib/useTheme";
import { AuthProvider } from "@/lib/AuthContext";
import { WEB_CONTENT_MAX_WIDTH } from "@/lib/useResponsiveWeb";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

SplashScreen.preventAutoHideAsync();

const RESET_PASSWORD_SCHEME = "myapp://reset-password";

function parseFragmentParams(fragment: string): Record<string, string> {
  const params: Record<string, string> = {};
  fragment.split("&").forEach((pair) => {
    const [key, value] = pair.split("=");
    if (key && value) params[decodeURIComponent(key)] = decodeURIComponent(value);
  });
  return params;
}

function handleResetPasswordUrl(url: string): boolean {
  if (!url.startsWith(RESET_PASSWORD_SCHEME) || !isSupabaseConfigured) return false;
  const hashIndex = url.indexOf("#");
  if (hashIndex === -1) return false;
  const params = parseFragmentParams(url.slice(hashIndex + 1));
  const access_token = params.access_token;
  const refresh_token = params.refresh_token;
  if (!access_token || !refresh_token) return false;
  supabase.auth.setSession({ access_token, refresh_token }).then(() => {
    router.replace("/(auth)/reset-password" as import("expo-router").Href);
  });
  return true;
}

function DeepLinkHandler() {
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) handleResetPasswordUrl(url);
    });
    const sub = Linking.addEventListener("url", ({ url }) => {
      handleResetPasswordUrl(url);
    });
    return () => sub.remove();
  }, []);
  return null;
}

const SPLASH_BG = "#120b2d";

function LoadingSplash() {
  return (
    <View style={[StyleSheet.absoluteFill, styles.splash]}>
      <View style={styles.splashContent}>
        <Text style={styles.splashTitle}>HabitFlow</Text>
      </View>
      <Text style={styles.splashFooter}>By "@filipeivopereira"</Text>
    </View>
  );
}

function WebLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  if (Platform.OS !== "web") return <>{children}</>;
  return (
    <View style={[styles.flex, styles.webFullBg, { backgroundColor: theme.background }]}>
      <View style={[styles.flex, styles.webContentArea]}>{children}</View>
    </View>
  );
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Voltar" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="habit-form"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="habit-detail"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function ready() {
      await SplashScreen.hideAsync();
      setIsReady(true);
    }
    ready();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <GestureHandlerRootView style={styles.flex}>
              <KeyboardProvider>
                {!isReady ? (
                  <View style={styles.flex}>
                    <LoadingSplash />
                  </View>
                ) : (
                  <>
                    <DeepLinkHandler />
                    <WebLayoutWrapper>
                      <HabitsProvider>
                        <RootLayoutNav />
                      </HabitsProvider>
                    </WebLayoutWrapper>
                  </>
                )}
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  webFullBg: {
    width: "100%",
    minHeight: "100%",
  },
  webContentArea: {
    maxWidth: WEB_CONTENT_MAX_WIDTH,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 24,
  },
  splash: {
    backgroundColor: SPLASH_BG,
    justifyContent: "space-between",
    alignItems: "center",
  },
  splashContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  splashTitle: {
    color: "#ffffff",
    fontSize: 14,
  },
  splashFooter: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginBottom: 24,
  },
});
