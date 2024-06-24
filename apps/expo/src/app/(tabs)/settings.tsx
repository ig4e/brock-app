import { Link } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Label, View, YStack } from "tamagui";
import { z } from "zod";

import { AdaptiveInput } from "~/components/adaptive-input";
import { useAuthStore } from "~/stores/auth";
import { useSettingsStore } from "~/stores/settings";

const formSchema = z.object({
  tint: z.enum(["red", "green", "blue", "yellow", "purple", "gray"]),
});

export default function Index() {
  const settings = useSettingsStore();
  const auth = useAuthStore();
  const { control } = useForm({
    resolver: zodResolver(formSchema),
    values: {
      tint: settings.tint,
    },
  });

  return (
    <View p={"$4"} position="relative">
      <YStack gap={"$4"}>
        <AdaptiveInput
          control={control}
          selectProps={{
            onValueChange(value) {
              settings.setTint(value as z.infer<typeof formSchema>["tint"]);
            },
          }}
          input={{
            id: "tint-color",
            label: "Tint Color",
            placeholder: "Select a Tint color",
            type: "select",
            values: [
              { label: "Red", value: "red" },
              { label: "Green", value: "green" },
              { label: "Blue", value: "blue" },
              { label: "Yellow", value: "yellow" },
              { label: "Purple", value: "purple" },
              { label: "Gray", value: "gray" },
            ],
          }}
        />

        <YStack>
          <Label>Login</Label>
          <Link asChild href={"/(auth)/login"}>
            <Button>Get inside</Button>
          </Link>
        </YStack>

        <YStack>
          <Label>Logout</Label>
          <Button
            theme="red"
            disabled={!auth.token}
            opacity={!auth.token ? 0.5 : 1}
            onPress={() => auth.setState({ token: undefined })}
          >
            Get out
          </Button>
        </YStack>
      </YStack>
    </View>
  );
}
