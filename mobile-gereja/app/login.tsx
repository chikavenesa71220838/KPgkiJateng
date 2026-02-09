import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import { AntDesign } from '@expo/vector-icons'; // Kita pake icon dari Expo aja

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
          
          Alert.alert("Login Berhasil!", `Halo, ${user.name}`);
          router.push("/jadwalIbadah");
        } catch (err) {
          if (err instanceof Error) {
            Alert.alert("Error", err.message);
          }
        }
      } else if (response?.type === "error") {
        Alert.alert("Login Gagal", "Terjadi kesalahan saat login.");
      }
    };

    handleResponse();
  }, [response]);

  return (
    <View style={style.container}>
      <Text style={style.title}>Masuk</Text>
      
      <View style={style.buttonContainer}>
        {/* Tombol Google Manual (Aman buat Expo Go) */}
        <TouchableOpacity 
          style={[style.googleButton, !request && style.buttonDisabled]} 
          onPress={() => promptAsync()}
          disabled={!request}
        >
          <AntDesign name="google" size={24} color="white" style={style.icon} />
          <Text style={style.googleButtonText}>Masuk dengan Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={style.guestButton} onPress={() => router.push("/jadwalIbadah")}>
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
  
  // Style baru buat tombol Google manual
  googleButton: {
    flexDirection: "row",
    backgroundColor: "#DB4437", // Warna merah Google
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    marginBottom: 20,
    elevation: 2, // Shadow android
    shadowColor: "#000", // Shadow iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonDisabled: {
    backgroundColor: "#E57373", // Warna pudar kalau loading
  },
  googleButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  icon: {
    marginRight: 5,
  },
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