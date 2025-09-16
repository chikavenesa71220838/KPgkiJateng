import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { auth } from "../../constants/firebaseConfig";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "117724603836-fvv3rpskks8svt7mo33oeodtlddn328s.apps.googleusercontent.com",
    iosClientId: "117724603836-fvv3rpskks8svt7mo33oeodtlddn328s.apps.googleusercontent.com",
    androidClientId: "117724603836-4q3fqdo1qpga3ushmi64gngsg6u9nif9.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential).then((result) => {
        setUser(result.user);
        console.log("User:", result.user);
        router.replace("/(tabs)/jadwalIbadah");
      });
    }
  }, [response]);

  const handleGoogleSignIn = () => {
    promptAsync();
  };

  const handleGuestLogin = () => {
    router.replace("/(tabs)/jadwalIbadah");
  };

  return (
    <View style={style.container}>
      <Text style={style.title}>Masuk</Text>
      <View style={style.buttonContainer}>
        <TouchableOpacity style={style.googleButton} onPress={handleGoogleSignIn}>
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
    flexDirection: "row",
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
