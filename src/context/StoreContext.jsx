import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
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

  const [usuarioActual, setUsuarioActual] = useState(() => {
    const saved = localStorage.getItem('rossely_sesion');
    return saved ? JSON.parse(saved) : null;
  });

  const [carrito, setCarrito] = useState(() => {
    const saved = localStorage.getItem('rossely_carrito');
    return saved ? JSON.parse(saved) : [];
  });

  // Si el usuario es admin al montar, abre directamente el panel de admin
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

  // 1. Escuchar catálogo en tiempo real
  useEffect(() => {
    try {
      const colRef = collection(db, 'productos');
      const unsubscribe = onSnapshot(colRef, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setProductos(list);
        setCargandoProductos(false);
      }, (err) => {
        console.warn("Modo local productos:", err.message);
        setCargandoProductos(false);
      });
      return () => unsubscribe();
    } catch (e) {
      setCargandoProductos(false);
    }
  }, []);

  // 2. Escuchar pedidos en tiempo real (ordenados por fecha si es posible)
  useEffect(() => {
    try {
      const colRef = collection(db, 'pedidos');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setPedidos(list);
      }, () => {
        // Fallback sin orderBy por si no hay índice
        onSnapshot(colRef, (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setPedidos(list);
        });
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Pedidos offline:", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rossely_carrito', JSON.stringify(carrito));
  }, [carrito]);

  useEffect(() => {
    if (usuarioActual) {
      localStorage.setItem('rossely_sesion', JSON.stringify(usuarioActual));
    } else {
      localStorage.removeItem('rossely_sesion');
    }
  }, [usuarioActual]);

  // Login
  const iniciarSesion = async (email, password) => {
    const correo = email.trim().toLowerCase();

    // Cuenta de administrador dedicada
    if (correo === 'carmenadeshda.org.com' && password === 'prins2026') {
      const adminData = {
        email: 'carmenadeshda.org.com',
        nombre: 'Administradora ROSSELY',
        role: 'admin'
      };
      setUsuarioActual(adminData);
      setCarrito([]); // El admin no usa carrito
      setCurrentView('admin');
      return { success: true, role: 'admin' };
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, correo, password);
      const clienteData = {
        uid: cred.user.uid,
        email: cred.user.email,
        nombre: cred.user.displayName || correo.split('@')[0],
        role: 'user'
      };
      setUsuarioActual(clienteData);
      setCurrentView('home');
      return { success: true, role: 'user' };
    } catch (error) {
      return { success: false, error: 'Credenciales inválidas o cuenta no registrada.' };
    }
  };

  const registrarUsuario = async (nombre, email, password) => {
    const correo = email.trim().toLowerCase();
    if (!correo.endsWith('@gmail.com')) {
      return { success: false, error: 'Clientes solo pueden registrarse con cuentas @gmail.com' };
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, correo, password);
      const nuevoCliente = { uid: cred.user.uid, email: correo, nombre, role: 'user' };
      setUsuarioActual(nuevoCliente);
      setCurrentView('home');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    setUsuarioActual(null);
    setCurrentView('home');
  };

  // Carrito: RESTRICCIÓN ESTRICTA PARA ADMINISTRADOR
  const agregarAlCarrito = (producto, talla = 'M') => {
    if (esAdmin) {
      alert("Acción deshabilitada: Las cuentas de Administrador no pueden realizar compras ni usar el carrito.");
      return;
    }
    setCarrito(prev => [...prev, { ...producto, cartItemId: Date.now() + Math.random(), tallaSeleccionada: talla }]);
    setCurrentView('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removerDelCarrito = (cartItemId) => {
    setCarrito(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const limpiarCarrito = () => setCarrito([]);

  // Pedidos (Clientes)
  const registrarPedido = async (datosEnvio) => {
    if (esAdmin) {
      alert("El administrador no puede generar órdenes.");
      return null;
    }
    const total = carrito.reduce((acc, item) => acc + item.precio, 0);

    const nuevoPedido = {
      cliente: datosEnvio,
      items: carrito,
      total,
      estado: "Pendiente",
      fecha: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, 'pedidos'), nuevoPedido);
      limpiarCarrito();
      return docRef.id;
    } catch (e) {
      const idLocal = String(Date.now()).slice(-6);
      setPedidos(prev => [{ id: idLocal, ...nuevoPedido }, ...prev]);
      limpiarCarrito();
      return idLocal;
    }
  };

  // Actualizar Estado del Pedido (Admin)
  const actualizarEstadoPedido = async (id, nuevoEstado) => {
    try {
      await updateDoc(doc(db, 'pedidos', id), { estado: nuevoEstado });
    } catch (e) {
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
    }
  };

  // CRUD Productos (Admin)
  const agregarProducto = async (data) => {
    try {
      await addDoc(collection(db, 'productos'), {
        ...data,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      setProductos(prev => [...prev, { ...data, id: String(Date.now()) }]);
    }
  };

  const editarProducto = async (id, dataActualizada) => {
    try {
      await updateDoc(doc(db, 'productos', id), dataActualizada);
    } catch (e) {
      setProductos(prev => prev.map(p => p.id === id ? { ...p, ...dataActualizada } : p));
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
    // Si intenta entrar al carrito o checkout siendo admin, redirigir al panel
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
      agregarProducto,
      editarProducto,
      eliminarProducto,
      navegarA
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);