import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AuthState {
  token: string;
}

export interface AuthActions {
  setState: (state: Partial<AuthState>) => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: "",
      setState: (state: Partial<AuthState>) => {
        const currentState = get();
        set({ ...currentState, ...state });
      },
    }),
    {
      name: "auth-storage-v2",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
