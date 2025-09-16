import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../constants/firebaseConfig"; 
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: "117724603836-fvv3rpskks8svt7mo33oeodtlddn328s.apps.googleusercontent.com", 
  });

  useEffect(() => {
    const doLogin = async () => {
      if (response?.type === "success") {
        const { id_token } = response.params;

        const credential = GoogleAuthProvider.credential(id_token);
        const userCredential = await signInWithCredential(auth, credential);

        const token = await userCredential.user.getIdToken();
        console.log("Firebase Token:", token);

        await loginWithKeystone(token);
      }
    };

    doLogin();
  }, [response]);

  const loginWithKeystone = async (idToken: string) => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Login berhasil:", data);
        router.replace("/(tabs)/jadwalIbadah");
      } else {
        console.error("Login gagal di server:", data);
      }
    } catch (error) {
      console.error("Terjadi kesalahan saat menghubungi server:", error);
    }
  };

  const handleGuestLogin = () => {
    console.log("Login sebagai tamu");
    router.replace("/(tabs)/jadwalIbadah");
  };

  return (
    <View style={style.container}>
      <Text style={style.title}>Masuk</Text>
      <View style={style.buttonContainer}>
        <TouchableOpacity
          style={style.googleButton}
          onPress={() => promptAsync()}
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#FFF",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 40 },
  buttonContainer: { alignItems: "center", width: "100%" },
  googleButton: {
    backgroundColor: "#6A8BFF",
    paddingVertical: 15,
    borderRadius: 25,
    width: "80%",
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  googleButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
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
