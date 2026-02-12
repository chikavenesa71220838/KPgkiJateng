import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Layout } from "../constants/theme";

GoogleSignin.configure({
  webClientId: '848782878807-jmcg7f65sj586hde2isabmdjtd28rqj7.apps.googleusercontent.com',
});

const LoginScreen = () => {
  const router = useRouter();

  async function onGoogleButtonPress() {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;

      if (!idToken) throw new Error('No ID token found');

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const user = userCredential.user;

      Alert.alert("Sukses", `Selamat datang, ${user.displayName}`);
      router.replace("/home");

    } catch (error: any) {
      Alert.alert("Login Gagal", error.message);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        
        <Text style={styles.title}>Masuk</Text>

        {/* Tombol Google */}
        <TouchableOpacity 
          style={styles.googleButton} 
          onPress={onGoogleButtonPress}
        >
          <Ionicons name="logo-google" size={20} color={Colors.primary} />
          <Text style={styles.googleText}>Masuk dengan Google</Text>
        </TouchableOpacity>

        {/* Tombol Guest */}
        <TouchableOpacity 
          style={styles.guestButton}
          onPress={() => router.replace("/home")}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: Colors.primary,
    padding: 30,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 25,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    marginBottom: 15,
  },
  googleText: {
    marginLeft: 10,
    fontWeight: '600',
    color: Colors.primary,
  },
  guestButton: {
    backgroundColor: Colors.muda,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  guestText: {
    fontWeight: '600',
    color: Colors.primary,
  },
});
