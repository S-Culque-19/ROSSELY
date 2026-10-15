import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// La configuración web de Firebase no es un secreto. Los permisos reales se aplican
// con Authentication, Security Rules y funciones de servidor.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBZKaEPbW3D-FmKLxiWLHiYfXsyw6fmW8s",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "rossely-8af03.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rossely-8af03",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "rossely-8af03.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1022004792497",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1022004792497:web:9f872b282364e0ba4ea690",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-1QRW4QZ5CT"
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
