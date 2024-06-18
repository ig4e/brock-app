import { useEffect } from "react";
import { useRouter } from "expo-router";

import { useAuthStore } from "~/stores/auth";
import { api } from "./api";

export function useSession() {
  const authStore = useAuthStore();

  const {
    data: session,
    isLoading,
    isError,
    refetch,
    
  } = api.auth.getSession.useQuery(undefined);

  useEffect(() => {
    void refetch();
  }, [authStore]);

  return { user: session?.user, isLoading, isError };
}

export function useSignOut() {
  const utils = api.useUtils();
  const signOut = api.auth.signOut.useMutation();
  const router = useRouter();

  return async () => {
    const res = await signOut.mutateAsync();
    if (!res.success) return;
    useAuthStore.setState({ token: "" });
    router.dismissAll();
    router.push("/");
    await utils.invalidate();
  };
}
