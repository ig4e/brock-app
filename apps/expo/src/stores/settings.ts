import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface SettingsState {
  locale: "auto" | "en" | "ar";
  theme: "auto" | "light" | "dark";
  tint: "red" | "green" | "blue" | "yellow" | "purple" | "gray";
  allowedDir?: string;
}

export interface SettingsActions {
  setLocale: (locale: SettingsState["locale"]) => void;
  setTheme: (theme: SettingsState["theme"]) => void;
  setAllowedDir: (allowedDir: SettingsState["allowedDir"]) => void;
  setTint: (tint: SettingsState["tint"]) => void;
}

export type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      locale: "auto",
      theme: "auto",
      allowedDir: undefined,
      tint: "gray",

      setTint: (tint: SettingsState["tint"]) => {
        const currentState = get();
        set({ ...currentState, tint: tint });
      },
      setLocale: (locale: SettingsState["locale"]) => {
        const currentState = get();
        set({ ...currentState, locale: locale });
      },
      setTheme: (theme: SettingsState["theme"]) => {
        const currentState = get();
        set({ ...currentState, theme: theme });
      },
      setAllowedDir: (allowedDir: SettingsState["allowedDir"]) => {
        const currentState = get();
        set({ ...currentState, allowedDir: allowedDir });
      },
    }),
    {
      name: "settings-storage-v2",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
