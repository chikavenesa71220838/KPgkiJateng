import Constants from "expo-constants";
import { Platform } from "react-native";

function getApiUrl() {
  const productionUrl =
    "https://uninvertible-mai-unmeandering.ngrok-free.dev/api/graphql";

  if (process.env.NODE_ENV === "production") {
    return productionUrl;
  }

  // Web
  if (Platform.OS === "web") {
    return "http://localhost:3000/api/graphql";
  }

  const hostUri = Constants.expoConfig?.hostUri;

  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:3000/api/graphql`;
  }

  // Android Emulator fallback
  return "http://10.0.2.2:3000/api/graphql";
}

export const API_URL = getApiUrl();
