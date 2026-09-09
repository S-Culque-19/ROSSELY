import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Info, Tag } from 'lucide-react';

export default function CatalogView() {
  const { productos, agregarAlCarrito, navegarA } = useStore();
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');

  const categorias = ['Todas', 'Pijamas', 'Batas', 'Lencería', 'Accesorios'];

  const productosFiltrados = categoriaFiltro === 'Todas' 
    ? productos 
    : productos.filter(p => p.categoria?.toLowerCase() === categoriaFiltro.toLowerCase());

  return (
    <div className="w-full min-h-screen py-10 px-6 sm:px-10 md:px-16 bg-[#FFF5F7] font-sans space-y-12">
      
      {/* Portada Editorial / Header Colección "Diosas Eternas" */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#FDF5F7] via-[#F8D7E0]/35 to-[#FFF5F7] border border-[#F8D7E0] p-8 sm:p-14 text-center space-y-4 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F8D7E0]/20 rounded-full blur-3xl pointer-events-none" />
        <span className="inline-flex items-center gap-1.5 bg-white text-[#701A3B] border border-[#F8D7E0] text-[10px] uppercase tracking-[0.3em] px-4 py-1.5 rounded-full font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#701A3B]" /> Colección Diosas Eternas • Atelier ROSSELY
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#701A3B] tracking-tight">
          El Confort de la Seda & Elegancia Atemporal
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 font-light max-w-2xl mx-auto leading-relaxed">
          Confeccionadas artesanalmente en Nuevo Chimbote con acabados de alta costura, empaquetadas en delicado papel seda y caja de regalo oficial.
        </p>

        {/* Filtros de Categoría Estilo Botones Satinados */}
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaFiltro(cat)}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer border ${
                categoriaFiltro === cat
                  ? 'bg-[#701A3B] text-white border-[#701A3B] shadow-sm'
                  : 'bg-white text-stone-700 border-[#F8D7E0] hover:border-[#701A3B]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Tarjetas Estilo Editorial ("Diosas Eternas") */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {productosFiltrados.length === 0 ? (
          <div className="col-span-full py-20 text-center text-stone-400 text-xs uppercase tracking-widest">
            No hay prendas disponibles en esta categoría actualmente.
          </div>
        ) : (
          productosFiltrados.map(p => (
            <div 
              key={p.id}
              className="bg-[#FDFBFB] border border-[#F8D7E0] rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
            >
              {/* Imagen Principal con Fondo Satinado */}
              <div className="relative w-full h-80 overflow-hidden bg-[#FDF5F7]">
                <img 
                  src={p.img} 
                  alt={p.nombre} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[#701A3B] border border-[#F8D7E0] text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                  {p.categoria || 'Seda Exclusiva'}
                </span>
                <span className="absolute top-3 right-3 bg-[#1C1819]/80 text-[#D4AF37] text-[9px] font-mono px-2 py-1 rounded-md">
                  STOCK: {p.stock}
                </span>
              </div>

              {/* Contenido Editorial de la Prenda */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif text-xl font-bold text-[#701A3B] tracking-tight">
                      {p.nombre}
                    </h3>
                  </div>

                  <p className="text-[11px] text-stone-600 font-light leading-relaxed italic">
                    "{p.descripcion || 'Inspirado en la suavidad celestial y el descanso absoluto.'}"
                  </p>

                  <div className="space-y-1 pt-2 border-t border-[#F8D7E0]/60 text-[10px] text-stone-500">
                    <p><strong className="text-stone-700">Características:</strong> Corte elegante, 100% Satín Premium, costuras reforzadas.</p>
                    <p><strong className="text-stone-700">Tallas:</strong> {p.tallas ? p.tallas.join(', ') : 'S, M, L'}</p>
                    <p><strong className="text-stone-700">Cód. Modelo:</strong> ROSSELY-{p.id.slice(-4).toUpperCase()}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Precio Taller</span>
                    <span className="text-lg font-black text-[#701A3B]">S/. {parseFloat(p.precio || 0).toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => agregarAlCarrito(p, p.tallas ? p.tallas[0] : 'M')}
                    className="w-full bg-[#701A3B] hover:bg-[#56132D] text-white py-3 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Adquirir Prenda</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pie de Garantía Editorial */}
      <div className="border-t border-[#F8D7E0] pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Garantía de Calidad Atelier ROSSELY • Nuevo Chimbote, Perú</span>
        </div>
        <p className="font-serif italic text-[#701A3B]">"La esencia de la belleza y el confort propio."</p>
      </div>

    </div>
  );
}