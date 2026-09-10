import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const subirFotoProducto = async (archivo) => {
  if (!archivo) return null;
  const extension = archivo.name.split('.').pop();
  const nombreUnico = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;
  const storageRef = ref(storage, `productos/${nombreUnico}`);
  
  const snapshot = await uploadBytes(storageRef, archivo);
  const urlPublica = await getDownloadURL(snapshot.ref);
  return urlPublica;
};