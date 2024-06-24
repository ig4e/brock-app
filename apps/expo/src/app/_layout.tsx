/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import "@bacons/text-decoder/install";

import { useEffect } from "react";
import { useColorScheme } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as Font from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Menu } from "@tamagui/lucide-icons";
import { PortalProvider } from "@tamagui/portal";
import { ToastProvider, ToastViewport } from "@tamagui/toast";
import {
  Button,
  Input,
  TamaguiProvider,
  Theme,
  View,
  XStack,
  YStack,
} from "tamagui";

import { Toaster } from "~/components/toaster";
import { useSettingsStore } from "~/stores/settings";
import { TRPCProvider } from "~/utils/api";
import { tamaguiConfig } from "../tamagui.config";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

void SplashScreen.preventAutoHideAsync();

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const settings = useSettingsStore();
  const { left, top, right } = useSafeAreaInsets();

  const [loaded] = Font.useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  useEffect(() => {
    if (loaded) {
      void SplashScreen.hideAsync();
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
      <Theme name={settings.tint}>
        <ToastProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <PortalProvider shouldAddRootHost>
              <TRPCProvider>
                <Stack
                  screenOptions={{
                    header() {
                      return (
                        <View bg={"$background"} p={"$4"}>
                          <SafeAreaView>
                            <YStack gap={"$2"}>
                              <XStack w={"100%"} alignItems="center" gap={"$4"}>
                                <Button borderRadius={"$12"} p={"$2"}>
                                  <Menu size={"$2"} />
                                </Button>

                                <Input
                                  placeholder="Search in brock"
                                  borderRadius={"$12"}
                                  flex={1}
                                />
                              </XStack>
                            </YStack>
                          </SafeAreaView>
                        </View>
                      );
                    },
                  }}
                >
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: true, title: "Home" }}
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
            </PortalProvider>
          </ThemeProvider>
        </ToastProvider>
      </Theme>
    </TamaguiProvider>
  );
}
