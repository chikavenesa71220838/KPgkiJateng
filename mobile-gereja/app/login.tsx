import React from 'react';
import { Button, View, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { API_URL } from "@/utils/api"; // Import API_URL yang sama dengan ProfilGereja
import { useRouter } from "expo-router";

// Konfigurasi Google Sign-In
GoogleSignin.configure({
  webClientId: '848782878807-jmcg7f65sj586hde2isabmdjtd28rqj7.apps.googleusercontent.com', 
});

const LoginScreen = () => {
  const router = useRouter();

  async function onGoogleButtonPress() {
    try {
      // 1. Cek Play Services & Sign-in ke Google
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;

      if (!idToken) throw new Error('No ID token found');

      // 2. Buat credential Firebase & Sign-in ke Firebase
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const user = userCredential.user;

      console.log('Firebase Login Sukses:', user.email);

      // 3. Sinkronisasi data ke Backend KeystoneJS (Implementasi SSO)
      // Kita kirim mutation untuk mencari atau membuat user (upsert logic)
      const GQL_MUTATION = {
        query: `
          mutation SyncUser($data: UserCreateInput!) {
            createUser(data: $data) {
              id
              namaUser
              emailUser
            }
          }
        `,
        variables: {
          data: {
            namaUser: user.displayName ?? "User GKI",
            emailUser: user.email,
            googleId: user.uid, // Simpan UID Firebase sebagai key unik
          },
        },
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(GQL_MUTATION),
      });

      const jsonResult = await res.json();

      // Handle jika user sudah ada (Constraint Unique di Keystone)
      if (jsonResult.errors) {
        // Jika errornya karena email sudah ada, kita anggap login berhasil
        const isDuplicate = jsonResult.errors.some((e: any) => 
          e.message.includes('unique constraint') || e.message.includes('already exists')
        );

        if (isDuplicate) {
          console.log("User sudah terdaftar di database, lanjut ke Home.");
        } else {
          throw new Error(jsonResult.errors[0].message);
        }
      } else {
        console.log("User baru berhasil dibuat di Keystone:", jsonResult.data.createUser);
      }

      // 4. Navigasi ke halaman utama setelah sukses
      Alert.alert("Sukses", `Selamat datang, ${user.displayName}`);
      router.replace("/home"); // Sesuaikan dengan route home kamu

    } catch (error: any) {
      console.error("Login Error:", error);
      Alert.alert("Login Gagal", error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Button
        title="Google Sign-In"
        onPress={onGoogleButtonPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});

export default LoginScreen;