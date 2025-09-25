import Constants from "expo-constants";

function getApiUrl() {
  const productionUrl = "https://api.gereja.com/api/graphql";

  if (process.env.NODE_ENV === "production") {
    return productionUrl;
  }

  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;

  if (debuggerHost) {
    const host = debuggerHost.split(":")[0];
    return `http://${host}:3000/api/graphql`;
  }

  return "http://10.0.2.2:3000/api/graphql";
}

export const API_URL = getApiUrl();
