import React from "react";
import { Tabs } from "expo-router";
import { Cog, Download, Home } from "@tamagui/lucide-icons";
import { Button, Text } from "tamagui";

function _layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarButton(props) {
          return (
            //@ts-expect-error -- idk really
            <Button chromeless mt={"$2"} h={"$5"} {...props}>
              {props.children}
            </Button>
          );
        },

        tabBarLabel({ children, focused }) {
          return (
            <Text scale={0.8} color={focused ? "$color8" : "$color12"}>
              {children}
            </Text>
          );
        },

        tabBarStyle: {
          height: 64,
          borderTopEndRadius: 16,
          borderTopStartRadius: 16,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Home size={22} color={focused ? "$color8" : "$color12"} />
          ),
        }}
      />

      <Tabs.Screen
        name="downloads"
        options={{
          title: "Downloads",
          tabBarIcon: ({ focused }) => (
            <Download size={22} color={focused ? "$color8" : "$color12"} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <Cog size={22} color={focused ? "$color8" : "$color12"} />
          ),
        }}
      />
    </Tabs>
  );
}

export default _layout;
