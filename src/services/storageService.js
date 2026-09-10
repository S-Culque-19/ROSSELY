import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../firebase";

const storage = getStorage(app);

export const subirImagenConProgreso = async (file) => {
  if (!file) throw new Error("No hay archivo proporcionado.");
  
  const timestamp = Date.now();
  const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const storageRef = ref(storage, `productos/${timestamp}_${cleanName}`);
  
  // Subida directa sin callbacks de porcentaje que congelen la app
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
};