import type { ImageSourcePropType } from "react-native";

declare module "*.png" {
  const value: ImageSourcePropType;
  export = value;
}

declare module "*.jpg" {
  const value: ImageSourcePropType;
  export = value;
}
