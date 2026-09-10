import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { subirFotoProducto } from '../services/storageService';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  FileSpreadsheet, 
  UploadCloud, 
  Loader2, 
  Trash2, 
  Clock, 
  Truck, 
  MessageSquare,
  Send,
  Moon,
  Gift,
  Trophy,
  Crown,
  Bell
} from 'lucide-react';

export default function AdminDashboardView() {
  const { productos, pedidos, actualizarEstadoPedido, eliminarProducto } = useStore();
  const [tabActiva, setTabActiva] = useState('inventario');

  const [alertaUrgente, setAlertaUrgente] = useState(false);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [costoUnitario, setCostoUnitario] = useState('');
  const [stock, setStock] = useState('12');
  const [categoria, setCategoria] = useState('Pijamas');
  const [tallas, setTallas] = useState('S, M, L');
  const [descripcion, setDescripcion] = useState('');
  const [archivosImagenes, setArchivosImagenes] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [diasFiltro, setDiasFiltro] = useState(30);

  const [chats, setChats] = useState([]);
  const [chatSeleccionado, setChatSeleccionado] = useState(null);
  const [mensajesChat, setMensajesChat] = useState([]);
  const [respuestaAdmin, setRespuestaAdmin] = useState('');
  const scrollChatRef = useRef(null);

  const [suscripcionesPendientes, setSuscripcionesPendientes] = useState([]);

  const mostrarToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const emitirSonidoAlarma = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio Context restringido:", e);
    }
  };

  // Alarma en tiempo real para chats y suscripciones
  useEffect(() => {
    const q = query(collection(db, 'chats'), orderBy('ultimaFecha', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (lista.some(c => c.noLeidoPorAdmin)) {
        setAlertaUrgente(true);
        emitirSonidoAlarma();
      }
      setChats(lista);
      if (!chatSeleccionado && lista.length > 0) setChatSeleccionado(lista[0]);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'suscripciones_pendientes'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (lista.some(s => s.estado === 'Por Verificar')) {
        setAlertaUrgente(true);
        emitirSonidoAlarma();
      }
      setSuscripcionesPendientes(lista);
    }, () => {});
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!chatSeleccionado?.id) return;
    const q = query(collection(db, 'chats', chatSeleccionado.id, 'mensajes'), orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setMensajesChat(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      scrollChatRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
    updateDoc(doc(db, 'chats', chatSeleccionado.id), { noLeidoPorAdmin: false }).catch(() => {});
    return () => unsub();
  }, [chatSeleccionado?.id]);

  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !precio || archivosImagenes.length === 0) {
      alert("Por favor completa nombre, precio y selecciona al menos una foto.");
      return;
    }

    setGuardando(true);
    try {
      const urlsSubidas = [];
      for (const file of archivosImagenes) {
        const url = await subirFotoProducto(file);
        if (url) urlsSubidas.push(url);
      }

      await addDoc(collection(db, 'productos'), {
        nombre: nombre.trim(),
        precio: parseFloat(precio),
        costoUnitario: parseFloat(costoUnitario || (parseFloat(precio) * 0.4)),
        stock: parseInt(stock, 10) || 0,
        categoria,
        tallas: tallas.split(',').map(t => t.trim().toUpperCase()),
        descripcion: descripcion.trim(),
        img: urlsSubidas[0],
        imagenes: urlsSubidas,
        origen: 'Taller Nuevo Chimbote',
        createdAt: serverTimestamp()
      });

      mostrarToast("✦ Prenda publicada exitosamente.");
      setNombre(''); setPrecio(''); setCostoUnitario(''); setStock('12'); setDescripcion(''); setArchivosImagenes([]);
    } catch (err) {
      console.error(err);
      alert("Error al guardar la prenda en Firestore.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEnviarRespuestaAdmin = async (e) => {
    e.preventDefault();
    if (!respuestaAdmin.trim() || !chatSeleccionado?.id) return;
    const texto = respuestaAdmin.trim();
    setRespuestaAdmin('');

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
    }
  };

  const handleVerificarSuscripcion = async (subId, userId, nuevoEstado) => {
    try {
      await updateDoc(doc(db, 'suscripciones_pendientes', subId), { estado: nuevoEstado });
      if (nuevoEstado === 'Verificado') {
        const fechaExp = new Date();
        fechaExp.setDate(fechaExp.getDate() + 30);
        await updateDoc(doc(db, 'usuarios', userId), {
          suscripcion: { tipo: 'premium', fechaExpiracion: fechaExp.toISOString() },
          puntos: 100
        });
        mostrarToast("✦ Suscripción aprobada. Estatus cambiado a Verificado (Check Verde).");
      }
    } catch (err) {
      console.error(err);
      alert("Error al actualizar la suscripción.");
    }
  };

  // Filtrado de pedidos según los 15 rangos temporales
  const ahora = new Date();
  const pedidosFiltrados = pedidos.filter(p => {
    if (!p.createdAt && !p.fecha) return true;
    const fechaP = p.createdAt?.toDate ? p.createdAt.toDate() : new Date();
    const difDias = (ahora - fechaP) / (1000 * 60 * 60 * 24);
    if (diasFiltro === 9999) return true;
    return difDias <= diasFiltro;
  });

  const ingresosTotales = pedidosFiltrados.reduce((acc, p) => acc + (parseFloat(p.subtotal || p.total) || 0), 0);
  const costoTotalMercaderia = pedidosFiltrados.reduce((acc, p) => {
    return acc + (p.items || []).reduce((cAcc, item) => cAcc + ((item.costoUnitario || item.precio * 0.4) * (item.cantidad || 1)), 0);
  }, 0);
  const gananciaNetaReal = ingresosTotales - costoTotalMercaderia;
  const unidadesVendidas = pedidosFiltrados.reduce((acc, p) => acc + (p.items || []).reduce((iAcc, it) => iAcc + (it.cantidad || 1), 0), 0);

  // Motor ExcelJS con los 15 rangos y estructura contable multinacional
  const exportarBalanceExcelJS = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Atelier ROSSELY';
    const worksheet = workbook.addWorksheet('Balance Financiero');
    worksheet.views = [{ showGridLines: true }];

    worksheet.mergeCells('A1:K1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'ATELIER ROSSELY — BALANCE FINANCIERO Y CONTROL DE OPERACIONES';
    titleCell.font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF701A3B' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 40;

    worksheet.mergeCells('A2:K2');
    const subCell = worksheet.getCell('A2');
    subCell.value = `Período Auditado: Últimos ${diasFiltro === 9999 ? 'Histórico Total' : diasFiltro + ' Días'} | Emisión: ${new Date().toLocaleString('es-PE')} | Sede: Taller Nuevo Chimbote`;
    subCell.font = { name: 'Arial', size: 9.5, italic: true, color: { argb: 'FF334155' } };
    subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    subCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(2).height = 22;

    const headers = ['N° PEDIDO', 'FECHA / HORA', 'CLIENTE', 'CORREO', 'DESTINO / AGENCIA', 'DETALLE DE PRENDAS', 'CANT.', 'TOTAL VENTA (S/)', 'COSTO TALLER (S/)', 'UTILIDAD NETA (S/)', 'ESTADO'];
    const headerRow = worksheet.getRow(4);
    headerRow.values = headers;
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF701A3B' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    let rowIndex = 5;
    pedidosFiltrados.forEach(p => {
      const fechaTxt = p.createdAt?.toDate ? p.createdAt.toDate().toLocaleString('es-PE') : 'Reciente';
      (p.items || []).forEach(item => {
        const pV = parseFloat(item.precio || 0);
        const cU = item.costoUnitario || pV * 0.4;
        const q = item.cantidad || 1;
        const row = worksheet.getRow(rowIndex);
        row.values = [p.id.slice(0, 8), fechaTxt, p.cliente?.nombre || 'Cliente', p.cliente?.email || 'Sin correo', p.cliente?.ciudad || 'Chimbote', `${item.name || item.nombre} (Talla ${item.tallaSeleccionada || 'M'})`, q, pV * q, cU * q, { formula: `H${rowIndex}-I${rowIndex}` }, p.estado || 'Pendiente'];
        row.height = 20;
        
        row.eachCell((cell, colNumber) => {
          cell.font = { name: 'Arial', size: 9.5 };
          if (colNumber === 7) cell.numFmt = '#,##0';
          if (colNumber >= 8 && colNumber <= 10) cell.numFmt = '"S/ "#,##0.00;[Red]-"S/ "#,##0.00;"S/ "0.00';
        });
        rowIndex++;
      });
    });

    worksheet.columns = [{ width: 15 }, { width: 18 }, { width: 20 }, { width: 24 }, { width: 26 }, { width: 38 }, { width: 10 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 14 }];
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Balance_ROSSELY_${Date.now()}.xlsx`);
    mostrarToast("✦ Reporte Excel gerencial descargado con éxito.");
  };

  const chatsNoLeidosCount = chats.filter(c => c.noLeidoPorAdmin).length;
  const pendientesSuscripcionCount = suscripcionesPendientes.filter(s => s.estado === 'Por Verificar').length;

  return (
    <div className="w-full min-h-screen py-8 px-6 sm:px-10 md:px-16 font-sans space-y-8 bg-[#FFF5F7]">
      {alertaUrgente && (
        <div className="bg-[#701A3B] text-[#F8D7E0] border border-[#D4AF37] p-4 rounded-2xl flex items-center justify-between shadow-2xl animate-pulse">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-[#D4AF37]" />
            <p className="font-bold text-xs uppercase tracking-widest">¡Alerta de Intervención! Mensajes o suscripciones pendientes.</p>
          </div>
          <button onClick={() => setTabActiva('mensajes')} className="bg-[#D4AF37] text-stone-900 font-bold px-4 py-2 rounded-xl text-xs uppercase">Ver Alertas</button>
        </div>
      )}

      {toastMsg && <div className="fixed bottom-6 right-6 z-50 bg-[#1C1819] text-[#F8D7E0] p-4 rounded-2xl shadow-xl text-xs font-bold">{toastMsg}</div>}

      <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-[#F8D7E0] rounded-2xl shadow-xs">
        <button onClick={() => setTabActiva('inventario')} className={`px-4 py-2 rounded-xl text-xs font-bold ${tabActiva === 'inventario' ? 'bg-[#701A3B] text-white' : 'text-stone-600'}`}>Inventario</button>
        <button onClick={() => setTabActiva('pedidos')} className={`px-4 py-2 rounded-xl text-xs font-bold ${tabActiva === 'pedidos' ? 'bg-[#701A3B] text-white' : 'text-stone-600'}`}>Envíos ({pedidos.length})</button>
        <button onClick={() => setTabActiva('balance')} className={`px-4 py-2 rounded-xl text-xs font-bold ${tabActiva === 'balance' ? 'bg-[#701A3B] text-white' : 'text-stone-600'}`}>Balance</button>
        <button onClick={() => setTabActiva('mensajes')} className={`px-4 py-2 rounded-xl text-xs font-bold ${tabActiva === 'mensajes' ? 'bg-[#701A3B] text-white' : 'text-stone-600'}`}>Asesoría ({chatsNoLeidosCount})</button>
        <button onClick={() => setTabActiva('suscripciones')} className={`px-4 py-2 rounded-xl text-xs font-bold ${tabActiva === 'suscripciones' ? 'bg-[#701A3B] text-white' : 'text-stone-600'}`}>Suscripciones ({pendientesSuscripcionCount})</button>
      </div>

      {tabActiva === 'inventario' && (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
          <form onSubmit={handleGuardarProducto} className="lg:col-span-5 bg-white p-7 rounded-3xl border border-[#FCE4EC] space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">Agregar Nueva Prenda (Firebase Storage)</h3>
            <input type="text" required placeholder="Nombre de la prenda" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-[#FFFBFB] border border-[#F8D7E0] rounded-xl px-4 py-2.5 text-xs outline-none" />
            <div className="grid grid-cols-3 gap-3">
              <input type="number" step="0.01" required placeholder="P. Venta" value={precio} onChange={e => setPrecio(e.target.value)} className="bg-[#FFFBFB] border border-[#F8D7E0] rounded-xl px-3 py-2 text-xs outline-none" />
              <input type="number" step="0.01" placeholder="Costo" value={costoUnitario} onChange={e => setCostoUnitario(e.target.value)} className="bg-[#FFFBFB] border border-[#F8D7E0] rounded-xl px-3 py-2 text-xs outline-none" />
              <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="bg-[#FFFBFB] border border-[#F8D7E0] rounded-xl px-3 py-2 text-xs outline-none" />
            </div>
            <label className="w-full border-2 border-dashed border-[#F8D7E0] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-[#FFFBFB]">
              <UploadCloud className="w-6 h-6 text-[#701A3B] mb-1" />
              <span className="text-xs text-stone-700 font-medium">Subir fotos (Sin límite de tamaño)</span>
              <input type="file" multiple accept="image/*" onChange={e => setArchivosImagenes(Array.from(e.target.files))} className="hidden" />
            </label>
            {archivosImagenes.length > 0 && <p className="text-xs text-[#701A3B] font-bold">{archivosImagenes.length} archivo(s) listo(s).</p>}
            <button type="submit" disabled={guardando} className="w-full bg-[#701A3B] text-white py-3.5 rounded-xl font-bold uppercase text-xs">
              {guardando ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Publicar Prenda'}
            </button>
          </form>

          <div className="lg:col-span-7 bg-white p-7 rounded-3xl border border-[#FCE4EC] space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">Catálogo Actual ({productos.length})</h3>
            <div className="space-y-3 max-h-[580px] overflow-y-auto">
              {productos.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-100 bg-[#FFFBFB]">
                  <div className="flex items-center gap-3">
                    <img src={p.img} alt={p.nombre} className="w-12 h-14 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold text-xs">{p.nombre}</p>
                      <p className="text-xs font-semibold text-[#701A3B]">S/. {parseFloat(p.precio || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <button onClick={() => eliminarProducto(p.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tabActiva === 'pedidos' && (
        <div className="bg-white p-7 rounded-3xl border border-[#FCE4EC] space-y-4">
          <h3 className="font-serif text-lg font-bold">Gestión de Envíos & Estados</h3>
          <div className="space-y-4">
            {pedidos.map(p => (
              <div key={p.id} className="p-4 rounded-2xl border border-[#F8D7E0] bg-[#FFFBFB] flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-[#701A3B]">Pedido #{p.id.slice(0, 8)} — {p.cliente?.nombre}</p>
                  <p className="text-stone-500">Destino: {p.cliente?.ciudad} | Total: S/. {parseFloat(p.total).toFixed(2)}</p>
                </div>
                <select
                  value={p.estado}
                  onChange={(e) => actualizarEstadoPedido(p.id, e.target.value)}
                  className={`font-bold px-3 py-1.5 rounded-xl border ${p.estado === 'Entregado' ? 'bg-emerald-100 text-emerald-800' : 'bg-white'}`}
                >
                  <option value="Pendiente de Verificación">Pendiente de Verificación</option>
                  <option value="Pago Verificado">Pago Verificado</option>
                  <option value="En Confección/Empaque">En Confección/Empaque</option>
                  <option value="Dejado en Shalom Chimbote">Dejado en Shalom Chimbote</option>
                  <option value="En Tránsito a Destino">En Tránsito a Destino</option>
                  <option value="Entregado">Entregado (Verde)</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {tabActiva === 'balance' && (
        <div className="space-y-6 bg-white p-8 rounded-3xl border border-[#FCE4EC]">
          <div className="flex flex-wrap gap-2 pb-4 border-b">
            {[1, 7, 14, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 365, 9999].map(d => (
              <button key={d} onClick={() => setDiasFiltro(d)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${diasFiltro === d ? 'bg-[#701A3B] text-white' : 'bg-stone-100'}`}>
                {d === 9999 ? 'Histórico Total' : `${d} Días`}
              </button>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold">Balance Financiero Gerencial</h3>
            <button onClick={exportarBalanceExcelJS} className="bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" /> Exportar a Excel (.xlsx)
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-stone-50 rounded-xl">Ingresos: <b>S/. {ingresosTotales.toFixed(2)}</b></div>
            <div className="p-4 bg-stone-50 rounded-xl">Costos: <b>S/. {costoTotalMercaderia.toFixed(2)}</b></div>
            <div className="p-4 bg-pink-50 rounded-xl text-[#701A3B]">Utilidad Neta: <b>S/. {gananciaNetaReal.toFixed(2)}</b></div>
            <div className="p-4 bg-stone-50 rounded-xl">Unidades: <b>{unidadesVendidas}</b></div>
          </div>
        </div>
      )}

      {tabActiva === 'suscripciones' && (
        <div className="bg-white p-8 rounded-3xl border border-[#FCE4EC] space-y-4">
          <h3 className="font-serif text-lg font-bold">Validación de Suscripciones (S/. 60)</h3>
          {suscripcionesPendientes.map(sub => (
            <div key={sub.id} className="p-4 rounded-2xl border border-[#F8D7E0] bg-[#FFFBFB] flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-[#701A3B]">{sub.nombre} ({sub.email})</p>
                <p className="text-stone-600">Nº Operación: <strong className="font-mono">{sub.numeroOperacion}</strong></p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full font-bold text-[10px] ${sub.estado === 'Verificado' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {sub.estado === 'Verificado' ? '✓ Verificado (Check Verde)' : '✕ Por Verificar (X Roja)'}
                </span>
                <button onClick={() => handleVerificarSuscripcion(sub.id, sub.uid, sub.estado === 'Verificado' ? 'Por Verificar' : 'Verificado')} className="bg-[#701A3B] text-white px-4 py-2 rounded-xl font-bold uppercase">
                  {sub.estado === 'Verificado' ? 'Marcar Pendiente' : 'Aprobar y Verificar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tabActiva === 'mensajes' && (
        <div className="bg-white rounded-3xl border border-[#FCE4EC] h-[600px] grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          <div className="md:col-span-4 border-r border-[#FCE4EC] overflow-y-auto divide-y">
            {chats.map(c => (
              <div key={c.id} onClick={() => setChatSeleccionado(c)} className={`p-4 cursor-pointer ${chatSeleccionado?.id === c.id ? 'bg-[#FDF5F7]' : ''}`}>
                <p className="font-bold text-xs">{c.clienteNombre}</p>
                <p className="text-[11px] text-stone-500 truncate">{c.ultimoMensaje}</p>
              </div>
            ))}
          </div>
          <div className="md:col-span-8 flex flex-col h-full bg-[#FCFBFB]">
            {chatSeleccionado ? (
              <>
                <div className="p-4 bg-white border-b text-xs font-bold">{chatSeleccionado.clienteNombre}</div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {mensajesChat.map(m => (
                    <div key={m.id} className={`flex flex-col ${m.remitente === 'admin' ? 'items-end' : 'items-start'}`}>
                      <div className={`p-3 rounded-2xl text-xs max-w-[75%] ${m.remitente === 'admin' ? 'bg-[#701A3B] text-white' : 'bg-white border'}`}>{m.texto}</div>
                    </div>
                  ))}
                  <div ref={scrollChatRef} />
                </div>
                <form onSubmit={handleEnviarRespuestaAdmin} className="p-3 bg-white border-t flex gap-2">
                  <input type="text" value={respuestaAdmin} onChange={e => setRespuestaAdmin(e.target.value)} placeholder="Escribe tu respuesta..." className="flex-1 bg-[#FFFBFB] border rounded-xl px-3 py-2 text-xs outline-none" />
                  <button type="submit" className="bg-[#701A3B] text-white px-4 py-2 rounded-xl text-xs font-bold">Enviar</button>
                </form>
              </>
            ) : <div className="flex-1 flex items-center justify-center text-xs text-stone-400">Selecciona un chat.</div>}
          </div>
        </div>
      )}

    </div>
  );
}