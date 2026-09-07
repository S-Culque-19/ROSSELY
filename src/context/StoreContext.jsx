import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);

  // Sesión persistida
  const [usuarioActual, setUsuarioActual] = useState(() => {
    const saved = localStorage.getItem('rossely_sesion');
    return saved ? JSON.parse(saved) : null;
  });

  // Carrito local de respaldo
  const [carrito, setCarrito] = useState(() => {
    const saved = localStorage.getItem('rossely_carrito');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentView, setCurrentView] = useState(() => {
    const saved = localStorage.getItem('rossely_sesion');
    if (saved) {
      const u = JSON.parse(saved);
      if (u?.role === 'admin') return 'admin';
    }
    return 'home';
  });

  const [selectedProduct, setSelectedProduct] = useState(null);

  const esAdmin = usuarioActual?.role === 'admin';

  // --- LÓGICA DE FIDELIZACIÓN: NIVELES Y CADUCIDAD DE TIERS (7 DÍAS) ---
  const calcularMembresiaRuleta = (pedidosCliente) => {
    const ahora = new Date();
    const sieteDiasAtras = new Date(ahora.getTime() - (7 * 24 * 60 * 60 * 1000));

    const gastoSemanal = pedidosCliente.reduce((acc, p) => {
      const fechaP = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.fecha || ahora);
      if (fechaP >= sieteDiasAtras) {
        return acc + (parseFloat(p.subtotal || p.total) || 0);
      }
      return acc;
    }, 0);

    if (gastoSemanal >= 1000) {
      return { nivel: 'Gold VIP', tipoRuleta: 'gold', activo: true, gastoSemanal };
    } else if (gastoSemanal >= 500) {
      return { nivel: 'Plata / Seda', tipoRuleta: 'estandar', activo: true, gastoSemanal };
    } else {
      return { nivel: 'Plan Gratis', tipoRuleta: null, activo: false, gastoSemanal };
    }
  };

  // --- LÓGICA DE SUSCRIPCIÓN PREMIUM Y PUNTOS CANJEABLES (8 pts = S/. 1.00) ---
  const verificarSuscripcionActiva = (usuario) => {
    if (!usuario?.suscripcion) return false;
    const exp = usuario.suscripcion.fechaExpiracion?.toDate ? usuario.suscripcion.fechaExpiracion.toDate() : new Date(usuario.suscripcion.fechaExpiracion || 0);
    return usuario.suscripcion.tipo === 'premium' && new Date() < exp;
  };

  // 1. Escuchar catálogo de productos en tiempo real
  useEffect(() => {
    try {
      const colRef = collection(db, 'productos');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setProductos(list);
        setCargandoProductos(false);
      }, () => {
        const unsubFallback = onSnapshot(colRef, (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setProductos(list);
          setCargandoProductos(false);
        });
        return () => unsubFallback();
      });
      return () => unsub();
    } catch (e) {
      setCargandoProductos(false);
    }
  }, []);

  // 2. Escuchar pedidos en tiempo real
  useEffect(() => {
    try {
      const colRef = collection(db, 'pedidos');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setPedidos(list);
      }, () => {
        const unsubFallback = onSnapshot(colRef, (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setPedidos(list);
        });
        return () => unsubFallback();
      });
      return () => unsub();
    } catch (e) {
      console.warn("Pedidos offline:", e);
    }
  }, []);

  // 3. Sincronización del Carrito Multidispositivo en Cloud Firestore
  useEffect(() => {
    if (!usuarioActual?.uid || esAdmin) {
      const saved = localStorage.getItem('rossely_carrito');
      setCarrito(saved ? JSON.parse(saved) : []);
      return;
    }

    const cartDocRef = doc(db, 'usuarios', usuarioActual.uid, 'carrito', 'actual');
    const unsub = onSnapshot(cartDocRef, (snap) => {
      if (snap.exists()) {
        const cloudItems = snap.data().items || [];
        setCarrito(cloudItems);
        localStorage.setItem('rossely_carrito', JSON.stringify(cloudItems));
      } else {
        setCarrito([]);
      }
    }, (error) => {
      console.error("Error sincronizando carrito en la nube:", error);
    });

    return () => unsub();
  }, [usuarioActual?.uid, esAdmin]);

  const sincronizarCarrito = async (nuevosItems) => {
    setCarrito(nuevosItems);
    localStorage.setItem('rossely_carrito', JSON.stringify(nuevosItems));

    if (usuarioActual?.uid && !esAdmin) {
      try {
        const cartDocRef = doc(db, 'usuarios', usuarioActual.uid, 'carrito', 'actual');
        await setDoc(cartDocRef, { 
          items: nuevosItems, 
          ultimaModificacion: serverTimestamp() 
        }, { merge: true });
      } catch (err) {
        console.error("Error al persistir carrito remoto:", err);
      }
    }
  };

  useEffect(() => {
    if (usuarioActual) {
      localStorage.setItem('rossely_sesion', JSON.stringify(usuarioActual));
    } else {
      localStorage.removeItem('rossely_sesion');
    }
  }, [usuarioActual]);

  // Autenticación Resiliente
  const iniciarSesion = async (email, password) => {
    const correo = email.trim().toLowerCase();

    // Soporte administrativo bypass con el dominio y credencial exactos definidos
    if (correo === 'carmenadeshda.org.com' && password === 'prins2026') {
      const adminData = {
        uid: 'admin_rossely_carmen',
        email: 'carmenadeshda.org.com',
        nombre: 'Carmen Estrada (Dirección)',
        role: 'admin'
      };
      setUsuarioActual(adminData);
      setCarrito([]);
      localStorage.setItem('rossely_sesion', JSON.stringify(adminData));
      localStorage.removeItem('rossely_carrito');
      setCurrentView('admin');
      return { success: true, role: 'admin' };
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, correo, password);
      const clienteData = {
        uid: cred.user.uid,
        email: cred.user.email,
        nombre: cred.user.displayName || correo.split('@')[0],
        role: 'user',
        puntos: 160
      };
      setUsuarioActual(clienteData);
      setCurrentView('home');
      return { success: true, role: 'user' };
    } catch (error) {
      let mensaje = 'Credenciales no válidas o cuenta no registrada.';
      if (error.code === 'auth/user-not-found') {
        mensaje = 'No existe una cuenta registrada con este correo.';
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        mensaje = 'La contraseña ingresada es incorrecta.';
      }
      return { success: false, error: mensaje };
    }
  };

  const registrarUsuario = async (nombre, email, password) => {
    const correo = email.trim().toLowerCase();
    
    // Validación estricta exigida para clientas (Dominio Gmail obligatorio)
    if (!correo.endsWith('@gmail.com')) {
      return { success: false, error: 'El registro de clientas está reservado exclusivamente para correos @gmail.com' };
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, correo, password);
      const nuevoCliente = { 
        uid: cred.user.uid, 
        email: correo, 
        nombre, 
        role: 'user',
        puntos: 0,
        suscripcion: { tipo: 'free' },
        origen: 'Nuevo Chimbote Web',
        fechaRegistro: new Date().toISOString()
      };

      await setDoc(doc(db, 'usuarios', cred.user.uid), nuevoCliente);

      setUsuarioActual(nuevoCliente);
      setCurrentView('home');
      return { success: true };
    } catch (error) {
      let mensaje = error.message;
      if (error.code === 'auth/email-already-in-use') {
        mensaje = 'Este correo ya se encuentra registrado. Inicia sesión.';
      } else if (error.code === 'auth/weak-password') {
        mensaje = 'La contraseña debe tener al menos 6 caracteres.';
      }
      return { success: false, error: mensaje };
    }
  };

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    setUsuarioActual(null);
    setCarrito([]);
    localStorage.removeItem('rossely_sesion');
    localStorage.removeItem('rossely_carrito');
    setCurrentView('home');
  };

  const agregarAlCarrito = (producto, talla = 'M') => {
    if (esAdmin) {
      alert("Modo Supervisión: La cuenta administrativa no realiza compras directas.");
      return;
    }
    const index = carrito.findIndex(i => i.id === producto.id && i.tallaSeleccionada === talla);
    let nuevo;
    if (index > -1) {
      nuevo = [...carrito];
      nuevo[index].cantidad = (nuevo[index].cantidad || 1) + 1;
    } else {
      nuevo = [
        ...carrito, 
        { 
          ...producto, 
          cartItemId: Date.now() + Math.random(), 
          tallaSeleccionada: talla,
          cantidad: 1 
        }
      ];
    }
    sincronizarCarrito(nuevo);
    setCurrentView('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removerDelCarrito = (cartItemId) => {
    const nuevo = carrito.filter(i => i.cartItemId !== cartItemId);
    sincronizarCarrito(nuevo);
  };

  const limpiarCarrito = () => {
    sincronizarCarrito([]);
  };

  // Pedidos, Envíos Shalom y Acumulación de Puntos
  const registrarPedido = async (datosEnvio, comprobanteBase64 = null) => {
    if (esAdmin) {
      alert("El administrador no puede generar compras.");
      return null;
    }
    const subtotal = carrito.reduce((acc, it) => acc + (parseFloat(it.precio) || 0) * (it.cantidad || 1), 0);
    const costoEnvio = parseFloat(datosEnvio.costoEnvio || 0);
    const total = subtotal + costoEnvio;

    const esPremiumActivo = verificarSuscripcionActiva(usuarioActual);
    const multiplicadorPuntos = esPremiumActivo ? 1 : 0.5; 
    const puntosGanados = Math.floor(total * multiplicadorPuntos);

    const nuevoPedido = {
      cliente: datosEnvio,
      items: carrito,
      subtotal,
      envio: costoEnvio,
      total,
      puntosOtorgados: puntosGanados,
      estado: "Pendiente de Verificación",
      comprobanteImg: comprobanteBase64,
      despacho: "Agencia Shalom desde Nuevo Chimbote (Empaquetado en papel seda y caja ROSSELY)",
      fecha: new Date().toLocaleDateString('es-PE') + ' ' + new Date().toLocaleTimeString('es-PE'),
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'pedidos'), nuevoPedido);
    limpiarCarrito();
    return docRef.id;
  };

  const actualizarEstadoPedido = async (id, nuevoEstado) => {
    try {
      await updateDoc(doc(db, 'pedidos', id), { estado: nuevoEstado });
    } catch (e) {
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
    }
  };

  const eliminarProducto = async (id) => {
    try {
      await deleteDoc(doc(db, 'productos', id));
    } catch (e) {
      setProductos(prev => prev.filter(p => p.id !== id));
    }
  };

  const navegarA = (vista, producto = null) => {
    if (esAdmin && (vista === 'cart' || vista === 'checkout')) {
      setCurrentView('admin');
      return;
    }
    if (vista === 'admin' && !esAdmin) {
      setCurrentView('auth');
      return;
    }
    if (producto) setSelectedProduct(producto);
    setCurrentView(vista);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <StoreContext.Provider value={{
      productos,
      cargandoProductos,
      carrito,
      currentView,
      selectedProduct,
      pedidos,
      usuarioActual,
      esAdmin,
      iniciarSesion,
      registrarUsuario,
      cerrarSesion,
      agregarAlCarrito,
      removerDelCarrito,
      limpiarCarrito,
      registrarPedido,
      actualizarEstadoPedido,
      eliminarProducto,
      navegarA,
      calcularMembresiaRuleta,
      verificarSuscripcionActiva
    }}>
      {children}
    </StoreContext.Provider>
  );
};
 
export const useStore = () => useContext(StoreContext);