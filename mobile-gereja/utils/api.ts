import Constants from "expo-constants";
import { Platform } from "react-native"; // <-- Jangan lupa import ini

function getApiUrl() {
  const productionUrl = "https://uninvertible-mai-unmeandering.ngrok-free.dev/api/graphql";

  if (process.env.NODE_ENV === "production") {
    return productionUrl;
  }

  // Tambahkan pengecekan untuk platform web
  if (Platform.OS === 'web') {
    return "http://localhost:3000/api/graphql";
  }

  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;

  if (debuggerHost) {
    const host = debuggerHost.split(":")[0];
    return `http://${host}:3000/api/graphql`;
  }

  // Fallback ini sekarang hanya untuk mobile (Android Emulator)
  return "http://10.0.2.2:3000/api/graphql";
}

export const API_URL = getApiUrl();