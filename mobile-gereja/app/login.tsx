import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";

// 1. Tambahkan import ini
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: "822049057915-mhkq8mqfpk0ic562cr6t13idfs66mr7i.apps.googleusercontent.com",
    androidClientId: "822049057915-qn7cuejdfr646hv0mjermf39l1cdj9hf.apps.googleusercontent.com",
    webClientId: "822049057915-id9ubk6l37sp53pa6krgvbsrib6b6oj7.apps.googleusercontent.com",
    redirectUri: AuthSession.makeRedirectUri({
      native: "mobilegereja://redirect",
    }),
  });

  useEffect(() => {
    const handleResponse = async () => {
      if (response?.type === "success" && response.authentication?.accessToken) {
        try {
          const userInfoResponse = await fetch("https://www.googleapis.com/userinfo/v2/me", {
            headers: { Authorization: `Bearer ${response.authentication.accessToken}` },
          });
          const user = await userInfoResponse.json();
          console.log("User info:", user);

          Alert.alert("Login Berhasil!", `Halo, ${user.name}`);
          router.push("/jadwalIbadah");
        } catch (err) {
          if (err instanceof Error) {
            console.error("Error ambil data user:", err.message);
            Alert.alert("Error", err.message);
          }
        }
      } else if (response?.type === "error") {
        Alert.alert("Login Gagal", "Terjadi kesalahan saat login. Coba lagi nanti.");
      }
    };

    handleResponse();
  }, [response]);

  const handleGoogleLogin = async () => {
    try {
      await promptAsync();
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert("Login Gagal", err.message);
      }
    }
  };

  const handleGuestLogin = () => {
    router.push("/jadwalIbadah");
  };

  return (
    <View style={style.container}>
      <Text style={style.title}>Masuk</Text>
      
      <View style={style.buttonContainer}>
        {/* 2. Gunakan GoogleSigninButton di sini */}
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={handleGoogleLogin}
          disabled={!request}
          style={{ width: '80%', height: 48, marginBottom: 20 }} // Sesuaikan ukuran
        />

        <TouchableOpacity style={style.guestButton} onPress={handleGuestLogin}>
          <Text style={style.guestButtonText}>Masuk sebagai Tamu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#FFF",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 40 },
  buttonContainer: { alignItems: "center", width: "100%" },
  // Style googleButton lama dihapus karena sudah pakai komponen native
  guestButton: {
    backgroundColor: "#E0E0E0",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
  },
  guestButtonText: { color: "#333", fontWeight: "bold", fontSize: 16 },
});