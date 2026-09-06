import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Sube un archivo File a la carpeta 'productos/' en Firebase Storage
 * y retorna la URL pública HTTPS de descarga.
 */
export const subirFotoProducto = async (archivo) => {
  if (!archivo) return null;

  // Generar un nombre único para evitar colisiones
  const extension = archivo.name.split('.').pop();
  const nombreUnico = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;
  
  const storageRef = ref(storage, `productos/${nombreUnico}`);
  
  // Subida de bytes
  const snapshot = await uploadBytes(storageRef, archivo);
  
  // Obtener URL pública
  const urlPublica = await getDownloadURL(snapshot.ref);
  return urlPublica;
};