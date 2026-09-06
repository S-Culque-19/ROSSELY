import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UploadCloud, Image as ImageIcon, Trash2, X } from 'lucide-react';

export default function AdminDashboardView() {
  const { 
    productos, 
    pedidos, 
    configPagos, 
    setConfigPagos, 
    actualizarEstadoPedido, 
    agregarProducto, 
    eliminarProducto 
  } = useStore();

  const [tab, setTab] = useState('inventario');

  // Estado del formulario
  const [nuevoProd, setNuevoProd] = useState({
    nombre: '',
    precio: '',
    categoria: 'Pijamas',
    tallas: 'S, M, L',
    descripcion: ''
  });

  // Manejo de archivo local
  const [archivoLocal, setArchivoLocal] = useState(null);
  const [previewLocal, setPreviewLocal] = useState('');
  const [subiendo, setSubiendo] = useState(false);

  const [pagosForm, setPagosForm] = useState(configPagos);

  // Selector de imagen desde el dispositivo (PC o celular)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoLocal(file);
      setPreviewLocal(URL.createObjectURL(file));
    }
  };

  const handleQuitarFoto = () => {
    setArchivoLocal(null);
    setPreviewLocal('');
  };

  const handleCrearProducto = async (e) => {
    e.preventDefault();
    if (!nuevoProd.nombre || !nuevoProd.precio) return;

    setSubiendo(true);
    let urlFinal = '';

    try {
      if (archivoLocal) {
        try {
          // 1. Intento de subida directa a Firebase Storage
          const extension = archivoLocal.name.split('.').pop();
          const nombreUnico = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${extension}`;
          const storageRef = ref(storage, `productos/${nombreUnico}`);
          
          const uploadRes = await uploadBytes(storageRef, archivoLocal);
          urlFinal = await getDownloadURL(uploadRes.ref);
        } catch (storageError) {
          console.warn("Storage no configurado o sin permisos, usando respaldo Base64 local:", storageError);
          // 2. Respaldo garantizado: Convierte la imagen local a Base64 para guardarla sin fallos
          urlFinal = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(archivoLocal);
          });
        }
      }

      // Guardar en Firestore/Contexto
      await agregarProducto({
        nombre: nuevoProd.nombre.trim(),
        precio: parseFloat(nuevoProd.precio),
        categoria: nuevoProd.categoria,
        tallas: nuevoProd.tallas.split(',').map(t => t.trim()),
        descripcion: nuevoProd.descripcion || '',
        img: urlFinal
      });

      // Limpiar formulario
      setNuevoProd({ nombre: '', precio: '', categoria: 'Pijamas', tallas: 'S, M, L', descripcion: '' });
      setArchivoLocal(null);
      setPreviewLocal('');
      alert('¡Prenda agregada exitosamente al catálogo!');
    } catch (err) {
      alert('Ocurrió un error al guardar la prenda: ' + err.message);
    } finally {
      setSubiendo(false);
    }
  };

  const handleActualizarPagos = (e) => {
    e.preventDefault();
    setConfigPagos(pagosForm);
    alert('Información de cobros actualizada.');
  };

  const totalVentas = pedidos.reduce((acc, p) => acc + p.total, 0);

  const renderBadgeEstado = (estado) => {
    if (estado === 'Pendiente de Verificación' || estado === 'Pendiente') {
      return (
        <div className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm w-32">
          <span className="text-[10px] uppercase font-bold tracking-wider leading-tight">Pendiente de</span>
          <span className="text-[12px] font-extrabold leading-tight">Verificación</span>
        </div>
      );
    }
    if (estado === 'En preparación') {
      return (
        <div className="bg-yellow-100 text-yellow-900 border border-yellow-300 px-3 py-1.5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm w-32">
          <span className="text-[10px] uppercase font-bold tracking-wider leading-tight">En</span>
          <span className="text-[12px] font-extrabold leading-tight">Preparación</span>
        </div>
      );
    }
    if (estado === 'Enviado') {
      return (
        <div className="bg-blue-100 text-blue-900 border border-blue-300 px-3 py-2 rounded-2xl flex items-center justify-center text-center shadow-sm w-32">
          <span className="text-[13px] font-extrabold leading-tight">Enviado 🚚</span>
        </div>
      );
    }
    return (
      <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-2 rounded-2xl flex items-center justify-center text-center shadow-sm w-32">
        <span className="text-[13px] font-extrabold leading-tight">Entregado ✓</span>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6 font-sans">
      
      {/* Resumen Superior */}
      <div className="bg-white border border-pink-200 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="text-[10px] bg-pink-100 text-[#831843] font-bold px-3 py-1 rounded-full uppercase">
            Administración Central
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
            Panel de Control ROSSELY
          </h1>
          <p className="text-xs text-gray-500">Gestión de órdenes en tiempo real, inventario y cuentas de cobro</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-[#FFF5F7] border border-pink-200 px-5 py-3 rounded-2xl text-center">
            <p className="text-[10px] uppercase font-bold text-gray-500">Ingresos Totales</p>
            <p className="text-xl font-black text-[#831843]">S/ {totalVentas.toFixed(2)}</p>
          </div>
          <div className="bg-[#FFF5F7] border border-pink-200 px-5 py-3 rounded-2xl text-center">
            <p className="text-[10px] uppercase font-bold text-gray-500">Pedidos Registrados</p>
            <p className="text-xl font-black text-gray-900">{pedidos.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-pink-200 pb-1 text-xs font-bold uppercase tracking-wider">
        <button 
          onClick={() => setTab('inventario')}
          className={`pb-3 px-4 transition cursor-pointer ${tab === 'inventario' ? 'border-b-4 border-[#831843] text-[#831843]' : 'text-gray-500 hover:text-gray-800'}`}
        >
          👗 Artículos en Venta ({productos.length})
        </button>
        <button 
          onClick={() => setTab('pedidos')}
          className={`pb-3 px-4 transition cursor-pointer ${tab === 'pedidos' ? 'border-b-4 border-[#831843] text-[#831843]' : 'text-gray-500 hover:text-gray-800'}`}
        >
          📦 Entregas & Pedidos ({pedidos.length})
        </button>
        <button 
          onClick={() => setTab('pagos')}
          className={`pb-3 px-4 transition cursor-pointer ${tab === 'pagos' ? 'border-b-4 border-[#831843] text-[#831843]' : 'text-gray-500 hover:text-gray-800'}`}
        >
          💳 Pasarelas y Cuentas
        </button>
      </div>

      {/* TAB 1: INVENTARIO */}
      {tab === 'inventario' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Formulario Agregar Artículo */}
          <div className="lg:col-span-5 bg-white border border-pink-200 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>🎀</span> Agregar Artículo
            </h3>

            <form onSubmit={handleCrearProducto} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-800 block mb-1">Nombre de la prenda</label>
                <input 
                  type="text" 
                  placeholder="Ej: Pijama Satín Rosé" 
                  required 
                  value={nuevoProd.nombre}
                  onChange={e => setNuevoProd({...nuevoProd, nombre: e.target.value})}
                  className="w-full p-3.5 bg-white border-2 border-pink-200 rounded-xl text-gray-900 font-medium outline-none focus:border-[#831843]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Precio (S/.)</label>
                <input 
                  type="number" 
                  placeholder="Ej: 129.90" 
                  step="0.10" 
                  required 
                  value={nuevoProd.precio}
                  onChange={e => setNuevoProd({...nuevoProd, precio: e.target.value})}
                  className="w-full p-3.5 bg-white border-2 border-pink-200 rounded-xl text-gray-900 font-medium outline-none focus:border-[#831843]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Categoría</label>
                <select 
                  value={nuevoProd.categoria}
                  onChange={e => setNuevoProd({...nuevoProd, categoria: e.target.value})}
                  className="w-full p-3.5 bg-white border-2 border-pink-200 rounded-xl text-gray-900 font-bold outline-none focus:border-[#831843] text-sm"
                >
                  <option value="Pijamas">Pijamas</option>
                  <option value="Batas">Batas</option>
                  <option value="Lencería">Lencería</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Tallas disponibles</label>
                <input 
                  type="text" 
                  placeholder="S, M, L" 
                  value={nuevoProd.tallas}
                  onChange={e => setNuevoProd({...nuevoProd, tallas: e.target.value})}
                  className="w-full p-3.5 bg-white border-2 border-pink-200 rounded-xl text-gray-900 font-medium outline-none focus:border-[#831843]"
                />
              </div>

              {/* REEMPLAZO: Subida de archivo desde tu PC o Celular */}
              <div>
                <label className="font-bold text-gray-800 block mb-1">Foto de la prenda (Subir desde archivo local)</label>
                
                {previewLocal ? (
                  <div className="relative border-2 border-pink-200 rounded-2xl p-3 bg-pink-50/40 flex items-center gap-4">
                    <img 
                      src={previewLocal} 
                      alt="Previsualización" 
                      className="w-20 h-24 object-cover rounded-xl border border-pink-300 shadow-sm"
                    />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-bold text-gray-800 truncate">{archivoLocal?.name}</p>
                      <p className="text-[10px] text-gray-500">{(archivoLocal?.size / 1024).toFixed(1)} KB</p>
                      <button
                        type="button"
                        onClick={handleQuitarFoto}
                        className="mt-2 text-xs text-red-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Quitar imagen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative border-2 border-dashed border-pink-300 hover:border-[#831843] rounded-2xl p-5 bg-[#FFF5F7]/50 text-center transition cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center space-y-1 text-gray-500">
                      <UploadCloud className="w-8 h-8 text-[#831843] mb-1" />
                      <p className="text-xs font-bold text-gray-800">
                        Seleccionar imagen desde tu dispositivo
                      </p>
                      <p className="text-[10px] text-gray-400">
                        PNG, JPG o WEBP (Toca aquí para examinar)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={subiendo}
                className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider transition shadow-md text-xs text-white cursor-pointer ${
                  subiendo ? 'bg-gray-400' : 'bg-[#831843] hover:bg-[#6b1336]'
                }`}
              >
                {subiendo ? 'Subiendo imagen y guardando...' : 'Publicar Prenda'}
              </button>
            </form>
          </div>

          {/* Listado de Prendas Activas */}
          <div className="lg:col-span-7 bg-white border border-pink-200 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Prendas Activas en Catálogo</h3>
            
            <div className="divide-y divide-pink-100 max-h-[560px] overflow-y-auto">
              {productos.length === 0 ? (
                <p className="text-xs text-gray-400 py-10 text-center">No hay prendas en el catálogo. Agrega tu primer artículo.</p>
              ) : (
                productos.map(p => (
                  <div key={p.id} className="py-3.5 flex justify-between items-center text-xs">
                    <div className="flex gap-4 items-center">
                      {p.img ? (
                        <img src={p.img} alt={p.nombre} className="w-14 h-16 object-cover rounded-xl border border-pink-200 shadow-sm" />
                      ) : (
                        <div className="w-14 h-16 bg-pink-50 rounded-xl border border-pink-200 flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{p.nombre}</p>
                        <p className="text-[#831843] font-bold mt-0.5">{p.categoria} • S/ {parseFloat(p.precio).toFixed(2)}</p>
                        <p className="text-[10px] text-gray-400">Tallas: {(p.tallas || []).join(', ')}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (window.confirm(`¿Eliminar "${p.nombre}" del catálogo?`)) {
                          eliminarProducto(p.id);
                        }
                      }}
                      className="text-red-600 hover:text-white hover:bg-red-600 font-bold border border-red-200 px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Eliminar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: PEDIDOS */}
      {tab === 'pedidos' && (
        <div className="bg-white border border-pink-200 rounded-3xl overflow-hidden shadow-sm">
          {pedidos.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm font-medium">
              No hay compras registradas en el sistema aún.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-900">
                <thead className="bg-[#FFF5F7] border-b border-pink-200 font-extrabold text-[#831843] uppercase text-xs">
                  <tr>
                    <th className="p-4">Orden</th>
                    <th className="p-4">Cliente / Contacto</th>
                    <th className="p-4">Dirección</th>
                    <th className="p-4">Total</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4 text-center">Cambiar Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100 text-xs">
                  {pedidos.map(ped => (
                    <tr key={ped.id} className="hover:bg-pink-50/30 transition">
                      <td className="p-4 font-black text-[#831843] text-base">#{String(ped.id).slice(-6)}</td>
                      
                      <td className="p-4">
                        <p className="font-bold text-gray-900 text-sm">{ped.cliente?.nombre}</p>
                        <p className="text-gray-600 text-xs font-semibold mt-0.5">Telf: {ped.cliente?.telefono}</p>
                        <p className="text-gray-400 text-[11px]">{ped.cliente?.email}</p>
                      </td>

                      <td className="p-4 text-xs text-gray-700 font-medium max-w-xs">
                        {ped.cliente?.direccion || "Entrega coordinada"}
                      </td>

                      <td className="p-4 font-black text-gray-900 text-base">
                        S/ {ped.total?.toFixed(2)}
                      </td>

                      <td className="p-4 flex justify-center items-center min-h-[70px]">
                        {renderBadgeEstado(ped.estado)}
                      </td>

                      <td className="p-4 text-center">
                        <select 
                          value={ped.estado} 
                          onChange={(e) => actualizarEstadoPedido(ped.id, e.target.value)}
                          className="bg-white border-2 border-[#831843] text-gray-900 font-black px-4 py-2.5 rounded-2xl text-xs outline-none cursor-pointer shadow-sm"
                        >
                          <option value="Pendiente de Verificación">Pendiente</option>
                          <option value="En preparación">En preparación</option>
                          <option value="Enviado">Enviado</option>
                          <option value="Entregado">Entregado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PASARELAS Y CUENTAS */}
      {tab === 'pagos' && (
        <div className="max-w-2xl mx-auto bg-white border border-pink-200 p-8 rounded-3xl shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-2xl font-bold text-gray-900">Cuentas de Cobro Directo 💳</h3>
            <p className="text-xs text-gray-500">Estos datos se reflejan automáticamente en el Checkout al comprador.</p>
          </div>

          <form onSubmit={handleActualizarPagos} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-gray-900 block mb-1">Nombre del Banco</label>
              <input 
                type="text" 
                value={pagosForm.banco} 
                onChange={e => setPagosForm({...pagosForm, banco: e.target.value})}
                className="w-full p-3.5 bg-white border-2 border-pink-200 rounded-xl text-gray-900 font-medium outline-none focus:border-[#831843]"
              />
            </div>

            <div>
              <label className="font-bold text-gray-900 block mb-1">Número de Cuenta</label>
              <input 
                type="text" 
                value={pagosForm.cuenta} 
                onChange={e => setPagosForm({...pagosForm, cuenta: e.target.value})}
                className="w-full p-3.5 bg-white border-2 border-pink-200 rounded-xl text-gray-900 font-medium outline-none focus:border-[#831843]"
              />
            </div>

            <div>
              <label className="font-bold text-gray-900 block mb-1">Código Interbancario (CCI)</label>
              <input 
                type="text" 
                value={pagosForm.cci} 
                onChange={e => setPagosForm({...pagosForm, cci: e.target.value})}
                className="w-full p-3.5 bg-white border-2 border-pink-200 rounded-xl text-gray-900 font-medium outline-none focus:border-[#831843]"
              />
            </div>

            <div>
              <label className="font-bold text-gray-900 block mb-1">Número Yape / Plin</label>
              <input 
                type="text" 
                value={pagosForm.yape} 
                onChange={e => setPagosForm({...pagosForm, yape: e.target.value})}
                className="w-full p-3.5 bg-white border-2 border-pink-200 rounded-xl text-gray-900 font-bold text-sm outline-none focus:border-[#831843]"
              />
            </div>

            <div>
              <label className="font-bold text-gray-900 block mb-1">Titular de Cuenta</label>
              <input 
                type="text" 
                value={pagosForm.titular} 
                onChange={e => setPagosForm({...pagosForm, titular: e.target.value})}
                className="w-full p-3.5 bg-white border-2 border-pink-200 rounded-xl text-gray-900 font-medium outline-none focus:border-[#831843]"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#831843] hover:bg-[#6b1336] text-white py-4 rounded-xl font-bold uppercase tracking-wider transition shadow-md mt-4 cursor-pointer text-xs"
            >
              Guardar Configuración de Cobros
            </button>
          </form>
        </div>
      )}

    </div>
  );
}