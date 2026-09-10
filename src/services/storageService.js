import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const subirFotoProducto = async (file) => {
  try {
    if (!file) return null;
    
    const timestamp = Date.now();
    const fileName = `productos/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, fileName);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("Error en storageService:", error);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve("https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=800");
      reader.readAsDataURL(file);
    });
  }
};