import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";

import { api } from "~/utils/api";

function TrpcRefetch({ children }: { children: ReactNode }) {
  const utils = api.useUtils();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    void Promise.all([
      utils.services.getMany.fetch().then((services) => {
        services.forEach((service) => {
          void utils.services.get.prefetch({ id: service.id });
        });
      }),
    ])
      .then(() => {
        console.log("[SUCCESS]: TRPC_PREFETCH Prefetched services, orders");
      })
      .catch((err) => {
        console.log(
          "[ERROR]: TRPC_PREFETCH Failed to prefetch services, orders",
          err,
        );

        return;
      });
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      void utils.invalidate().catch(console.log);
      appState.current = nextAppState;
      console.log("AppState", appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, [utils]);

  return children;
}

export default TrpcRefetch;
