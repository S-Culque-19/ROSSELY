// ============================================================================
// 1. SERVICIO DE SUBIDA A FIREBASE STORAGE (src/services/storageService.js)
// ============================================================================
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "../firebase";

const storage = getStorage(app);

export const subirImagenConProgreso = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No se proporcionó ningún archivo para subir."));
      return;
    }

    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const storageRef = ref(storage, `productos/${timestamp}_${cleanName}`);
    
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(progress));
      },
      (error) => {
        console.error("Error en Firebase Storage:", error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
};