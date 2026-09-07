import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
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
  MapPin 
} from 'lucide-react';

// Compresión Canvas integrada localmente (Cero dependencias de Storage)
const optimizarImagenCanvas = (file, maxWidth = 1100, quality = 0.75) => {
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
};

export default function AdminDashboardView() {
  const { productos, pedidos, actualizarEstadoPedido, eliminarProducto } = useStore();
  const [tabActiva, setTabActiva] = useState('inventario'); // 'inventario' | 'pedidos' | 'balance'

  // Estados del Formulario de Prendas
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [costoUnitario, setCostoUnitario] = useState('');
  const [stock, setStock] = useState('12');
  const [categoria, setCategoria] = useState('Pijamas');
  const [tallas, setTallas] = useState('S, M, L');
  const [descripcion, setDescripcion] = useState('');
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Selector temporal para Balance Contable
  const [diasFiltro, setDiasFiltro] = useState(30);

  const mostrarToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSeleccionarImagen = (e) => {
    const f = e.target.files[0];
    if (f) {
      setImagenArchivo(f);
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !precio || !imagenArchivo) {
      alert("Por favor completa el nombre, precio y selecciona la foto de la prenda.");
      return;
    }

    setGuardando(true);
    try {
      // 1. Compresión Canvas Base64 sin Storage
      const base64Opt = await optimizarImagenCanvas(imagenArchivo, 1100, 0.75);

      // 2. Inserción directa en Cloud Firestore
      await addDoc(collection(db, 'productos'), {
        nombre: nombre.trim(),
        precio: parseFloat(precio),
        costoUnitario: parseFloat(costoUnitario || (parseFloat(precio) * 0.4)),
        stock: parseInt(stock) || 0,
        categoria,
        tallas: tallas.split(',').map(t => t.trim().toUpperCase()),
        descripcion: descripcion.trim(),
        img: base64Opt,
        origen: 'Taller Nuevo Chimbote',
        createdAt: serverTimestamp()
      });

      mostrarToast("✦ Prenda publicada exitosamente en el catálogo.");
      setNombre('');
      setPrecio('');
      setCostoUnitario('');
      setStock('12');
      setDescripcion('');
      setImagenArchivo(null);
      setPreviewUrl('');
    } catch (err) {
      console.error(err);
      alert("Error al procesar la imagen y guardar en Firestore.");
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

  // Generador de Excel con SheetJS
  const exportarBalanceExcel = () => {
    const filas = [];

    pedidosFiltrados.forEach(p => {
      const fechaTxt = p.createdAt?.toDate 
        ? p.createdAt.toDate().toLocaleDateString('es-PE') 
        : (p.fecha ? p.fecha.split(' ')[0] : 'Reciente');

      (p.items || []).forEach(item => {
        const cU = item.costoUnitario || (parseFloat(item.precio || 0) * 0.4);
        const pV = parseFloat(item.precio || 0);
        const q = item.cantidad || 1;
        const tot = pV * q;
        const util = tot - (cU * q);

        filas.push({
          "Fecha": fechaTxt,
          "ID Pedido": p.id.slice(0, 8),
          "Cliente": p.cliente?.nombre || 'Venta Web',
          "Destino / Agencia": `${p.cliente?.ciudad || 'Destino'} - Shalom ${p.cliente?.agenciaShalom || ''}`,
          "Prenda": item.nombre,
          "Talla": item.tallaSeleccionada || 'M',
          "Cantidad": q,
          "Costo Unitario (S/.)": cU.toFixed(2),
          "Precio Venta (S/.)": pV.toFixed(2),
          "Ingreso Total (S/.)": tot.toFixed(2),
          "Ganancia Neta (S/.)": util.toFixed(2),
          "Estado Pedido": p.estado || 'Pendiente'
        });
      });
    });

    // Fila de Consolidado
    filas.push({});
    filas.push({
      "Fecha": "RESUMEN CONSOLIDADO",
      "ID Pedido": `Filtro: ${diasFiltro} Días`,
      "Prenda": `Origen: Taller Nuevo Chimbote`,
      "Cantidad": unidadesVendidas,
      "Ingreso Total (S/.)": ingresosTotales.toFixed(2),
      "Ganancia Neta (S/.)": gananciaNetaReal.toFixed(2),
      "Estado Pedido": `Margen: ${margenUtilidad}%`
    });

    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Balance ROSSELY");

    const fechaHoy = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(libro, `Balance_ROSSELY_${diasFiltro}Dias_${fechaHoy}.xlsx`);
  };

  return (
    <div className="w-full min-h-screen py-8 px-6 sm:px-10 md:px-16 font-sans space-y-10">
      
      {/* Toast Animado */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1819] text-[#F8D7E0] border border-[#701A3B] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs uppercase tracking-wider font-semibold animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Cabecera del Panel */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#FCE4EC] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#A24869] uppercase">
              Dirección de Operaciones
            </span>
            <span className="text-[10px] bg-[#FDF5F7] text-[#701A3B] border border-[#F8D7E0] px-2 py-0.5 rounded-md font-mono">
              Nuevo Chimbote
            </span>
          </div>
          <h1 className="font-serif text-3xl font-black text-[#701A3B] tracking-tight">
            Panel de Gestión ROSSELY
          </h1>
        </div>

        {/* Pestañas del Panel */}
        <div className="flex gap-2 p-1.5 bg-[#FDF5F7] border border-[#F8D7E0] rounded-2xl">
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
            <ShoppingBag className="w-3.5 h-3.5" /> Envíos Shalom ({pedidos.length})
          </button>
          <button
            onClick={() => setTabActiva('balance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              tabActiva === 'balance' ? 'bg-[#701A3B] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Balance Contable
          </button>
        </div>
      </div>

      {/* PESTAÑA 1: INVENTARIO */}
      {tabActiva === 'inventario' && (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Formulario */}
          <form onSubmit={handleGuardarProducto} className="lg:col-span-5 bg-white p-7 rounded-3xl border border-[#FCE4EC] shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">Agregar Nueva Prenda de Seda</h3>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Nombre de la Prenda *</label>
              <input 
                type="text" 
                required 
                placeholder="Pijama Satín Manga Larga Palo Rosa"
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#701A3B]"
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
                  className="w-full bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#701A3B]"
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
                  className="w-full bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#701A3B]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Stock Taller</label>
                <input 
                  type="number" 
                  value={stock} 
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#701A3B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Categoría</label>
                <select 
                  value={categoria} 
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#701A3B]"
                >
                  <option value="Pijamas">Pijamas de Satín</option>
                  <option value="Batas">Batas & Kimonos</option>
                  <option value="Lencería">Lencería Fina</option>
                  <option value="Accesorios">Antifaces & Scrunchies</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Tallas Disponibles</label>
                <input 
                  type="text" 
                  value={tallas} 
                  onChange={(e) => setTallas(e.target.value)}
                  className="w-full bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#701A3B]"
                />
              </div>
            </div>

            {/* Input Fotografía Local */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Fotografía de la Prenda *</label>
              <label className="w-full border-2 border-dashed border-[#F8D7E0] hover:border-[#701A3B] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-[#FDF5F7]/40 transition">
                <UploadCloud className="w-6 h-6 text-[#701A3B] mb-1" />
                <span className="text-xs text-stone-700 font-medium">Subir foto desde PC o Celular</span>
                <span className="text-[10px] text-stone-400">Compresión automática en Canvas (sin Storage)</span>
                <input type="file" accept="image/*" onChange={handleSeleccionarImagen} className="hidden" />
              </label>

              {previewUrl && (
                <div className="mt-3 relative w-24 h-24 rounded-xl overflow-hidden border border-[#F8D7E0]">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={guardando}
              className="w-full bg-[#701A3B] hover:bg-[#56132D] text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Procesando Imagen y Guardando...
                </>
              ) : (
                '✦ Publicar Prenda en Catálogo'
              )}
            </button>
          </form>

          {/* Listado en Vivo */}
          <div className="lg:col-span-7 bg-white p-7 rounded-3xl border border-[#FCE4EC] shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">Prendas en el Catálogo ({productos.length})</h3>
            
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-2">
              {productos.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-100 bg-[#FFFBFB] hover:border-[#F8D7E0] transition">
                  <div className="flex items-center gap-3">
                    <img src={p.img} alt={p.nombre} className="w-12 h-14 rounded-lg object-cover border border-stone-200" />
                    <div>
                      <p className="font-bold text-xs text-stone-900">{p.nombre}</p>
                      <p className="text-[10px] text-stone-400">{p.categoria} • Stock: {p.stock} • Tallas: {p.tallas?.join(', ')}</p>
                      <p className="text-xs font-semibold text-[#701A3B]">S/. {parseFloat(p.precio || 0).toFixed(2)}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => eliminarProducto(p.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Eliminar prenda"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: ENTREGAS Y ENVÍOS SHALOM */}
      {tabActiva === 'pedidos' && (
        <div className="bg-white p-7 rounded-3xl border border-[#FCE4EC] shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-stone-900">Despachos Nacionales vía Shalom</h3>
            <span className="text-xs text-stone-500 font-light flex items-center gap-1">
              <Truck className="w-4 h-4 text-[#701A3B]" /> Salidas desde Nuevo Chimbote
            </span>
          </div>

          <div className="space-y-4">
            {pedidos.length === 0 ? (
              <p className="text-xs text-stone-400 py-10 text-center">No hay pedidos registrados en la plataforma.</p>
            ) : (
              pedidos.map(p => (
                <div key={p.id} className="p-5 rounded-2xl border border-[#F8D7E0] bg-[#FFFBFB] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2">
                    <div>
                      <span className="text-xs font-bold text-[#701A3B]">Pedido #{p.id.slice(0, 8)}</span>
                      <p className="text-[11px] text-stone-700 font-medium">
                        Cliente: {p.cliente?.nombre} • DNI: {p.cliente?.dni} • Tel: {p.cliente?.telefono}
                      </p>
                      <p className="text-[10px] text-stone-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#A24869]" /> Destino: {p.cliente?.ciudad} — Shalom: {p.cliente?.agenciaShalom}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-stone-900">Total: S/. {parseFloat(p.total || 0).toFixed(2)}</span>
                      <select
                        value={p.estado || 'Pendiente'}
                        onChange={(e) => actualizarEstadoPedido(p.id, e.target.value)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
                      >
                        <option value="Pendiente de Verificación">Pendiente de Verificación</option>
                        <option value="Pago Verificado">Pago Verificado</option>
                        <option value="En Confección/Empaque">En Confección/Empaque</option>
                        <option value="Dejado en Shalom Chimbote">Dejado en Shalom Chimbote</option>
                        <option value="En Tránsito a Destino">En Tránsito a Destino</option>
                        <option value="Entregado">Entregado</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-between items-center gap-4 text-xs">
                    <div className="space-y-1">
                      {(p.items || []).map((it, idx) => (
                        <p key={idx} className="text-stone-700">
                          • {it.cantidad || 1}x {it.nombre} (Talla {it.tallaSeleccionada || 'M'}) — S/. {(it.precio * (it.cantidad || 1)).toFixed(2)}
                        </p>
                      ))}
                    </div>

                    {p.comprobanteImg && (
                      <a 
                        href={p.comprobanteImg} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs font-bold text-[#701A3B] underline hover:text-[#56132D]"
                      >
                        Ver Captura de Pago Adjunta ↗
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
          
          {/* Selector y Exportador */}
          <div className="bg-white p-6 rounded-3xl border border-[#FCE4EC] shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#701A3B]" />
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">Filtrar Periodo:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { d: 1, label: '1 Día' },
                  { d: 7, label: '7 Días' },
                  { d: 14, label: '14 Días' },
                  { d: 30, label: '30 Días' },
                  { d: 60, label: '60 Días' },
                  { d: 90, label: '90 Días' },
                  { d: 180, label: '180 Días' },
                  { d: 365, label: '1 Año' },
                ].map(r => (
                  <button
                    key={r.d}
                    onClick={() => setDiasFiltro(r.d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                      diasFiltro === r.d 
                        ? 'bg-[#701A3B] text-white border-[#701A3B]' 
                        : 'bg-[#FDF5F7] text-stone-700 border-[#F8D7E0] hover:border-[#701A3B]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={exportarBalanceExcel}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" /> ✦ Exportar Balance Contable a Excel
            </button>
          </div>

          {/* Tarjetas KPI */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#FCE4EC] shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Ingresos Brutos</span>
              <p className="text-xl font-bold text-stone-900">S/. {ingresosTotales.toFixed(2)}</p>
              <span className="text-[10px] text-emerald-600 font-medium">En {diasFiltro} días</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#FCE4EC] shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Costo Mercadería</span>
              <p className="text-xl font-bold text-stone-700">S/. {costoTotalMercaderia.toFixed(2)}</p>
              <span className="text-[10px] text-stone-400 font-medium">Insumos y confección</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#FCE4EC] shadow-xs space-y-1 bg-gradient-to-br from-[#FFFBFB] to-[#FDF5F7]">
              <span className="text-[10px] font-bold text-[#701A3B] uppercase tracking-wider">Utilidad Neta Real</span>
              <p className="text-xl font-black text-[#701A3B]">S/. {gananciaNetaReal.toFixed(2)}</p>
              <span className="text-[10px] text-[#A24869] font-medium">Margen estimado: {margenUtilidad}%</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#FCE4EC] shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Prendas Despachadas</span>
              <p className="text-xl font-bold text-stone-900">{unidadesVendidas}</p>
              <span className="text-[10px] text-stone-400 font-medium">Unidades vendidas</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#FCE4EC] shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Ticket Promedio</span>
              <p className="text-xl font-bold text-stone-900">
                S/. {pedidosFiltrados.length > 0 ? (ingresosTotales / pedidosFiltrados.length).toFixed(2) : '0.00'}
              </p>
              <span className="text-[10px] text-stone-400 font-medium">Por compra</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}