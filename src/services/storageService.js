// ============================================================================
// SERVICIO DE SUBIDA A FIREBASE STORAGE (src/services/storageService.js)
// ============================================================================
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../firebase";

const storage = getStorage(app);

export const subirImagenConProgreso = async (file, onProgress) => {
  if (!file) throw new Error("No se proporcionó ningún archivo.");
  
  if (onProgress) onProgress(30); // Progreso inicial rápido
  
  const timestamp = Date.now();
  const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const storageRef = ref(storage, `productos/${timestamp}_${cleanName}`);
  
  // Subida directa y blindada sin bloqueos de hilo
  const snapshot = await uploadBytes(storageRef, file);
  
  if (onProgress) onProgress(100); // Progreso completado
  
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};