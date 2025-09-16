// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBB63b2XCAEF9RvcDQNduBtQgM8Rw43OJA",
  authDomain: "kp-gki-jateng.firebaseapp.com",
  projectId: "kp-gki-jateng",
  storageBucket: "kp-gki-jateng.firebasestorage.app",
  messagingSenderId: "385851857488",
  appId: "1:385851857488:web:30f45f575100ee25404f55",
  measurementId: "G-YJX7YR4VGX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();