import { Toast, useToastState } from "@tamagui/toast";
import { Theme, ThemeName } from "tamagui";

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

  let toastTheme = "purple" as ThemeName;

  switch (toast.preset) {
    case "success":
      toastTheme = "green";
      break;
    case "warning":
      toastTheme = "yellow";
      break;
    case "destructive":
      toastTheme = "red";
      break;
    default:
      toastTheme = "purple";
  }

  return (
    <Theme name={toastTheme}>
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
