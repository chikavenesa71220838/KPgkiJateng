import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId: "848782878807-jmcg7f65sj586hde2isabmdjtd28rqj7.apps.googleusercontent.com",
});

export const signInGoogleAccess = async () => {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  const idToken = response.data?.idToken;

  if (!idToken) throw new Error("Google ID Token tidak ditemukan.");

  const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  const userCredential = await auth().signInWithCredential(googleCredential);
  
  const firebaseToken = await userCredential.user.getIdToken(true);
  
  return { user: userCredential.user, firebaseToken };
};

export const forceSignOut = async () => {
  try {
    await auth().signOut();          
    await GoogleSignin.signOut();
  } catch (error) {
    console.error("Gagal Logout:", error);
  }
};

export const checkWebLoginResult = async () => {
  return null; 
};

export const listenToAuth = (callback: (user: any) => void) => {
  return auth().onAuthStateChanged(callback);
};