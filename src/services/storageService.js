import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../firebase";

const storage = getStorage(app);

export const subirFotoProducto = async (file) => {
  try {
    if (!file) return null;
    
    // Crear una referencia única para el archivo
    const timestamp = Date.now();
    const fileName = `productos/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, fileName);

    // Subir el archivo directamente a Firebase Storage
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("Error crítico en storageService:", error);
    // Fallback de seguridad: si Firebase Storage tuviera algún inconveniente de cuota, 
    // convierte la imagen a Base64 para que la prenda se guarde de inmediato sin frenar a la administración
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve("https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=800");
      reader.readAsDataURL(file);
    });
  }
};