import Constants from "expo-constants";
import { Platform } from "react-native";

const USE_DEPLOYED_SERVER = true; // 🔧 Ganti true kalau dev mau hit VPS

const productionUrl = "http://103.174.115.139:3000/api/graphql"; //VPS

function getApiUrl() {
  if (Platform.OS === "web") {
    return "http://localhost:3000/api/graphql";
  }

  if (process.env.NODE_ENV === "production") {
    return productionUrl; // APK selalu ke VPS
  }

  // Dev mode — dikontrol flag
  if (USE_DEPLOYED_SERVER) {
    return productionUrl; // Dev hit VPS
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:3000/api/graphql`; // Dev hit localhost
  }

  return "http://10.0.2.2:3000/api/graphql";
}

export const API_URL = getApiUrl();