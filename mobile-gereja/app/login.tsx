import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { API_URL } from "@/utils/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/theme";

// AJAIB: Import ini akan otomatis milih file .native atau .web sesuai platform yang jalan!
import { signInGoogleAccess, forceSignOut } from "../services/authGoogle";

const LoginScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onGoogleButtonPress() {
    setIsLoading(true);
    try {
      // 1 & 2 & 3. Ambil data User & Token dari Mobile ATAU Web
      const { user, firebaseToken } = await signInGoogleAccess();
      console.log(
        "Firebase Login Sukses. Token aktif didapatkan.",
        firebaseToken,
      );

      // 4. Logika SSO: Cek user berdasarkan googleId ATAU emailUser
      const CHECK_USER_QUERY = {
        query: `
          query GetUser($googleId: String!, $email: String!) {
            users(where: { 
              statusAktivasi: { equals: "aktif" },
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
          Authorization: `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify(CHECK_USER_QUERY),
      });

      const checkData = await checkRes.json();

      if (!checkRes.ok || checkData.errors) {
        const errorMsg =
          checkData.errors?.[0]?.message ||
          "Gagal memverifikasi sesi ke server.";
        throw new Error(errorMsg);
      }

      const existingUser = checkData.data?.users?.[0];

      if (existingUser) {
        // SKENARIO A: Hubungkan Akun (Linking Account)
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
          if (!updateRes.ok || updateData.errors)
            throw new Error("Gagal menghubungkan akun.");
          console.log("Akun berhasil dihubungkan.");
        }

        // Pindah Halaman
        setIsLoading(false);
        router.replace("/home");
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

        const createResult = await createRes.json();

        if (createResult.errors)
          throw new Error(createResult.errors[0].message);
        console.log(
          "User baru berhasil dibuat di Keystone:",
          createResult.data.createUser,
        );

        // Pindah Halaman ke Complete Profile
        setIsLoading(false);
        router.replace("/completeProfile" as any);
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      await forceSignOut(); // Fail-Safe
      setIsLoading(false); // Matikan loading jika error

      // Jika user membatalkan popup web, jangan munculkan alert merah
      if (error.code === "auth/popup-closed-by-user") return;

      if (Platform.OS === "web") {
        alert(error.message || "Terjadi kesalahan sistem.");
      } else {
        Alert.alert(
          "Login Gagal",
          error.message || "Terjadi kesalahan sistem.",
        );
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Masuk</Text>

        <TouchableOpacity
          style={[styles.googleButton, isLoading && { opacity: 0.7 }]}
          onPress={onGoogleButtonPress}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Ionicons name="logo-google" size={20} color={Colors.primary} />
          )}
          <Text style={styles.googleText}>
            {isLoading ? "Memuat..." : "Masuk dengan Google"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.guestButton, isLoading && { opacity: 0.7 }]}
          onPress={() => router.replace("/home")}
          disabled={isLoading}
        >
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
  googleText: { marginLeft: 10, fontWeight: "600", color: Colors.primary },
  guestButton: {
    backgroundColor: Colors.muda,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  guestText: { fontWeight: "600", color: Colors.primary },
});
