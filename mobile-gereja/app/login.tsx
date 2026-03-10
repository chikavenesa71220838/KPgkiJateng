import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { API_URL } from "@/utils/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/theme";

// Konfigurasi Google Sign-In menggunakan Web Client ID dari Firebase Console
GoogleSignin.configure({
  webClientId: "848782878807-jmcg7f65sj586hde2isabmdjtd28rqj7.apps.googleusercontent.com",
});

const LoginScreen = () => {
  const router = useRouter();

  async function onGoogleButtonPress() {
    try {
      // 1. Inisialisasi Google Sign-In dan perolehan ID Token
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;

      if (!idToken) throw new Error("Google ID Token tidak ditemukan.");

      // 2. Autentikasi dengan Firebase Authentication [cite: 223]
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const user = userCredential.user;

      // 3. Ambil Firebase ID Token terbaru (Force Refresh)
      // Menggunakan true untuk memastikan token belum kadaluwarsa saat dikirim ke backend
      const firebaseToken = await user.getIdToken(true);
      console.log("Firebase Login Sukses. Token aktif didapatkan.", firebaseToken);

      // 4. Logika SSO: Cek user berdasarkan googleId ATAU emailUser [cite: 185]
      // Pengecekan emailUser bertujuan mencegah error Unique Constraint pada database
      const CHECK_USER_QUERY = {
        query: `
          query GetUser($googleId: String!, $email: String!) {
            users(where: { 
              OR: [
                { googleId: { equals: $googleId } },
                { emailUser: { equals: $email } }
              ]
            }) {
              id
              googleId
              namaUser
            }
          }
        `,
        variables: { googleId: user.uid, email: user.email },
      };

      const checkRes = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`, // Menyertakan token aktif [cite: 220]
        },
        body: JSON.stringify(CHECK_USER_QUERY),
      });

      const checkData = await checkRes.json();

      // Validasi Respon Server: Jika token tidak valid, proses dihentikan di sini
      if (!checkRes.ok || checkData.errors) {
        const errorMsg = checkData.errors?.[0]?.message || "Gagal memverifikasi sesi ke server.";
        throw new Error(errorMsg); 
      }

      const existingUser = checkData.data?.users?.[0];

      if (existingUser) {
        // SKENARIO A: Hubungkan Akun (Linking Account)
        // Jika email sudah terdaftar namun belum memiliki Google ID
        if (!existingUser.googleId) {
          const UPDATE_USER_MUTATION = {
            query: `
              mutation LinkAccount($id: ID!, $googleId: String!) {
                updateUser(where: { id: $id }, data: { googleId: $googleId }) {
                  id
                }
              }
            `,
            variables: { id: existingUser.id, googleId: user.uid },
          };

          const updateRes = await fetch(API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${firebaseToken}`,
            },
            body: JSON.stringify(UPDATE_USER_MUTATION),
          });

          const updateData = await updateRes.json();
          if (!updateRes.ok || updateData.errors) throw new Error("Gagal menghubungkan akun.");
          console.log("Akun berhasil dihubungkan.");
        }
      } else {
        // SKENARIO B: Registrasi Otomatis Jemaat Baru
        const CREATE_USER_MUTATION = {
          query: `
            mutation SyncUser($data: UserCreateInput!) {
              createUser(data: $data) {
                id
              }
            }
          `,
          variables: {
            data: {
              namaUser: user.displayName ?? "User GKI",
              emailUser: user.email,
              googleId: user.uid,
            },
          },
        };

        const createRes = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${firebaseToken}`,
          },
          body: JSON.stringify(CREATE_USER_MUTATION),
        });

        const createData = await createRes.json();
        if (!createRes.ok || createData.errors) throw new Error("Gagal membuat data jemaat baru.");
        console.log("User baru berhasil dibuat.");
      }

      // Berhasil masuk ke sistem
      Alert.alert("Sukses", `Selamat datang, ${user.displayName}`);
      router.replace("/home");

    } catch (error: any) {
      console.error("Login Error:", error);
      // Fail-Safe: Paksa logout dari Firebase jika sinkronisasi backend gagal [cite: 219]
      await auth().signOut(); 
      Alert.alert("Login Gagal", error.message || "Terjadi kesalahan sistem.");
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Masuk</Text>

        <TouchableOpacity style={styles.googleButton} onPress={onGoogleButtonPress}>
          <Ionicons name="logo-google" size={20} color={Colors.primary} />
          <Text style={styles.googleText}>Masuk dengan Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.guestButton} onPress={() => router.replace("/home")}>
          <Text style={styles.guestText}>Lanjutkan sebagai Tamu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "85%",
    backgroundColor: Colors.primary,
    padding: 30,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 25,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
    marginBottom: 15,
  },
  googleText: {
    marginLeft: 10,
    fontWeight: "600",
    color: Colors.primary,
  },
  guestButton: {
    backgroundColor: Colors.muda,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  guestText: {
    fontWeight: "600",
    color: Colors.primary,
  },
});