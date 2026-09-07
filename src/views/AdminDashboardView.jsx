import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { compressAndConvertToBase64 } from '../services/imageOptimizer';
import * as XLSX from 'xlsx';
import { 
  Package, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  FileSpreadsheet, 
  UploadCloud, 
  Loader2, 
  CheckCircle, 
  Trash2, 
  Clock 
} from 'lucide-react';

export default function AdminDashboardView() {
  const { productos, pedidos } = useStore();
  const [tabActiva, setTabActiva] = useState('inventario'); // 'inventario' | 'pedidos' | 'balance'
  
  // Estado del formulario de productos
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [costoUnitario, setCostoUnitario] = useState('');
  const [stock, setStock] = useState('10');
  const [categoria, setCategoria] = useState('Pijamas');
  const [tallas, setTallas] = useState('S, M, L');
  const [descripcion, setDescripcion] = useState('');
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Filtro de días para el Balance Contable
  const [diasFiltro, setDiasFiltro] = useState(30);

  const mostrarToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSeleccionarImagen = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenArchivo(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !precio || !imagenArchivo) {
      alert("Por favor completa el nombre, precio y selecciona una fotografía.");
      return;
    }

    setGuardando(true);
    try {
      // 1. Compresión instantánea en Canvas
      const base64Optimizado = await compressAndConvertToBase64(imagenArchivo, 1100, 0.75);

      // 2. Guardar directo en Firestore (cero dependencia de Storage)
      await addDoc(collection(db, 'productos'), {
        nombre: nombre.trim(),
        precio: parseFloat(precio),
        costoUnitario: parseFloat(costoUnitario || (parseFloat(precio) * 0.4)), // Margen base si no se especifica
        stock: parseInt(stock) || 0,
        categoria,
        tallas: tallas.split(',').map(t => t.trim().toUpperCase()),
        descripcion: descripcion.trim(),
        img: base64Optimizado,
        fechaCreacion: serverTimestamp()
      });

      mostrarToast("Prenda publicada con éxito en el catálogo.");
      setNombre('');
      setPrecio('');
      setCostoUnitario('');
      setStock('10');
      setDescripcion('');
      setImagenArchivo(null);
      setPreviewUrl('');
    } catch (err) {
      console.error("Error guardando prenda:", err);
      alert("Ocurrió un error al procesar la imagen y guardar.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarProducto = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta prenda del catálogo?")) {
      try {
        await deleteDoc(doc(db, 'productos', id));
        mostrarToast("Prenda eliminada.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCambiarEstadoPedido = async (id, nuevoEstado) => {
    try {
      await updateDoc(doc(db, 'pedidos', id), { estado: nuevoEstado });
      mostrarToast(`Pedido actualizado a ${nuevoEstado}`);
    } catch (err) {
      console.error(err);
    }
  };

  // CÁLCULOS DEL BALANCE CONTABLE
  const ahora = new Date();
  const pedidosFiltrados = pedidos.filter(p => {
    if (!p.fecha) return true;
    const fechaPedido = p.fecha?.toDate ? p.fecha.toDate() : new Date(p.fecha);
    const diferenciaDias = (ahora - fechaPedido) / (1000 * 60 * 60 * 24);
    return diferenciaDias <= diasFiltro;
  });

  const totalIngresos = pedidosFiltrados.reduce((acc, p) => acc + (parseFloat(p.total) || 0), 0);
  
  // Estimación de costo de mercadería vendida
  const totalCostos = pedidosFiltrados.reduce((acc, p) => {
    const costoItems = (p.items || []).reduce((cAcc, item) => {
      const costo = item.costoUnitario || (parseFloat(item.precio || 0) * 0.42);
      return cAcc + (costo * (item.cantidad || 1));
    }, 0);
    return acc + costoItems;
  }, 0);

  const gananciaNeta = totalIngresos - totalCostos;
  const margenUtilidad = totalIngresos > 0 ? ((gananciaNeta / totalIngresos) * 100).toFixed(1) : 0;
  const unidadesVendidas = pedidosFiltrados.reduce((acc, p) => {
    return acc + (p.items || []).reduce((iAcc, item) => iAcc + (item.cantidad || 1), 0);
  }, 0);

  // EXPORTADOR EXCEL CON SHEETJS
  const exportarExcelBalance = () => {
    const filas = [];

    pedidosFiltrados.forEach(p => {
      const fechaStr = p.fecha?.toDate 
        ? p.fecha.toDate().toLocaleDateString('es-PE') 
        : new Date().toLocaleDateString('es-PE');

      (p.items || []).forEach(item => {
        const cUnit = item.costoUnitario || (parseFloat(item.precio || 0) * 0.42);
        const pVenta = parseFloat(item.precio || 0);
        const subtotal = pVenta * (item.cantidad || 1);
        const gananciaItem = subtotal - (cUnit * (item.cantidad || 1));

        filas.push({
          "Fecha": fechaStr,
          "ID Pedido": p.id.slice(0, 7),
          "Cliente": p.cliente?.nombre || 'Venta Web',
          "Prenda": item.nombre,
          "Talla": item.talla || 'M',
          "Cantidad": item.cantidad || 1,
          "Costo Unitario (S/.)": cUnit.toFixed(2),
          "Precio Venta (S/.)": pVenta.toFixed(2),
          "Total Ingreso (S/.)": subtotal.toFixed(2),
          "Ganancia Neta (S/.)": gananciaItem.toFixed(2),
          "Estado": p.estado || 'Pendiente'
        });
      });
    });

    // Fila vacía y totales
    filas.push({});
    filas.push({
      "Fecha": "RESUMEN TOTAL",
      "ID Pedido": `Periodo: ${diasFiltro} días`,
      "Cantidad": unidadesVendidas,
      "Total Ingreso (S/.)": totalIngresos.toFixed(2),
      "Ganancia Neta (S/.)": gananciaNeta.toFixed(2),
      "Estado": `Margen: ${margenUtilidad}%`
    });

    const worksheet = XLSX.utils.json_to_sheet(filas);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Balance Contable");

    const fechaHoy = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Balance_ROSSELY_${diasFiltro}Dias_${fechaHoy}.xlsx`);
  };

  return (
    <div className="w-full min-h-screen py-8 px-6 sm:px-10 md:px-16 font-sans text-stone-800 space-y-10">
      
      {/* Toast flotante */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1819] text-[#F8D7E0] border border-[#701A3B] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs uppercase tracking-wider font-semibold animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Encabezado Superior */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#FCE4EC] pb-6">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#A24869] uppercase">
            Dirección Ejecutiva
          </span>
          <h1 className="font-serif text-3xl font-black text-[#701A3B] tracking-tight">
            Panel de Control ROSSELY
          </h1>
        </div>

        {/* Pestañas de Navegación del Panel */}
        <div className="flex gap-2 p-1.5 bg-[#FDF5F7] border border-[#F8D7E0] rounded-2xl">
          <button
            onClick={() => setTabActiva('inventario')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              tabActiva === 'inventario' ? 'bg-[#701A3B] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" /> Inventario
          </button>
          <button
            onClick={() => setTabActiva('pedidos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              tabActiva === 'pedidos' ? 'bg-[#701A3B] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Entregas ({pedidos.length})
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
          
          {/* Formulario de Alta */}
          <form onSubmit={handleGuardarProducto} className="lg:col-span-5 bg-white p-7 rounded-3xl border border-[#FCE4EC] shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">Agregar Nueva Prenda</h3>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Nombre de la Prenda *</label>
              <input 
                type="text" 
                required 
                placeholder="Pijama Satín Vino Rosa"
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl px-4 py-2 text-xs outline-none focus:border-[#701A3B]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">P. Venta (S/.) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  required 
                  placeholder="149.00"
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
                  placeholder="55.00"
                  value={costoUnitario} 
                  onChange={(e) => setCostoUnitario(e.target.value)}
                  className="w-full bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#701A3B]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Stock Inicial</label>
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
                  <option value="Accesorios">Accesorios de Seda</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Tallas (Separadas por coma)</label>
                <input 
                  type="text" 
                  value={tallas} 
                  onChange={(e) => setTallas(e.target.value)}
                  className="w-full bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#701A3B]"
                />
              </div>
            </div>

            {/* Input de Fotografía con previsualización */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Fotografía de la Prenda *</label>
              <label className="w-full border-2 border-dashed border-[#F8D7E0] hover:border-[#701A3B] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-[#FDF5F7]/50 transition">
                <UploadCloud className="w-6 h-6 text-[#701A3B] mb-1" />
                <span className="text-xs text-stone-600 font-medium">Seleccionar imagen desde tu dispositivo</span>
                <span className="text-[10px] text-stone-400">Compresión y optimización instantánea en navegador</span>
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
              className="w-full bg-[#701A3B] hover:bg-[#56132D] text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Optimizando y Publicando...
                </>
              ) : (
                'Publicar Prenda en el Catálogo'
              )}
            </button>
          </form>

          {/* Listado en Tiempo Real */}
          <div className="lg:col-span-7 bg-white p-7 rounded-3xl border border-[#FCE4EC] shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">Prendas Registradas ({productos.length})</h3>
            
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-2">
              {productos.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-100 bg-[#FFFBFB] hover:border-[#F8D7E0] transition">
                  <div className="flex items-center gap-3">
                    <img src={p.img} alt={p.nombre} className="w-12 h-14 rounded-lg object-cover border border-stone-200" />
                    <div>
                      <p className="font-bold text-xs text-stone-900">{p.nombre}</p>
                      <p className="text-[10px] text-stone-400">{p.categoria} • Stock: {p.stock} • Tallas: {p.tallas?.join(', ')}</p>
                      <p className="text-xs font-semibold text-[#701A3B]">S/. {p.precio?.toFixed(2)}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleEliminarProducto(p.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* PESTAÑA 2: ENTREGAS Y PEDIDOS */}
      {tabActiva === 'pedidos' && (
        <div className="bg-white p-7 rounded-3xl border border-[#FCE4EC] shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-bold text-stone-900">Gestión de Envíos y Comprobantes</h3>
          
          <div className="space-y-4">
            {pedidos.length === 0 ? (
              <p className="text-xs text-stone-400 py-8 text-center">No hay pedidos registrados aún.</p>
            ) : (
              pedidos.map(p => (
                <div key={p.id} className="p-5 rounded-2xl border border-[#F8D7E0] bg-[#FFFBFB] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2">
                    <div>
                      <span className="text-xs font-bold text-[#701A3B]">Pedido #{p.id.slice(0, 8)}</span>
                      <p className="text-[11px] text-stone-600 font-medium">Cliente: {p.cliente?.nombre} ({p.cliente?.telefono})</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">Total: S/. {parseFloat(p.total || 0).toFixed(2)}</span>
                      <select
                        value={p.estado || 'Pendiente'}
                        onChange={(e) => handleCambiarEstadoPedido(p.id, e.target.value)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Pago Verificado">Pago Verificado</option>
                        <option value="En Confección/Empaque">En Confección/Empaque</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Entregado">Entregado</option>
                      </select>
                    </div>
                  </div>

                  {/* Detalle de prendas y comprobante */}
                  <div className="flex flex-wrap justify-between items-center gap-4 text-xs">
                    <div className="space-y-1">
                      {(p.items || []).map((it, idx) => (
                        <p key={idx} className="text-stone-700">
                          • {it.cantidad}x {it.nombre} (Talla {it.talla}) - S/. {(it.precio * it.cantidad).toFixed(2)}
                        </p>
                      ))}
                    </div>

                    {p.comprobanteImg && (
                      <a href={p.comprobanteImg} target="_blank" rel="noreferrer" className="text-[11px] text-[#701A3B] underline font-semibold">
                        Ver Comprobante de Pago Adjunto ↗
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
          
          {/* Selector de Rango Temporal */}
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
              onClick={exportarExcelBalance}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" /> Exportar a Excel (.xlsx)
            </button>
          </div>

          {/* Tarjetas KPI Financieras */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#FCE4EC] shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Ingresos Brutos</span>
              <p className="text-xl font-bold text-stone-900">S/. {totalIngresos.toFixed(2)}</p>
              <span className="text-[10px] text-emerald-600 font-medium">Ventas en el periodo</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#FCE4EC] shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Costo Mercadería</span>
              <p className="text-xl font-bold text-stone-700">S/. {totalCostos.toFixed(2)}</p>
              <span className="text-[10px] text-stone-400 font-medium">Costo de confección/satén</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#FCE4EC] shadow-xs space-y-1 bg-gradient-to-br from-[#FFFBFB] to-[#FDF5F7]">
              <span className="text-[10px] font-bold text-[#701A3B] uppercase tracking-wider">Utilidad Neta Real</span>
              <p className="text-xl font-black text-[#701A3B]">S/. {gananciaNeta.toFixed(2)}</p>
              <span className="text-[10px] text-[#A24869] font-medium">Margen estimado: {margenUtilidad}%</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#FCE4EC] shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Unidades Vendidas</span>
              <p className="text-xl font-bold text-stone-900">{unidadesVendidas}</p>
              <span className="text-[10px] text-stone-400 font-medium">Prendas despachadas</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#FCE4EC] shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Ticket Promedio</span>
              <p className="text-xl font-bold text-stone-900">
                S/. {pedidosFiltrados.length > 0 ? (totalIngresos / pedidosFiltrados.length).toFixed(2) : '0.00'}
              </p>
              <span className="text-[10px] text-stone-400 font-medium">Por compra realizada</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}