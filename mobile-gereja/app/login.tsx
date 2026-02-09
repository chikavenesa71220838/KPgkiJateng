import React from 'react';
import { Button } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// 1. Konfigurasi Google Sign-In (Jalankan ini sekali saat app load, misal di useEffect)
GoogleSignin.configure({
  // Tempel Web Client ID yang kamu copy tadi di sini
  webClientId: '848782878807-jmcg7f65sj586hde2isabmdjtd28rqj7.apps.googleusercontent.com', 
});

const LoginScreen = () => {

  // Fungsi Login
async function onGoogleButtonPress() {
  try {
    // 1. Cek Play Services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // 2. Sign-in
    const response = await GoogleSignin.signIn();

    // 3. Ambil idToken (Perhatikan .data)
    // Di TypeScript, kita perlu handling kalau data null
    const idToken = response.data?.idToken; 

    if (!idToken) {
      throw new Error('No ID token found');
    }

    // 4. Buat credential Firebase
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // 5. Sign-in ke Firebase
    return auth().signInWithCredential(googleCredential);
    
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    // Handle error (misal user cancel login)
  }
}

  return (
    <Button
      title="Google Sign-In"
      onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Firebase!'))}
    />
  );
}

export default LoginScreen;