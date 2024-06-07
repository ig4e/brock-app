/* eslint-disable react/no-unescaped-entities */
import { useCallback, useEffect, useState } from "react";
import * as AuthSession from "expo-auth-session";
import * as Linking from "expo-linking";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogIn } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import {
  Button,
  Card,
  H3,
  Image,
  Paragraph,
  Spinner,
  Text,
  View,
  YStack,
} from "tamagui";

import { useAuthStore } from "~/stores/auth";
import { getBaseUrl } from "~/utils/base-url";
import { LoginBG } from "~/components/Images";

export default function Index() {
  const signInUrl = `${getBaseUrl()}/api/auth/signin`;
  const redirectTo = Linking.createURL("/login");
  const authStore = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToastController();

  const [_req, res, promptAsync] = AuthSession.useAuthRequest(
    {
      redirectUri: redirectTo,
      clientId: "mobile",
      extraParams: { "expo-redirect": redirectTo },
      state: "mobile-state",
    },
    {
      authorizationEndpoint: signInUrl,
    },
  );

  const logIn = useCallback(() => {
    setIsLoading(true);

    void promptAsync().then((value) => {
      setIsLoading(false);
      console.log(value);
    });
  }, [promptAsync]);

  useEffect(() => {
    if (res) {
      if (res.type === "success") {
        const url = Linking.parse(res.url);
        const sessionToken = String(url.queryParams?.session_token);

        if (sessionToken) {
          authStore.setState({ token: sessionToken });
          router.replace("/");
        }
      } else {
        toast.show("Failed", {
          message: res.type,
          preset: "destructive",
        });
      }
    }
  }, [res, authStore]);

  return (
    <View>
      <StatusBar translucent />

      <Card h={"100%"}>
        <Card.Background>
          <Image source={LoginBG}></Image>
        </Card.Background>

        <Card.Footer
          padded
          backgroundColor={"$background"}
          borderTopEndRadius={"$4"}
          borderTopStartRadius={"$4"}
          py={"$6"}
        >
          <YStack px={"$2"} flex={1}>
            <H3 textAlign="center" pb={"$2"}>
              Let's Find the Professional Cleaning & Repair Service
            </H3>

            <Paragraph textAlign="center" px={"$2"} pb={"$6"}>
              simply dummy text of the printing and typesetting industry. Lorem
              Ipsum has been the industry's standard dummy.
            </Paragraph>

            <YStack gap={"$4"}>
              <Button
                icon={isLoading ? Spinner : LogIn}
                onPress={() => void logIn()}
                theme="primary"
                borderRadius={"$12"}
                disabled={isLoading}
              >
                <Text>Continue with Sala7</Text>
              </Button>

              <Link asChild href="/">
                <Button
                  borderRadius={"$12"}
                  disabled={isLoading}
                  icon={isLoading ? Spinner : undefined}
                >
                  <Text>Cancel</Text>
                </Button>
              </Link>
            </YStack>
          </YStack>
        </Card.Footer>
      </Card>
    </View>
  );
}
