import { useState } from "react";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToastController } from "@tamagui/toast";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Card,
  H3,
  Image,
  Input,
  Paragraph,
  Spinner,
  Text,
  View,
  YStack,
} from "tamagui";
import { z } from "zod";

import { LoginBG } from "~/components/Images";
import { useAuthStore } from "~/stores/auth";
import { api } from "~/utils/api";

const schema = z
  .object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
  })
  .required();

export default function SignUp() {
  const authStore = useAuthStore();
  const toast = useToastController();
  const [status, setStatus] = useState<"off" | "submitting" | "submitted">(
    "off",
  );
  const signInMutation = api.auth.signUp.useMutation({});
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),

    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    setStatus("submitting");

    void signInMutation.mutate(data, {
      onSuccess(data) {
        setStatus("submitted");

        if (data.error) {
          return toast.show("Error ~oopsie~", {
            message: data.error,
            preset: "destructive",
          });
        }

        if (data.session) {
          authStore.setState({ token: data.session.id });
          router.dismissAll();
          router.push("/");
          return toast.show("UWU~~ A Success", {
            message: `Arlight here's your fresh account`,
            preset: "success",
          });
        }
      },
      onError(error) {
        setStatus("off");
        console.log(error, "err");
        toast.show("Failed", {
          message: error.message,
          preset: "destructive",
        });
      },
    });
  };

  return (
    <View>
      <StatusBar translucent />

      <Card h={"100%"}>
        <Card.Background>
          <Image
            source={LoginBG}
            resizeMode="contain"
            alignSelf="flex-start"
          ></Image>
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
              Sign Up!
            </Paragraph>

            <YStack gap={"$4"} width={"100%"}>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    borderRadius={"$12"}
                    placeholder="Email"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="username"
              />

              {errors.username && <Text>This is required.</Text>}

              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    borderRadius={"$12"}
                    placeholder="Password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
                name="password"
              />

              {errors.username && <Text>This is required.</Text>}

              <Button
                width={"100%"}
                borderRadius={"$12"}
                icon={
                  status === "submitting"
                    ? () => <Spinner color={"$color8"} />
                    : undefined
                }
                onPress={handleSubmit(onSubmit)}
              >
                Submit
              </Button>
            </YStack>
          </YStack>
        </Card.Footer>
      </Card>
    </View>
  );
}
