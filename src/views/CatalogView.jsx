// ==========================================
// 3. CATALOG VIEW (src/views/CatalogView.jsx)
// ==========================================
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, ShoppingBag, Eye, Coins } from 'lucide-react';

export default function CatalogView({ busqueda = '' }) {
  const { productos, colecciones, agregarAlCarrito, navegarA, usuarioActual } = useStore();
  const [coleccionFiltro, setColeccionFiltro] = useState('Todas');

  const productosFiltrados = productos.filter(p => {
    const matchBusqueda = (p.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) || 
                          (p.descripcion || '').toLowerCase().includes(busqueda.toLowerCase());
    const matchColeccion = coleccionFiltro === 'Todas' || p.coleccion === coleccionFiltro;
    return matchBusqueda && matchColeccion;
  });

  const esPremium = usuarioActual?.suscripcion?.tipo === 'premium';
  const puntosUsuario = usuarioActual?.puntos || 0;

  return (
    <div className="w-full min-h-screen py-10 px-6 sm:px-12 md:px-20 font-sans space-y-10 bg-[#FFF5F7]">
      {/* Banner Club de Seda / Puntos */}
      {esPremium && (
        <div className="bg-gradient-to-r from-[#1C1819] to-[#701A3B] text-[#F8D7E0] p-5 rounded-3xl flex items-center justify-between shadow-xl border border-[#D4AF37]/40">
          <div className="flex items-center gap-3">
            <Coins className="w-7 h-7 text-[#D4AF37]" />
            <div>
              <p className="font-bold text-xs uppercase tracking-widest text-white">Modo Divisa Club de Seda Activado (1 Sol = 8 Puntos)</p>
              <p className="text-[11px] text-stone-300">Tienes <strong>{puntosUsuario} Puntos</strong> disponibles para canjear prendas al instante sin trámites.</p>
            </div>
          </div>
          <span className="bg-[#D4AF37] text-stone-900 px-4 py-2 rounded-xl text-xs font-bold">Membresía Activa</span>
        </div>
      )}

      {/* Portada Editorial & Selector Dinámico de Colecciones / Ediciones */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#FDF5F7] via-[#F8D7E0]/30 to-[#FFF5F7] border border-[#F8D7E0] p-8 sm:p-12 text-center space-y-4 shadow-sm">
        <span className="inline-flex items-center gap-1.5 bg-white text-[#701A3B] border border-[#F8D7E0] text-[10px] uppercase tracking-[0.3em] px-4 py-1.5 rounded-full font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Colección Exclusiva • Atelier ROSSELY
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal">Diosas Eternas & Pijamas de Alta Costura</h1>
        <p className="text-xs text-stone-600 max-w-xl mx-auto leading-relaxed">
          Confeccionado artesanalmente en Nuevo Chimbote con satén de seda pura. Selecciona tu edición favorita para explorar nuestras exclusivas líneas.
        </p>

        {/* Pestañas de Colecciones Dinámicas creadas por Admin */}
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          <button onClick={() => setColeccionFiltro('Todas')} className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${coleccionFiltro === 'Todas' ? 'bg-[#701A3B] text-white' : 'bg-white text-stone-700 border border-[#F8D7E0]'}`}>
            Todas las Ediciones
          </button>
          {colecciones.map(c => (
            <button key={c.id} onClick={() => setColeccionFiltro(c.nombre)} className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${coleccionFiltro === c.nombre ? 'bg-[#701A3B] text-white' : 'bg-white text-stone-700 border border-[#F8D7E0]'}`}>
              {c.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Productos (Tarjetas Editorial Limpias) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {productosFiltrados.map(p => (
          <div key={p.id} className="group bg-white rounded-3xl border border-[#FCE4EC] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div className="relative aspect-[3/4] overflow-hidden bg-[#FFFBFB]">
              <img src={p.img || p.imagenes?.[0]} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#701A3B] uppercase tracking-wider">
                {p.coleccion || 'Exclusiva'}
              </div>
            </div>

            <div className="p-5 space-y-3 flex flex-col flex-grow justify-between">
              <div>
                <p className="font-serif text-sm font-bold text-stone-900">{p.nombre}</p>
                <p className="text-[11px] text-stone-500 line-clamp-2 mt-1">{p.descripcion || 'Pijama de satén de alta calidad confeccionado en Nuevo Chimbote.'}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <span className="font-bold text-sm text-[#701A3B]">S/. {parseFloat(p.precio || 0).toFixed(2)}</span>
                <div className="flex gap-1.5">
                  <button onClick={() => navegarA('detail', p)} className="p-2.5 bg-stone-100 text-stone-800 rounded-xl hover:bg-stone-200 cursor-pointer" title="Ver Detalle">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => agregarAlCarrito(p, p.tallas?.[0] || 'M')} className="p-2.5 bg-[#701A3B] text-white rounded-xl hover:bg-[#5a132f] cursor-pointer" title="Añadir al Carrito">
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}