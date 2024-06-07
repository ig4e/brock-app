import { Toast, useToastState } from "@tamagui/toast";
import { Theme } from "tamagui";

declare module "@tamagui/toast" {
  interface CustomData {
    preset?: "destructive" | "success" | "warning";
  }
}

export function Toaster() {
  const toast = useToastState();

  // don't show any toast if no toast is present or it's handled natively
  if (!toast || toast.isHandledNatively) {
    return null;
  }

  return (
    <Theme name={toast.preset}>
      <Toast
        key={toast.id}
        duration={toast.duration}
        viewportName={toast.viewportName}
      >
        <Toast.Title>{toast.title}</Toast.Title>
        <Toast.Description>{toast.message}</Toast.Description>
        <Toast.Action altText={toast.title} />
        <Toast.Close />
      </Toast>
    </Theme>
  );
}
