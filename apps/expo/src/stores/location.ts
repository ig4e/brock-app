import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface LocationState {
  currentAddresId: string;
}

export interface LocationActions {
  setCurrentAddress: (
    locurrentAddresIdcale: LocationState["currentAddresId"],
  ) => void;
}

export type LocationStore = LocationState & LocationActions;

export const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      currentAddresId: "",
      setCurrentAddress: (addresId: LocationState["currentAddresId"]) => {
        const currentState = get();
        set({ ...currentState, currentAddresId: addresId });
      },
    }),
    {
      name: "location-storage-v1",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
