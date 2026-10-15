import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc, doc, setDoc,
  serverTimestamp, query, orderBy, where, getDoc
} from 'firebase/firestore';
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, sendPasswordResetEmail, updateProfile, getIdTokenResult
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions, storage } from '../firebase';
import { ref, uploadBytes } from 'firebase/storage';

const StoreContext = createContext(null);
const cleanError = (error) => {
  const code = error?.code || '';
  const messages = {
    'auth/invalid-credential': 'Correo o contraseña incorrectos.',
    'auth/user-not-found': 'No existe una cuenta con ese correo.',
    'auth/wrong-password': 'Correo o contraseña incorrectos.',
    'auth/email-already-in-use': 'Este correo ya está registrado.',
    'auth/invalid-email': 'El correo electrónico no tiene un formato válido.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
    'auth/network-request-failed': 'No se pudo conectar. Revisa tu conexión.'
  };
  return messages[code] || error?.message || 'No se pudo completar la operación.';
};

export const StoreProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const [colecciones, setColecciones] = useState([
    { id: 'col_1', nombre: 'Colección Exclusiva • Atelier ROSSELY' },
    { id: 'col_2', nombre: 'Edición Seda Imperial' },
    { id: 'col_3', nombre: 'Satén de Novias & Veladas' }
  ]);
  const [pedidos, setPedidos] = useState([]);
  const [avisosGlobales, setAvisosGlobales] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [authCargando, setAuthCargando] = useState(true);
  const [carrito, setCarrito] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rossely_carrito') || '[]'); }
    catch { return []; }
  });
  const [currentView, setCurrentView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const esAdmin = usuarioActual?.role === 'admin';

  // La sesión procede exclusivamente de Firebase Authentication, nunca de localStorage.
  useEffect(() => onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      setUsuarioActual(null);
      setAuthCargando(false);
      setCurrentView((v) => v === 'admin' ? 'home' : v);
      return;
    }
    try {
      const token = await getIdTokenResult(firebaseUser, true);
      const admin = token.claims.admin === true || token.claims.role === 'admin';
      const profileRef = doc(db, 'usuarios', firebaseUser.uid);
      const profileSnap = await getDoc(profileRef);
      const profile = profileSnap.exists() ? profileSnap.data() : {};
      const user = {
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        nombre: profile.nombre || firebaseUser.displayName || (firebaseUser.email || '').split('@')[0],
        role: admin ? 'admin' : 'user',
        puntos: Number(profile.puntos) || 0,
        suscripcion: profile.suscripcion?.tipo === 'premium' && (!profile.suscripcion.fechaExpiracion || new Date(profile.suscripcion.fechaExpiracion).getTime() <= Date.now())
          ? { ...profile.suscripcion, tipo: 'expired' }
          : (profile.suscripcion || { tipo: 'free' })
      };
      setUsuarioActual(user);
      if (admin) setCurrentView((v) => v === 'auth' ? 'admin' : v);
      else setCurrentView((v) => (v === 'admin' || v === 'auth') ? 'home' : v);
    } catch (error) {
      console.error('No se pudo cargar el perfil autenticado:', error);
      setUsuarioActual({
        uid: firebaseUser.uid, id: firebaseUser.uid,
        email: firebaseUser.email || '', nombre: firebaseUser.displayName || '',
        role: 'user', puntos: 0, suscripcion: { tipo: 'free' }
      });
    } finally {
      setAuthCargando(false);
    }
  }), []);

  useEffect(() => {
    const productQuery = esAdmin ? collection(db, 'productos') : query(collection(db, 'productos'), where('publicado', '==', true));
    const unsub = onSnapshot(productQuery, (snapshot) => {
      setProductos(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setCargandoProductos(false);
    }, (error) => {
      console.error('No se pudo cargar el catálogo:', error);
      setCargandoProductos(false);
    });
    return unsub;
  }, [esAdmin]);

  useEffect(() => onSnapshot(collection(db, 'colecciones'), (snapshot) => {
    if (!snapshot.empty) setColecciones(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (error) => console.warn('Colecciones no disponibles:', error)), []);

  useEffect(() => {
    if (!usuarioActual) { setPedidos([]); return undefined; }
    const ref = collection(db, 'pedidos');
    const q = esAdmin ? query(ref, orderBy('createdAt', 'desc')) :
      query(ref, where('uid', '==', usuarioActual.uid), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => setPedidos(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))),
      (error) => { console.error('No se pudieron cargar los pedidos autorizados:', error); setPedidos([]); });
  }, [usuarioActual?.uid, esAdmin]);

  useEffect(() => {
    if (!usuarioActual) { setAvisosGlobales([]); return undefined; }
    const q = query(collection(db, 'avisos_gerenciales'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => setAvisosGlobales(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))),
      (error) => console.warn('Avisos no disponibles:', error));
  }, [usuarioActual?.uid]);

  useEffect(() => {
    localStorage.setItem('rossely_carrito', JSON.stringify(carrito));
  }, [carrito]);

  const iniciarSesion = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      return { success: true };
    } catch (error) { return { success: false, error: cleanError(error) }; }
  };

  const registrarUsuario = async (nombre, email, password) => {
    const cleanName = nombre.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanName) return { success: false, error: 'Ingresa tu nombre.' };
    if (password.length < 8) return { success: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
    try {
      const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      await updateProfile(credential.user, { displayName: cleanName });
      await setDoc(doc(db, 'usuarios', credential.user.uid), {
        uid: credential.user.uid, email: cleanEmail, nombre: cleanName,
        role: 'user', puntos: 0, suscripcion: { tipo: 'free' },
        fechaRegistro: serverTimestamp(), createdAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) { return { success: false, error: cleanError(error) }; }
  };

  const recuperarContrasena = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      return { success: true };
    } catch (error) { return { success: false, error: cleanError(error) }; }
  };

  const cerrarSesion = async () => {
    await signOut(auth);
    setCarrito([]);
    localStorage.removeItem('rossely_carrito');
    setCurrentView('home');
  };

  const agregarAlCarrito = (producto, talla = 'M', color = 'Rosa', cantidad = 1) => {
    if (!usuarioActual) { setCurrentView('auth'); return { success: false, error: 'Inicia sesión para comprar.' }; }
    if (esAdmin) return { success: false, error: 'La cuenta administrativa no puede realizar compras.' };
    const stock = Number(producto?.tallasStock?.[talla] ?? producto?.stock ?? 0);
    if (!Number.isInteger(cantidad) || cantidad < 1 || stock < cantidad) {
      return { success: false, error: 'No hay existencias suficientes para esa talla.' };
    }
    const key = producto.id + ':' + talla + ':' + color;
    setCarrito(prev => {
      const existing = prev.find(i => i.cartItemId === key);
      if (existing) return prev.map(i => i.cartItemId === key ? { ...i, cantidad: Math.min(stock, i.cantidad + cantidad) } : i);
      return [...prev, {
        ...producto, cartItemId: key, tallaSeleccionada: talla, colorSeleccionado: color,
        cantidad, precio: Number(producto.precio) || 0
      }];
    });
    setCurrentView('cart');
    return { success: true };
  };

  const removerDelCarrito = (cartItemId) => setCarrito(prev => prev.filter(i => i.cartItemId !== cartItemId));

  const calcularMembresiaRuleta = (pedidosCliente) => {
    const gasto = pedidosCliente.reduce((acc, p) => acc + (Number(p.subtotal || p.total) || 0), 0);
    if (gasto >= 1000) return { nivel: 'Gold VIP', ruleta: 'Ruleta de Oro (Premios Exclusivos)' };
    if (gasto >= 500) return { nivel: 'VIP', ruleta: 'Ruleta Estándar (Premios de Seda)' };
    return { nivel: 'Regular', ruleta: 'Sin Ruleta Activa' };
  };

  const registrarPedido = async (datosEnvio, comprobante = null) => {
    if (!auth.currentUser || !carrito.length) throw new Error('Inicia sesión y añade productos antes de confirmar.');
    let comprobanteStoragePath = null;
    if (comprobante instanceof File) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(comprobante.type) || comprobante.size > 8 * 1024 * 1024) {
        throw new Error('El comprobante debe ser JPEG, PNG o WebP y pesar como máximo 8 MB.');
      }
      comprobanteStoragePath = 'comprobantes/' + auth.currentUser.uid + '/' + crypto.randomUUID() + '_' + comprobante.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      await uploadBytes(ref(storage, comprobanteStoragePath), comprobante, { contentType: comprobante.type });
    }
    const crearPedido = httpsCallable(functions, 'createOrder');
    const result = await crearPedido({
      items: carrito.map(item => ({
        productId: item.id, talla: item.tallaSeleccionada || 'M',
        color: item.colorSeleccionado || 'Rosa', cantidad: Number(item.cantidad) || 1
      })),
      datosEnvio,
      comprobanteStoragePath
    });
    setCarrito([]);
    localStorage.removeItem('rossely_carrito');
    return result.data?.orderId || null;
  };

  const registrarPedidoConPuntos = async () => {
    if (!auth.currentUser || !carrito.length) throw new Error('Inicia sesión y añade productos antes de continuar.');
    const pagarConPuntos = httpsCallable(functions, 'redeemPointsForOrder');
    const result = await pagarConPuntos({
      items: carrito.map(item => ({
        productId: item.id, talla: item.tallaSeleccionada || 'M',
        color: item.colorSeleccionado || 'Rosa', cantidad: Number(item.cantidad) || 1
      }))
    });
    setCarrito([]);
    localStorage.removeItem('rossely_carrito');
    return result.data?.orderId || null;
  };

  const actualizarEstadoPedido = async (id, nuevoEstado) => {
    if (!esAdmin) throw new Error('Operación reservada al administrador.');
    if (['Verificado', 'Pago verificado', 'Pago Verificado'].includes(nuevoEstado)) {
      const verificar = httpsCallable(functions, 'verifyOrderPayment');
      await verificar({ orderId: id });
      return;
    }
    const actualizar = httpsCallable(functions, 'updateOrderStatus');
    await actualizar({ orderId: id, status: nuevoEstado });
  };

  const eliminarProducto = async (id) => {
    if (!esAdmin) throw new Error('Operación reservada al administrador.');
    await updateDoc(doc(db, 'productos', id), { publicado: false, archivado: true, updatedAt: serverTimestamp() });
  };

  const editarProducto = async (id, datosActualizados) => {
    if (!esAdmin) throw new Error('Operación reservada al administrador.');
    await updateDoc(doc(db, 'productos', id), { ...datosActualizados, updatedAt: serverTimestamp() });
  };

  const agregarColeccionDinamica = async (nombreColeccion) => {
    if (!esAdmin) throw new Error('Operación reservada al administrador.');
    const docRef = await addDoc(collection(db, 'colecciones'), { nombre: nombreColeccion, createdAt: serverTimestamp() });
    setColecciones(prev => [...prev, { id: docRef.id, nombre: nombreColeccion }]);
  };

  const navegarA = useCallback((vista, producto = null) => {
    if (vista === 'admin' && !esAdmin) { setCurrentView(usuarioActual ? 'home' : 'auth'); return; }
    if (producto) setSelectedProduct(producto);
    setCurrentView(vista);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [esAdmin, usuarioActual]);

  return <StoreContext.Provider value={{
    productos, colecciones, avisosGlobales, cargandoProductos, carrito, currentView,
    selectedProduct, pedidos, usuarioActual, esAdmin, authCargando,
    iniciarSesion, registrarUsuario, recuperarContrasena, cerrarSesion,
    agregarAlCarrito, removerDelCarrito, registrarPedido, registrarPedidoConPuntos,
    actualizarEstadoPedido, eliminarProducto, editarProducto, agregarColeccionDinamica,
    calcularMembresiaRuleta, navegarA
  }}>{children}</StoreContext.Provider>;
};

export const useStore = () => useContext(StoreContext);
