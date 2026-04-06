import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAxW1_l5TRUxwA0Z2lct82d4ZzWL3Ugfcs",
  authDomain: "mobile-gereja.firebaseapp.com",
  projectId: "mobile-gereja",
  storageBucket: "mobile-gereja.firebasestorage.app",
  messagingSenderId: "848782878807",
  appId: "1:848782878807:web:1c02ffd90364f6bb529b12",
  measurementId: "G-00ZHRL3NSY"
};

// Mencegah inisialisasi ganda di React
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const webAuth = getAuth(app);

export const signInGoogleAccess = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  const userCredential = await signInWithPopup(webAuth, provider);
  
  const firebaseToken = await userCredential.user.getIdToken(true);
  
  return { user: userCredential.user, firebaseToken };
};

export const forceSignOut = async () => {
  await signOut(webAuth);
};

export const listenToAuth = (callback: (user: any) => void) => {
  return onAuthStateChanged(webAuth, callback);
};