import { Cog, Download, Home } from "@tamagui/lucide-icons";
import { Tabs } from "expo-router";
import React from "react";

function _layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Home size={"$1.5"} color={focused ? "$color8" : "$color12"} />
          ),
        }}
      />

      <Tabs.Screen
        name="downloads"
        options={{
          title: "Downloads",
          tabBarIcon: ({ focused }) => (
            <Download size={"$1.5"} color={focused ? "$color8" : "$color12"} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <Cog size={"$1.5"} color={focused ? "$color8" : "$color12"} />
          ),
        }}
      />
    </Tabs>
  );
}

export default _layout;
