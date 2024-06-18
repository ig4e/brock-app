import React from "react";
import { Stack } from "expo-router";

function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen options={{ headerShown: false }} name="login" />
      <Stack.Screen options={{ headerShown: false }} name="login-form" />
    </Stack>
  );
}

export default AuthLayout;
