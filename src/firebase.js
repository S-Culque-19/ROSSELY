import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración de Firebase para Atelier ROSSELY
const firebaseConfig = {
  apiKey: "AIzaSyD-TusCredencialesRealesAqui", // Mantén tus credenciales originales si ya las tienes configuradas
  authDomain: "rossely-app.firebaseapp.com",
  projectId: "rossely-app",
  storageBucket: "rossely-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app); // <--- Esta es la exportación obligatoria que faltaba