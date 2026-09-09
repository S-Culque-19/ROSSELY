import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  FileSpreadsheet, 
  UploadCloud, 
  Loader2, 
  CheckCircle, 
  Trash2, 
  Clock, 
  Truck, 
  MapPin,
  MessageSquare,
  Send,
  Moon,
  Gift,
  Save,
  Sparkles,
  Trophy,
  Crown,
  Bell,
  Phone,
  CheckCheck,
  XCircle
} from 'lucide-react';

// Compresión Canvas integrada localmente para múltiples imágenes y alta eficiencia
const optimizarMultiplesImagenesCanvas = async (files, maxWidth = 1100, quality = 0.75) => {
  const promesas = Array.from(files).map((file) => {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error("Archivo inválido"));
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          let w = img.width;
          let h = img.height;
          if (w > maxWidth) {
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);

          let dataUrl = canvas.toDataURL('image/webp', quality);
          if (dataUrl.indexOf('data:image/webp') !== 0) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(dataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  });
  return Promise.all(promesas);
};

export default function AdminDashboardView() {
  const { productos, pedidos, actualizarEstadoPedido, eliminarProducto, calcularMembresiaRuleta } = useStore();
  const [tabActiva, setTabActiva] = useState('inventario'); // 'inventario' | 'pedidos' | 'balance' | 'mensajes' | 'config' | 'vip' | 'suscripciones'

  // Alarma sonora y visual en tiempo real para la administración
  const [alertaUrgente, setAlertaUrgente] = useState(false);

  // Estados del Formulario de Prendas (Múltiples imágenes)
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [costoUnitario, setCostoUnitario] = useState('');
  const [stock, setStock] = useState('12');
  const [categoria, setCategoria] = useState('Pijamas');
  const [tallas, setTallas] = useState('S, M, L');
  const [descripcion, setDescripcion] = useState('');
  const [imagenesPrendas, setImagenesPrendas] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [cargandoImgs, setCargandoImgs] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Selector temporal para Balance Contable
  const [diasFiltro, setDiasFiltro] = useState(30);

  // Estados para el Centro de Mensajería en Tiempo Real (Messenger / WhatsApp style)
  const [chats, setChats] = useState([]);
  const [chatSeleccionado, setChatSeleccionado] = useState(null);
  const [mensajesChat, setMensajesChat] = useState([]);
  const [respuestaAdmin, setRespuestaAdmin] = useState('');
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
  const scrollChatRef = useRef(null);

  // Solicitudes de suscripciones pendientes de verificación
  const [suscripcionesPendientes, setSuscripcionesPendientes] = useState([]);

  // Configuración de Experiencia Nocturna
  const [configNocturna, setConfigNocturna] = useState({
    activo: true,
    mensaje: "El confort de la seda te espera esta noche...",
    textoBoton: "+ BENEFICIO",
    codigoDescuento: "SEDA-NOCHE",
    horaInicio: 20,
    horaFin: 6
  });
  const [guardandoConfig, setGuardandoConfig] = useState(false);

  const mostrarToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Disparar Alarma Sonora (Oscilador Web Audio API)
  const emitirSonidoAlarma = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // Nota Re5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn("Audio Context restringido:", e);
    }
  };

  // 1. Cargar Configuración Nocturna desde Firestore
  useEffect(() => {
    const docRef = doc(db, 'configuracion', 'experiencia_nocturna');
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setConfigNocturna(prev => ({ ...prev, ...snap.data() }));
      }
    });
    return () => unsub();
  }, []);

  // 2. Suscripción a Chats con Alarma Instantánea
  useEffect(() => {
    const q = query(collection(db, 'chats'), orderBy('ultimaFecha', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const hayNuevos = lista.some(c => c.noLeidoPorAdmin);
      if (hayNuevos) {
        setAlertaUrgente(true);
        emitirSonidoAlarma();
      }
      setChats(lista);
      if (!chatSeleccionado && lista.length > 0) {
        setChatSeleccionado(lista[0]);
      }
    });
    return () => unsub();
  }, []);

  // 3. Suscripción a Solicitudes de Suscripción Pendientes con Alarma
  useEffect(() => {
    const q = query(collection(db, 'suscripciones_pendientes'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const pendientes = lista.some(s => s.estado === 'Por Verificar');
      if (pendientes) {
        setAlertaUrgente(true);
        emitirSonidoAlarma();
      }
      setSuscripcionesPendientes(lista);
    }, () => {});
    return () => unsub();
  }, []);

  // 4. Suscripción a mensajes del chat activo seleccionado
  useEffect(() => {
    if (!chatSeleccionado?.id) return;

    const q = query(
      collection(db, 'chats', chatSeleccionado.id, 'mensajes'),
      orderBy('timestamp', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setMensajesChat(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      scrollChatRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    updateDoc(doc(db, 'chats', chatSeleccionado.id), {
      noLeidoPorAdmin: false
    }).catch(() => {});

    return () => unsub();
  }, [chatSeleccionado?.id]);

  const handleEnviarRespuestaAdmin = async (e) => {
    e.preventDefault();
    if (!respuestaAdmin.trim() || !chatSeleccionado?.id) return;

    const texto = respuestaAdmin.trim();
    setRespuestaAdmin('');
    setEnviandoRespuesta(true);

    try {
      await addDoc(collection(db, 'chats', chatSeleccionado.id, 'mensajes'), {
        remitente: 'admin',
        texto,
        timestamp: serverTimestamp()
      });

      await updateDoc(doc(db, 'chats', chatSeleccionado.id), {
        ultimoMensaje: `Asesora: ${texto}`,
        ultimaFecha: serverTimestamp(),
        noLeidoPorAdmin: false,
        estado: 'respondido'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setEnviandoRespuesta(false);
    }
  };

  const handleVerificarSuscripcionAdmin = async (suscripcionId, userId, nuevoEstado) => {
    try {
      await updateDoc(doc(db, 'suscripciones_pendientes', suscripcionId), {
        estado: nuevoEstado
      });

      if (nuevoEstado === 'Verificado') {
        const fechaExp = new Date();
        fechaExp.setDate(fechaExp.getDate() + 30); // 30 días de vigencia

        await updateDoc(doc(db, 'usuarios', userId), {
          suscripcion: {
            tipo: 'premium',
            fechaExpiracion: fechaExp.toISOString()
          },
          puntos: 50 // Bono inicial al verificar membresía
        });
        mostrarToast("✦ Suscripción verificada y activada correctamente.");
      }
    } catch (err) {
      console.error(err);
      alert("Error al actualizar la suscripción.");
    }
  };

  const handleSeleccionarImagenesMultiples = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setCargandoImgs(true);
    try {
      const urlsOptimizadas = await optimizarMultiplesImagenesCanvas(files, 1100, 0.75);
      setImagenesPrendas(prev => [...prev, ...urlsOptimizadas]);
      mostrarToast(`✦ ${urlsOptimizadas.length} imagen(es) optimizada(s) con éxito.`);
    } catch (err) {
      console.error(err);
      alert("Error al comprimir las imágenes.");
    } finally {
      setCargandoImgs(false);
    }
  };

  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !precio || imagenesPrendas.length === 0) {
      alert("Por favor completa el nombre, precio y sube al menos una fotografía.");
      return;
    }

    setGuardando(true);
    try {
      await addDoc(collection(db, 'productos'), {
        nombre: nombre.trim(),
        precio: parseFloat(precio),
        costoUnitario: parseFloat(costoUnitario || (parseFloat(precio) * 0.4)),
        stock: parseInt(stock, 10) || 0,
        categoria,
        tallas: tallas.split(',').map(t => t.trim().toUpperCase()),
        descripcion: descripcion.trim(),
        img: imagenesPrendas[0],
        imagenes: imagenesPrendas,
        origen: 'Taller Nuevo Chimbote',
        createdAt: serverTimestamp()
      });

      mostrarToast("✦ Prenda publicada exitosamente.");
      setNombre('');
      setPrecio('');
      setCostoUnitario('');
      setStock('12');
      setDescripcion('');
      setImagenesPrendas([]);
    } catch (err) {
      console.error(err);
      alert("Error al guardar la prenda.");
    } finally {
      setGuardando(false);
    }
  };

  // Cálculos Financieros del Balance Contable
  const ahora = new Date();
  const pedidosFiltrados = pedidos.filter(p => {
    if (!p.createdAt && !p.fecha) return true;
    const fechaP = p.createdAt?.toDate ? p.createdAt.toDate() : new Date();
    const difDias = (ahora - fechaP) / (1000 * 60 * 60 * 24);
    return difDias <= diasFiltro;
  });

  const ingresosTotales = pedidosFiltrados.reduce((acc, p) => acc + (parseFloat(p.subtotal || p.total) || 0), 0);
  const costoTotalMercaderia = pedidosFiltrados.reduce((acc, p) => {
    const costoItems = (p.items || []).reduce((cAcc, item) => {
      const c = item.costoUnitario || (parseFloat(item.precio || 0) * 0.4);
      return cAcc + (c * (item.cantidad || 1));
    }, 0);
    return acc + costoItems;
  }, 0);

  const gananciaNetaReal = ingresosTotales - costoTotalMercaderia;
  const margenUtilidad = ingresosTotales > 0 ? ((gananciaNetaReal / ingresosTotales) * 100).toFixed(1) : 0;
  const unidadesVendidas = pedidosFiltrados.reduce((acc, p) => {
    return acc + (p.items || []).reduce((iAcc, it) => iAcc + (it.cantidad || 1), 0);
  }, 0);

  const exportarBalanceExcel = () => {
    const filas = [];
    pedidosFiltrados.forEach(p => {
      const fechaTxt = p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString('es-PE') : 'Reciente';
      (p.items || []).forEach(item => {
        const cU = item.costoUnitario || (parseFloat(item.precio || 0) * 0.4);
        const pV = parseFloat(item.precio || 0);
        const q = item.cantidad || 1;
        filas.push({
          "Fecha": fechaTxt,
          "ID Pedido": p.id.slice(0, 8),
          "Cliente": p.cliente?.nombre || 'Venta Web',
          "Destino": `${p.cliente?.ciudad || 'Destino'} - ${p.cliente?.tipoEntrega || 'Shalom'}`,
          "Prenda": item.name || item.nombre,
          "Cantidad": q,
          "Ingreso (S/.)": (pV * q).toFixed(2),
          "Ganancia (S/.)": ((pV - cU) * q).toFixed(2),
          "Estado": p.estado || 'Pendiente'
        });
      });
    });

    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Balance ROSSELY");
    XLSX.writeFile(libro, `Balance_ROSSELY_${diasFiltro}Dias.xlsx`);
  };

  const chatsNoLeidosCount = chats.filter(c => c.noLeidoPorAdmin).length;
  const pendientesSuscripcionCount = suscripcionesPendientes.filter(s => s.estado === 'Por Verificar').length;

  return (
    <div className="w-full min-h-screen py-8 px-6 sm:px-10 md:px-16 font-sans space-y-8 bg-[#FFF5F7]">
      
      {/* Alarma Visual y Sonora Superior para Intervención Urgente */}
      {(alertaUrgente || chatsNoLeidosCount > 0 || pendientesSuscripcionCount > 0) && (
        <div className="bg-[#701A3B] text-[#F8D7E0] border border-[#D4AF37] p-4 rounded-2xl flex items-center justify-between shadow-2xl animate-pulse">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-[#D4AF37] animate-bounce" />
            <div>
              <p className="font-bold text-xs uppercase tracking-widest">¡Alerta de Intervención Requerida!</p>
              <p className="text-[11px] text-white">Hay nuevos mensajes en vivo o comprobantes de suscripción esperando aprobación.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { setAlertaUrgente(false); setTabActiva('mensajes'); }}
              className="bg-[#D4AF37] text-stone-900 font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
            >
              Ver Mensajes ({chatsNoLeidosCount})
            </button>
            <button 
              onClick={() => { setAlertaUrgente(false); setTabActiva('suscripciones'); }}
              className="bg-white text-[#701A3B] font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
            >
              Ver Suscripciones ({pendientesSuscripcionCount})
            </button>
          </div>
        </div>
      )}

      {/* Toast Animado */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1819] text-[#F8D7E0] border border-[#701A3B] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs uppercase tracking-wider font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sello de Marca y Packaging Oficial ROSSELY */}
      <div className="bg-[#FFFBFB] border border-[#F8D7E0] p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-[#701A3B]">
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-[#701A3B] shrink-0" />
          <span className="font-serif italic font-semibold">
            Protocolo de Taller: Empaque oficial con papel seda y caja ROSSELY.
          </span>
        </div>
        <span className="text-[10px] bg-white border border-[#F8D7E0] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest text-[#A24869]">
          Nuevo Chimbote ➔ Envíos Nacionales
        </span>
      </div>

      {/* Cabecera del Panel */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#FCE4EC] pb-6">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#A24869] uppercase">Gestión Administrativa</span>
          <h1 className="font-serif text-3xl font-black text-[#701A3B] tracking-tight">Panel de Operaciones ROSSELY</h1>
        </div>

        {/* 7 Pestañas del Panel */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-[#F8D7E0] rounded-2xl shadow-xs">
          <button
            onClick={() => setTabActiva('inventario')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              tabActiva === 'inventario' ? 'bg-[#701A3B] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" /> Inventario ({productos.length})
          </button>
          
          <button
            onClick={() => setTabActiva('pedidos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              tabActiva === 'pedidos' ? 'bg-[#701A3B] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Envíos ({pedidos.length})
          </button>

          <button
            onClick={() => setTabActiva('balance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              tabActiva === 'balance' ? 'bg-[#701A3B] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Balance
          </button>

          <button
            onClick={() => setTabActiva('mensajes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 relative ${
              tabActiva === 'mensajes' ? 'bg-[#701A3B] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> 
            <span>Asesoría en Vivo</span>
            {chatsNoLeidosCount > 0 && (
              <span className="ml-1 bg-amber-400 text-stone-900 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {chatsNoLeidosCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setTabActiva('config')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              tabActiva === 'config' ? 'bg-[#701A3B] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-[#A24869]" /> Nocturno
          </button>

          <button
            onClick={() => setTabActiva('vip')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              tabActiva === 'vip' ? 'bg-[#701A3B] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> VIP & Metas
          </button>

          <button
            onClick={() => setTabActiva('suscripciones')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 relative ${
              tabActiva === 'suscripciones' ? 'bg-[#701A3B] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" /> Suscripciones
            {pendientesSuscripcionCount > 0 && (
              <span className="ml-1 bg-amber-400 text-stone-900 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendientesSuscripcionCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* PESTAÑA 1: INVENTARIO */}
      {tabActiva === 'inventario' && (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
          <form onSubmit={handleGuardarProducto} className="lg:col-span-5 bg-white p-7 rounded-3xl border border-[#FCE4EC] shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">Agregar Nueva Prenda de Seda</h3>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Nombre de la Prenda *</label>
              <input 
                type="text" 
                required 
                placeholder="Pijama Satín Afrodita"
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-[#FFFBFB] border border-[#F8D7E0] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#701A3B]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">P. Venta (S/.) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  required 
                  placeholder="180.00"
                  value={precio} 
                  onChange={(e) => setPrecio(e.target.value)}
                  className="w-full bg-[#FFFBFB] border border-[#F8D7E0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#701A3B]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Costo Unit. (S/.)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="70.00"
                  value={costoUnitario} 
                  onChange={(e) => setCostoUnitario(e.target.value)}
                  className="w-full bg-[#FFFBFB] border border-[#F8D7E0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#701A3B]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Stock</label>
                <input 
                  type="number" 
                  value={stock} 
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full bg-[#FFFBFB] border border-[#F8D7E0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#701A3B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Categoría</label>
                <select 
                  value={categoria} 
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full bg-[#FFFBFB] border border-[#F8D7E0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#701A3B]"
                >
                  <option value="Pijamas">Pijamas</option>
                  <option value="Batas">Batas</option>
                  <option value="Lencería">Lencería</option>
                  <option value="Accesorios">Accesorios</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Tallas</label>
                <input 
                  type="text" 
                  value={tallas} 
                  onChange={(e) => setTallas(e.target.value)}
                  className="w-full bg-[#FFFBFB] border border-[#F8D7E0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#701A3B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Fotografías (Soporta Múltiples) *</label>
              <label className="w-full border-2 border-dashed border-[#F8D7E0] hover:border-[#701A3B] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-[#FFFBFB] transition">
                <UploadCloud className="w-6 h-6 text-[#701A3B] mb-1" />
                <span className="text-xs text-stone-700 font-medium">Subir fotos desde PC o Celular</span>
                <input type="file" multiple accept="image/*" onChange={handleSeleccionarImagenesMultiples} className="hidden" />
              </label>

              {cargandoImgs && <p className="text-[11px] text-[#701A3B] font-bold mt-2 animate-pulse">Optimizando fotos...</p>}

              {imagenesPrendas.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {imagenesPrendas.map((imgSrc, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#F8D7E0]">
                      <img src={imgSrc} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setImagenesPrendas(imagenesPrendas.filter((_, i) => i !== idx))}
                        className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-bl cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={guardando || cargandoImgs}
              className="w-full bg-[#701A3B] hover:bg-[#56132D] text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : '✦ Publicar Prenda en Catálogo'}
            </button>
          </form>

          <div className="lg:col-span-7 bg-white p-7 rounded-3xl border border-[#FCE4EC] shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">Catálogo Actual ({productos.length})</h3>
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-2">
              {productos.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-100 bg-[#FFFBFB] hover:border-[#F8D7E0] transition">
                  <div className="flex items-center gap-3">
                    <img src={p.img} alt={p.nombre} className="w-12 h-14 rounded-lg object-cover border border-stone-200" />
                    <div>
                      <p className="font-bold text-xs text-stone-900">{p.nombre}</p>
                      <p className="text-[10px] text-stone-400">Stock: {p.stock} • Fotos: {(p.imagenes || [p.img]).length}</p>
                      <p className="text-xs font-semibold text-[#701A3B]">S/. {parseFloat(p.precio || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <button onClick={() => eliminarProducto(p.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: PEDIDOS Y BOTÓN DESPLEGABLE INTERACTIVO */}
      {tabActiva === 'pedidos' && (
        <div className="bg-white p-7 rounded-3xl border border-[#FCE4EC] shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-stone-900">Gestión de Pedidos & Envíos (Shalom / Local)</h3>
            <span className="text-xs text-stone-500 font-light flex items-center gap-1">
              <Truck className="w-4 h-4 text-[#701A3B]" /> Nuevo Chimbote ➔ Todo el Perú
            </span>
          </div>

          <div className="space-y-4">
            {pedidos.length === 0 ? (
              <p className="text-xs text-stone-400 py-10 text-center">No hay pedidos registrados.</p>
            ) : (
              pedidos.map(p => (
                <div key={p.id} className="p-5 rounded-2xl border border-[#F8D7E0] bg-[#FFFBFB] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2">
                    <div>
                      <span className="text-xs font-bold text-[#701A3B]">Pedido #{p.id.slice(0, 8)}</span>
                      <p className="text-[11px] text-stone-700 font-medium">
                        Cliente: {p.cliente?.nombre} • Tel: {p.cliente?.telefono} • Destino: {p.cliente?.ciudad} ({p.cliente?.tipoEntrega})
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-stone-900">S/. {parseFloat(p.total || 0).toFixed(2)}</span>
                      <select
                        value={p.estado || 'Pendiente de Verificación'}
                        onChange={(e) => actualizarEstadoPedido(p.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                          p.estado === 'Entregado' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-white text-stone-800 border-stone-300'
                        }`}
                      >
                        <option value="Pendiente de Verificación">Pendiente de Verificación</option>
                        <option value="Pago Verificado">Pago Verificado</option>
                        <option value="En Confección/Empaque">En Confección/Empaque</option>
                        <option value="Dejado en Shalom Chimbote">Dejado en Shalom Chimbote</option>
                        <option value="En Tránsito a Destino">En Tránsito a Destino</option>
                        <option value="Entregado">Entregado (Verde)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-between items-center gap-4 text-xs">
                    <div className="space-y-1">
                      {(p.items || []).map((it, idx) => (
                        <p key={idx} className="text-stone-700">
                          • {it.cantidad || 1}x {it.name || it.nombre} (Talla {it.tallaSeleccionada || 'M'}) — S/. {(it.precio * (it.cantidad || 1)).toFixed(2)}
                        </p>
                      ))}
                    </div>

                    {p.comprobanteImg && (
                      <a href={p.comprobanteImg} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#701A3B] underline">
                        Ver Comprobante de Pago ↗
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA 3: BALANCE CONTABLE & EXCEL */}
      {tabActiva === 'balance' && (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-[#FCE4EC] shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#701A3B]" />
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">Periodo:</span>
              <div className="flex flex-wrap gap-1.5">
                {[1, 7, 30, 90, 365].map(d => (
                  <button
                    key={d}
                    onClick={() => setDiasFiltro(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border ${
                      diasFiltro === d ? 'bg-[#701A3B] text-white border-[#701A3B]' : 'bg-[#FFFBFB] text-stone-700 border-[#F8D7E0]'
                    }`}
                  >
                    {d} Días
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={exportarBalanceExcel}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" /> Exportar a Excel
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#FCE4EC] shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase">Ingresos Brutos</span>
              <p className="text-xl font-bold text-stone-900">S/. {ingresosTotales.toFixed(2)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#FCE4EC] shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase">Costo Mercadería</span>
              <p className="text-xl font-bold text-stone-700">S/. {costoTotalMercaderia.toFixed(2)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#FCE4EC] shadow-xs space-y-1 bg-[#FDF5F7]">
              <span className="text-[10px] font-bold text-[#701A3B] uppercase">Utilidad Neta Real</span>
              <p className="text-xl font-black text-[#701A3B]">S/. {gananciaNetaReal.toFixed(2)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#FCE4EC] shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase">Prendas Vendidas</span>
              <p className="text-xl font-bold text-stone-900">{unidadesVendidas}</p>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 4: CHAT EN TIEMPO REAL (MESSENGER / WHATSAPP STYLE) */}
      {tabActiva === 'mensajes' && (
        <div className="bg-white rounded-3xl border border-[#FCE4EC] shadow-sm overflow-hidden h-[620px] grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-4 border-r border-[#FCE4EC] flex flex-col h-full bg-[#FFFBFB]">
            <div className="p-4 border-b border-[#FCE4EC] bg-white flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-stone-900">Bandeja de Asesoría</h3>
              <span className="bg-[#FDF5F7] text-[#701A3B] border border-[#F8D7E0] text-[10px] font-bold px-2 py-0.5 rounded-full">
                {chats.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
              {chats.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setChatSeleccionado(c)}
                  className={`p-4 cursor-pointer transition flex items-start gap-3 ${
                    chatSeleccionado?.id === c.id ? 'bg-[#FDF5F7] border-l-4 border-[#701A3B]' : 'hover:bg-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#FCE4EC] text-[#701A3B] flex items-center justify-center font-bold text-sm">
                    {c.clienteNombre?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-stone-900 truncate">{c.clienteNombre}</p>
                      {c.noLeidoPorAdmin && <span className="w-2 h-2 rounded-full bg-[#701A3B]" />}
                    </div>
                    <p className="text-[11px] text-stone-500 truncate">{c.ultimoMensaje || 'Nuevo mensaje'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-8 flex flex-col h-full bg-[#FCFBFB]">
            {chatSeleccionado ? (
              <>
                <div className="p-4 bg-white border-b border-[#FCE4EC] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{chatSeleccionado.clienteNombre}</h4>
                    <p className="text-[10px] text-[#A24869]">{chatSeleccionado.clienteEmail}</p>
                  </div>
                </div>

                <div className="flex-1 p-5 overflow-y-auto space-y-3">
                  {mensajesChat.map((m) => {
                    const esAdmin = m.remitente === 'admin';
                    return (
                      <div key={m.id} className={`flex flex-col ${esAdmin ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                          esAdmin ? 'bg-[#701A3B] text-white rounded-br-xs' : 'bg-white text-stone-800 border border-[#F8D7E0] rounded-bl-xs'
                        }`}>
                          {m.texto}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={scrollChatRef} />
                </div>

                <form onSubmit={handleEnviarRespuestaAdmin} className="p-3.5 bg-white border-t border-[#FCE4EC] flex gap-2">
                  <input
                    type="text"
                    value={respuestaAdmin}
                    onChange={(e) => setRespuestaAdmin(e.target.value)}
                    placeholder="Escribe una respuesta inmediata..."
                    className="flex-1 bg-[#FFFBFB] border border-[#F8D7E0] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#701A3B]"
                  />
                  <button type="submit" disabled={!respuestaAdmin.trim()} className="bg-[#701A3B] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer">
                    <Send className="w-3.5 h-3.5" /> Enviar
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-stone-400 text-xs">
                Selecciona una conversación para responder al instante.
              </div>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA 5: CONFIGURACIÓN NOCTURNA */}
      {tabActiva === 'config' && (
        <div className="bg-white p-8 rounded-3xl border border-[#FCE4EC] shadow-xs max-w-2xl space-y-6">
          <h3 className="font-serif text-lg font-bold text-stone-900">Control de Experiencia Nocturna</h3>
          <form onSubmit={async (e) => {
            e.preventDefault();
            setGuardandoConfig(true);
            await setDoc(doc(db, 'configuracion', 'experiencia_nocturna'), configNocturna, { merge: true });
            setGuardandoConfig(false);
            mostrarToast("✦ Configuración nocturna guardada.");
          }} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold mb-1">Mensaje Nocturno</label>
              <input type="text" value={configNocturna.mensaje} onChange={(ev)=>setConfigNocturna({...configNocturna, mensaje: ev.target.value})} className="w-full bg-[#FFFBFB] border border-[#F8D7E0] rounded-xl p-3" />
            </div>
            <button type="submit" disabled={guardandoConfig} className="bg-[#701A3B] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider cursor-pointer">
              Guardar Configuración
            </button>
          </form>
        </div>
      )}

      {/* PESTAÑA 6: CLIENTES VIP & METAS */}
      {tabActiva === 'vip' && (() => {
        const resumenClientes = {};
        pedidos.forEach(p => {
          const email = p.cliente?.email || p.cliente?.correo || 'visitante@rossely.pe';
          const nombre = p.cliente?.nombre || 'Cliente ROSSELY';
          const totalPedido = parseFloat(p.subtotal || p.total) || 0;

          if (!resumenClientes[email]) {
            resumenClientes[email] = {
              nombre,
              email,
              telefono: p.cliente?.telefono || 'No registrado',
              ciudad: p.cliente?.ciudad || 'Destino',
              gastoTotal: 0,
              pedidosCliente: []
            };
          }
          resumenClientes[email].gastoTotal += totalPedido;
          resumenClientes[email].pedidosCliente.push(p);
        });

        const listaVIP = Object.values(resumenClientes).map(c => {
          const membresia = calcularMembresiaRuleta(c.pedidosCliente);
          return { ...c, ...membresia };
        }).sort((a, b) => b.gastoTotal - a.gastoTotal);

        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#FCE4EC] shadow-xs">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">Métricas de Consumo y Niveles (VIP / Golden)</h3>
                <p className="text-xs text-stone-500 font-light">
                  Control semanal automático (VIP: S/. 500 - S/. 999 | Golden: S/. 1,000 a más).
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#FCE4EC] shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF5F7] border-b border-[#F8D7E0] text-[#701A3B] uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Clienta</th>
                    <th className="py-4 px-4">Destino</th>
                    <th className="py-4 px-4">Gasto Total</th>
                    <th className="py-4 px-4">Estatus Ruleta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {listaVIP.length === 0 ? (
                    <tr><td colSpan="4" className="py-8 text-center text-stone-400">Sin consumos tabulados.</td></tr>
                  ) : (
                    listaVIP.map((c, i) => (
                      <tr key={i} className="hover:bg-[#FFFBFB] transition">
                        <td className="py-4 px-6 font-bold">{c.nombre} <span className="block text-[10px] text-stone-400">{c.email}</span></td>
                        <td className="py-4 px-4">{c.ciudad}</td>
                        <td className="py-4 px-4 font-bold">S/. {c.gastoTotal.toFixed(2)}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${c.nivel === 'Gold VIP' ? 'bg-[#1C1819] text-[#D4AF37]' : 'bg-[#FDF5F7] text-[#701A3B]'}`}>
                            {c.nivel}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* PESTAÑA 7: VALIDACIÓN DE SUSCRIPCIONES (S/. 60) */}
      {tabActiva === 'suscripciones' && (
        <div className="bg-white p-8 rounded-3xl border border-[#FCE4EC] shadow-xs space-y-6">
          <h3 className="font-serif text-lg font-bold text-stone-900">Validación de Pagos de Suscripción (S/. 60.00)</h3>
          <div className="space-y-4">
            {suscripcionesPendientes.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">No hay solicitudes de suscripción pendientes.</p>
            ) : (
              suscripcionesPendientes.map(sub => (
                <div key={sub.id} className="p-4 rounded-2xl border border-[#F8D7E0] bg-[#FFFBFB] flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div>
                    <p className="font-bold text-[#701A3B]">{sub.nombre} ({sub.email})</p>
                    <p className="text-stone-600">Nº de Operación Yape/Plin: <strong className="font-mono">{sub.numeroOperacion}</strong></p>
                    <p className="text-[10px] text-stone-400">Monto: S/. {sub.monto.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full font-bold text-[10px] ${sub.estado === 'Verificado' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {sub.estado === 'Verificado' ? '✓ Verificado (Check Verde)' : '✕ Por Verificar (X Roja)'}
                    </span>
                    <button
                      onClick={() => handleVerificarSuscripcionAdmin(sub.id, sub.uid, sub.estado === 'Verificado' ? 'Por Verificar' : 'Verificado')}
                      className="bg-[#701A3B] text-white px-4 py-2 rounded-xl font-bold uppercase tracking-wider cursor-pointer"
                    >
                      {sub.estado === 'Verificado' ? 'Cambiar a Pendiente' : 'Aprobar y Verificar'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}