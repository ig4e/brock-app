import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogIn } from "@tamagui/lucide-icons";
import {
  Button,
  Card,
  H3,
  Image,
  Paragraph,
  Text,
  View,
  YStack,
} from "tamagui";

import { LoginBG } from "~/components/Images";

export default function Index() {
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
              Where limitless storage meets your dreams.
            </H3>

            <Paragraph textAlign="center" px={"$2"} pb={"$6"}>
              Upload to your heart's content, but please, be gentle with us!
            </Paragraph>

            <YStack gap={"$4"}>
              <Link asChild href="/(auth)/login-form">
                <Button icon={LogIn} borderRadius={"$12"} theme="purple_active">
                  <Text>Continue with Brock</Text>
                </Button>
              </Link>

              <Link asChild href="/">
                <Button borderRadius={"$12"}>
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
