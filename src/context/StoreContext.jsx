import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
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
  orderBy,
  getDocs,
  where
} from 'firebase/firestore';

const StoreContext = createContext();

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

  const [usuarioActual, setUsuarioActual] = useState(() => {
    try {
      const saved = localStorage.getItem('rossely_sesion');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [carrito, setCarrito] = useState(() => {
    try {
      const saved = localStorage.getItem('rossely_carrito');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentView, setCurrentView] = useState(() => {
    try {
      const saved = localStorage.getItem('rossely_sesion');
      if (saved) {
        const u = JSON.parse(saved);
        if (u?.role === 'admin') return 'admin';
      }
    } catch {}
    return 'home';
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const esAdmin = usuarioActual?.role === 'admin';

  // Sincronización de avisos gerenciales para los clientes
  useEffect(() => {
    try {
      const colRef = collection(db, 'avisos_gerenciales');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snapshot) => {
        setAvisosGlobales(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }, () => {});
      return () => unsub();
    } catch (e) {
      console.warn("Avisos offline:", e);
    }
  }, []);

  // Sincronización de colecciones
  useEffect(() => {
    try {
      const colRef = collection(db, 'colecciones');
      const unsub = onSnapshot(colRef, (snapshot) => {
        if (!snapshot.empty) {
          setColecciones(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      }, () => {});
      return () => unsub();
    } catch (e) {}
  }, []);

  // Sincronización de productos
  useEffect(() => {
    try {
      const colRef = collection(db, 'productos');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snapshot) => {
        setProductos(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        setCargandoProductos(false);
      }, () => {
        const unsubFallback = onSnapshot(colRef, (snapshot) => {
          setProductos(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
          setCargandoProductos(false);
        });
        return () => unsubFallback();
      });
      return () => unsub();
    } catch (e) {
      setCargandoProductos(false);
    }
  }, []);

  // Sincronización de pedidos
  useEffect(() => {
    try {
      const colRef = collection(db, 'pedidos');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snapshot) => {
        setPedidos(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }, () => {});
      return () => unsub();
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (usuarioActual) {
      localStorage.setItem('rossely_sesion', JSON.stringify(usuarioActual));
    } else {
      localStorage.removeItem('rossely_sesion');
    }
  }, [usuarioActual]);

  const iniciarSesion = async (email, password) => {
    const correo = email.trim().toLowerCase();
    if (correo === 'carmen@eshda.org.com' && password === 'prins2026') {
      const adminData = { uid: 'admin_rossely_carmen', email: correo, nombre: 'Carmen Estrada (Dirección)', role: 'admin' };
      setUsuarioActual(adminData);
      setCurrentView('admin');
      return { success: true, role: 'admin' };
    }

    try {
      const q = query(collection(db, 'usuarios'), where('email', '==', correo));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return { success: false, error: 'No existe cuenta registrada con este correo.' };
      }

      let clienteEncontrado = null;
      querySnapshot.forEach((d) => { clienteEncontrado = { id: d.id, ...d.data() }; });

      if (clienteEncontrado.password !== password) return { success: false, error: 'Contraseña incorrecta.' };

      if (clienteEncontrado.puntos === undefined) clienteEncontrado.puntos = 0;
      if (!clienteEncontrado.suscripcion) clienteEncontrado.suscripcion = { tipo: 'free' };

      setUsuarioActual(clienteEncontrado);
      setCurrentView('home');
      return { success: true, role: 'user' };
    } catch (error) {
      return { success: false, error: 'Error al iniciar sesión: ' + error.message };
    }
  };

  const registrarUsuario = async (nombre, email, password) => {
    const correo = email.trim().toLowerCase();
    try {
      const q = query(collection(db, 'usuarios'), where('email', '==', correo));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) return { success: false, error: 'Este correo ya está registrado.' };

      const nuevoIdUser = 'user_' + Date.now();
      const nuevoCliente = { 
        uid: nuevoIdUser, 
        email: correo, 
        password,
        nombre, 
        role: 'user',
        puntos: 0,
        suscripcion: { tipo: 'free' },
        fechaRegistro: new Date().toISOString()
      };

      await setDoc(doc(db, 'usuarios', nuevoIdUser), nuevoCliente);
      setUsuarioActual(nuevoCliente);
      setCurrentView('home');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error en registro: ' + error.message };
    }
  };

  const cerrarSesion = async () => {
    setUsuarioActual(null);
    setCarrito([]);
    localStorage.removeItem('rossely_sesion');
    localStorage.removeItem('rossely_carrito');
    setCurrentView('home');
  };

  const agregarAlCarrito = (producto, talla = 'M') => {
    if (!usuarioActual) {
      alert("Debe iniciar sesión o registrarse para realizar compras en el Atelier.");
      setCurrentView('auth');
      return;
    }
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
      nuevo = [...carrito, { ...producto, cartItemId: Date.now() + Math.random(), tallaSeleccionada: talla, cantidad: 1 }];
    }
    setCarrito(nuevo);
    localStorage.setItem('rossely_carrito', JSON.stringify(nuevo));
    setCurrentView('cart');
  };

  const removerDelCarrito = (cartItemId) => {
    const nuevo = carrito.filter(i => i.cartItemId !== cartItemId);
    setCarrito(nuevo);
    localStorage.setItem('rossely_carrito', JSON.stringify(nuevo));
  };

  const calcularMembresiaRuleta = (pedidosCliente) => {
    const gasto = pedidosCliente.reduce((acc, p) => acc + (parseFloat(p.subtotal || p.total) || 0), 0);
    if (gasto >= 1000) return { nivel: 'Gold VIP', ruleta: 'Ruleta de Oro (Premios Exclusivos)' };
    if (gasto >= 500) return { nivel: 'VIP', ruleta: 'Ruleta Estándar (Premios de Seda)' };
    return { nivel: 'Regular', ruleta: 'Sin Ruleta Activa' };
  };

  const registrarPedidoConPuntos = async () => {
    const totalSoles = carrito.reduce((acc, it) => acc + (parseFloat(it.precio) || 0) * (it.cantidad || 1), 0);
    const puntosNecesarios = Math.ceil(totalSoles * 8);

    if ((usuarioActual?.puntos || 0) < puntosNecesarios) {
      alert(`Puntos insuficientes. Necesitas ${puntosNecesarios} puntos (Equivalente a S/. ${totalSoles.toFixed(2)}).`);
      return null;
    }

    const nuevosPuntos = usuarioActual.puntos - puntosNecesarios;
    const nuevoPedido = {
      cliente: {
        nombre: usuarioActual.nombre,
        email: usuarioActual.email,
        telefono: usuarioActual.telefono || 'Registrado en App',
        ciudad: 'Nuevo Chimbote / Retiro',
        tipoEnvio: 'Pago con Divisa Puntos Premium'
      },
      items: carrito,
      subtotal: totalSoles,
      envio: 0.00,
      total: totalSoles,
      puntosUtilizados: puntosNecesarios,
      estado: "Verificado",
      despacho: "Despacho prioritario Club de Seda ROSSELY",
      fecha: new Date().toLocaleDateString('es-PE') + ' ' + new Date().toLocaleTimeString('es-PE'),
      createdAt: serverTimestamp()
    };

    const userRef = doc(db, 'usuarios', usuarioActual.uid || usuarioActual.id);
    await updateDoc(userRef, { puntos: nuevosPuntos });
    setUsuarioActual({ ...usuarioActual, puntos: nuevosPuntos });

    const docRef = await addDoc(collection(db, 'pedidos'), nuevoPedido);
    setCarrito([]);
    localStorage.removeItem('rossely_carrito');
    return docRef.id;
  };

  const registrarPedido = async (datosEnvio, comprobanteBase64 = null) => {
    const subtotal = carrito.reduce((acc, it) => acc + (parseFloat(it.precio) || 0) * (it.cantidad || 1), 0);
    const costoEnvio = parseFloat(datosEnvio.costoEnvio || 0);
    const total = subtotal + costoEnvio;

    const nuevoPedido = {
      cliente: datosEnvio,
      items: carrito,
      subtotal,
      envio: costoEnvio,
      total,
      estado: "Pendiente de Verificación",
      comprobanteImg: comprobanteBase64,
      despacho: "Agencia Shalom desde Nuevo Chimbote",
      fecha: new Date().toLocaleDateString('es-PE') + ' ' + new Date().toLocaleTimeString('es-PE'),
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'pedidos'), nuevoPedido);
    setCarrito([]);
    localStorage.removeItem('rossely_carrito');
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

  const editarProducto = async (id, datosActualizados) => {
    try {
      await updateDoc(doc(db, 'productos', id), datosActualizados);
      setProductos(prev => prev.map(p => p.id === id ? { ...p, ...datosActualizados } : p));
    } catch (e) {}
  };

  const agregarColeccionDinamica = async (nombreColeccion) => {
    try {
      const docRef = await addDoc(collection(db, 'colecciones'), { nombre: nombreColeccion, createdAt: serverTimestamp() });
      setColecciones(prev => [...prev, { id: docRef.id, nombre: nombreColeccion }]);
    } catch {
      setColecciones(prev => [...prev, { id: 'col_' + Date.now(), nombre: nombreColeccion }]);
    }
  };

  const navegarA = useCallback((vista, producto = null) => {
    if (producto) setSelectedProduct(producto);
    setCurrentView(vista);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <StoreContext.Provider value={{
      productos,
      colecciones,
      avisosGlobales,
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
      registrarPedido,
      registrarPedidoConPuntos,
      actualizarEstadoPedido,
      eliminarProducto,
      editarProducto,
      agregarColeccionDinamica,
      calcularMembresiaRuleta,
      navegarA
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);