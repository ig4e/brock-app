import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface SettingsState {
  locale: "auto" | "en" | "ar";
  theme: "auto" | "light" | "dark";
}

export interface SettingsActions {
  setLocale: (locale: SettingsState["locale"]) => void;
  setTheme: (theme: SettingsState["theme"]) => void;
}

export type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      locale: "auto",
      theme: "auto",
      setLocale: (locale: SettingsState["locale"]) => {
        const currentState = get();
        set({ ...currentState, locale: locale });
      },
      setTheme: (theme: SettingsState["theme"]) => {
        const currentState = get();
        set({ ...currentState, theme: theme });
      },
    }),
    {
      name: "settings-storage-v1",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
