import React from 'react';
import { Button, View, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { API_URL } from "@/utils/api"; 
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

      // 3. Logika SSO: Cek apakah user sudah ada di KeystoneJS
      const CHECK_USER_QUERY = {
        query: `
          query GetUser($googleId: String!) {
            users(where: { googleId: { equals: $googleId } }) {
              id
              namaUser
            }
          }
        `,
        variables: { googleId: user.uid },
      };

      const checkRes = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(CHECK_USER_QUERY),
      });

      const checkData = await checkRes.json();
      const existingUser = checkData.data?.users?.[0];

      if (existingUser) {
        // Jika user ditemukan, langsung lanjut tanpa membuat data baru
        console.log("User lama terdeteksi (SSO Berhasil):", existingUser.namaUser);
      } else {
        // Jika user tidak ditemukan, buat data user baru di KeystoneJS
        const CREATE_USER_MUTATION = {
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
              googleId: user.uid,
            },
          },
        };

        const createRes = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(CREATE_USER_MUTATION),
        });

        const createResult = await createRes.json();
        
        if (createResult.errors) {
          throw new Error(createResult.errors[0].message);
        }
        console.log("User baru berhasil dibuat di Keystone:", createResult.data.createUser);
      }

      // 4. Navigasi ke halaman utama setelah sukses
      Alert.alert("Sukses", `Selamat datang, ${user.displayName}`);
      router.replace("/home"); 

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