import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
  useWindowDimensions
} from "react-native";
import { API_URL } from "@/utils/api";
import { fetchGerejaAPI, checkUserAPI, linkAccountAPI, createUserAPI } from "../services/profileAPI";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Shadows, Layout, FontSize } from "../constants/theme";

import { signInGoogleAccess, forceSignOut } from "../services/authGoogle";

const BASE_URL = API_URL.replace("/api/graphql", "");

const LoginScreen = () => {
  const router = useRouter();

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [isLoading, setIsLoading] = useState(false);
  const [gereja, setGereja] = useState<{ nama: string; logo?: { url: string } } | null>(null);

  useEffect(() => {
    fetchGerejaAPI()
      .then((data) => setGereja(data ?? null))
      .catch(() => { });
  }, []);

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
      const existingUser = await checkUserAPI(user.uid, user.email!, firebaseToken);

      if (existingUser) {
        // SKENARIO A: Hubungkan Akun (Linking Account)
        if (!existingUser.googleId) {
          await linkAccountAPI(existingUser.id, user.uid, firebaseToken);
          console.log("Akun berhasil dihubungkan.");
        }

        // Pindah Halaman
        setIsLoading(false);
        router.replace("/home");
      } else {
        // SKENARIO B: Registrasi Otomatis Jemaat Baru
        const newUser = await createUserAPI(
          {
            namaUser: user.displayName ?? "User GKI",
            emailUser: user.email!,
            googleId: user.uid,
          },
          firebaseToken,
        );
        console.log("User baru berhasil dibuat di Keystone:", newUser);

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
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.container}>
        <View style={[
          styles.contentWrapper,
          isLandscape && {
            flexDirection: 'row',
            justifyContent: 'center',
            maxWidth: 1000,
            alignSelf: 'center',
            width: '95%'
          }
        ]}>

          {/* Bagian Logo / Judul Mode Landscape*/}
          <View style={[
            styles.headerSection,
            isLandscape && {
              marginBottom: 0,
              marginRight: 40,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingLeft: Layout.padding
            }
          ]}>
            {gereja?.logo?.url ? (
              <Image
                source={{ uri: `${BASE_URL}${gereja.logo.url}` }}
                style={styles.logoImage}
              />
            ) : (
              <View style={styles.iconCircle}>
                <Ionicons name="people" size={40} color={Colors.primary} />
              </View>
            )}
            <Text style={styles.title}>{gereja?.nama ?? "Nama Gereja"}</Text>
            <Text style={styles.subtitle}>Aplikasi Informasi untuk Jemaat</Text>
          </View>

          {/* BAGIAN KANAN (Mode Landscape) / BAGIAN BAWAH (Mode Portrait) */}
          <View style={isLandscape && { flex: 1, justifyContent: 'center', alignItems: 'center' }}>

          
          {/* Card Form */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Daftar atau Masuk ke Akun Anda</Text>

            <Text style={styles.description}>
              Gunakan akun Google Anda untuk melanjutkan.
            </Text>

            <TouchableOpacity
              style={[styles.googleButton, isLoading && { opacity: 0.7 }]}
              onPress={onGoogleButtonPress}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Ionicons name="logo-google" size={20} color={Colors.white} style={{ marginRight: 8 }} />
              )}
              <Text style={styles.googleText}>
                {isLoading ? "Memuat..." : "Lanjutkan dengan Google"}
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ATAU</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.guestButton, isLoading && { opacity: 0.7 }]}
              onPress={() => router.replace("/home")}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.guestText}>Lanjutkan sebagai Tamu</Text>
            </TouchableOpacity>
          </View>
          </View>
        </View>
      </LinearGradient>
    </>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Layout.padding,
  },

  headerSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 16,
    ...Shadows.button,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    ...Shadows.button,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.primary,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textMuted,
    textAlign: "center",
  },

  card: {
    width: "100%",
    maxWidth: 400, // Agar di tablet/web tidak terlalu melebar
    backgroundColor: Colors.white,
    borderRadius: Layout.radiusXLarge,
    padding: 30,
    ...Shadows.shdows,
  },
  cardTitle: {
    fontSize: FontSize.h2,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: FontSize.body,
    color: Colors.textMuted,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },

  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Layout.radiusLarge,
    justifyContent: "center",
    marginBottom: 20,
    ...Shadows.button,
  },
  googleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.white,
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  dividerText: {
    paddingHorizontal: 10,
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },

  guestButton: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    borderRadius: Layout.radiusLarge,
    alignItems: "center",
  },
  guestText: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.text,
  },
});