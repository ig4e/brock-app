import "@bacons/text-decoder/install";

import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Font from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { ToastProvider, ToastViewport } from "@tamagui/toast";
import { TamaguiProvider } from "tamagui";

import { Toaster } from "~/components/toaster";
import { TRPCProvider } from "~/utils/api";
import { tamaguiConfig } from "../tamagui.config";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

SplashScreen.preventAutoHideAsync();

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { left, top, right } = useSafeAreaInsets();

  const [loaded] = Font.useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <TamaguiProvider
      config={tamaguiConfig}
      defaultTheme={colorScheme as string}
    >
      <ToastProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <TRPCProvider>
            {/*
          The Stack component displays the current page.
          It also allows you to configure your screens 
        */}
            <Stack>
              <Stack.Screen
                name="index"
                options={{ headerShown: false, title: "Home" }}
              />
              <Stack.Screen
                name="(auth)"
                options={{ headerShown: false, title: "Auth" }}
              />
            </Stack>
            <StatusBar />
            <Toaster />
            <ToastViewport
              flexDirection="column-reverse"
              top={top}
              left={left}
              right={right}
            />
          </TRPCProvider>
        </ThemeProvider>
      </ToastProvider>
    </TamaguiProvider>
  );
}
