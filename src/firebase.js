import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBZKaEPbW3D-FmKLxiWLHiYfXsyw6fmW8s",
  authDomain: "rossely-8af03.firebaseapp.com",
  projectId: "rossely-8af03",
  storageBucket: "rossely-8af03.firebasestorage.app",
  messagingSenderId: "1022004792497",
  appId: "1:1022004792497:web:9f872b282364e0ba4ea690",
  measurementId: "G-1QKW4QZ5CT"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);