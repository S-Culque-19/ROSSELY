import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBZKaEPbw3D-FmKLxiWLHiYfXsyw6fmW8s",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "rossely-8af03.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rossely-8af03",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "rossely-8af03.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1022004792497",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1022004792497:web:9f872b282364e0ba4ea690"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);