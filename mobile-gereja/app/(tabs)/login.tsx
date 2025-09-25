import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();

  let redirectUri: string;

  if (__DEV__) {
    redirectUri = "https://auth.expo.io/@dwiyanbagus/mobile-gereja";
  } else {
    redirectUri = AuthSession.makeRedirectUri({
      scheme: "mobilegereja",
      path: "redirect",
    });
  }
  // =========================================================================

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: "822049057915-mhkq8mqfpk0ic562cr6t13idfs66mr7i.apps.googleusercontent.com",
    androidClientId: "822049057915-qn7cuejdfr646hv0mjermf39l1cdj9hf.apps.googleusercontent.com",
    webClientId: "822049057915-id9ubk6l37sp53pa6krgvbsrib6b6oj7.apps.googleusercontent.com",
    redirectUri, 
  });

  useEffect(() => {
    // Log ini akan memastikan URI yang benar digunakan
    console.log("Redirect URI yang digunakan:", redirectUri);

    if (response) {
      if (response.type === "success") {
        const { authentication } = response;
        console.log("Google Token:", authentication?.accessToken);
        Alert.alert("Login Berhasil!", "Token berhasil didapatkan.");
        router.push("/jadwalIbadah");
      } else if (response.type === "error") {
        Alert.alert("Login Gagal", `Error: ${response.error?.message || "Coba lagi nanti."}`);
        console.error("Google Auth Error:", response);
      }
    }
  }, [response]);

  // Sisa kode tidak ada perubahan
  const handleGoogleSignIn = () => {
    if (request) {
      promptAsync();
    } else {
      console.log("Request belum siap. Coba lagi sesaat.");
    }
  };

  const handleGuestLogin = () => {
    router.push("/jadwalIbadah");
  };

  return (
    <View style={style.container}>
      <Text style={style.title}>Masuk</Text>
      <View style={style.buttonContainer}>
        <TouchableOpacity
          style={style.googleButton}
          onPress={handleGoogleSignIn}
          disabled={!request}
        >
          <Text style={style.googleButtonText}>Masuk dengan Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={style.guestButton} onPress={handleGuestLogin}>
          <Text style={style.guestButtonText}>Masuk sebagai Tamu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20, backgroundColor: "#FFF" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 40 },
  buttonContainer: { alignItems: "center", width: "100%" },
  googleButton: { backgroundColor: "#6A8BFF", paddingVertical: 15, borderRadius: 25, width: "80%", marginBottom: 20, alignItems: "center", flexDirection: "row", justifyContent: "center" },
  googleButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  guestButton: { backgroundColor: "#E0E0E0", paddingVertical: 15, borderRadius: 25, alignItems: "center", justifyContent: "center", width: "80%" },
  guestButtonText: { color: "#333", fontWeight: "bold", fontSize: 16 },
});