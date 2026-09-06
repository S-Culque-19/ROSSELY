import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  ShoppingBag, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  PackageOpen, 
  Settings, 
  SlidersHorizontal, 
  Lock 
} from 'lucide-react';

export default function HomeView() {
  const { productos, cargandoProductos, agregarAlCarrito, navegarA, esAdmin } = useStore();

  const colecciones = [
    { nombre: 'Pijamas de Satín', tag: 'Seda & Satén', desc: 'Sets de 2 piezas suaves y ribeteados' },
    { nombre: 'Batas & Kimonos', tag: 'Elegance Nude', desc: 'Prendas envolventes con lazo regulable' },
    { nombre: 'Lencería Fina', tag: 'Romance Lace', desc: 'Encajes florales y cortes anatómicos' }
  ];

  return (
    <div className="w-full space-y-16 py-6 px-6 sm:px-10 md:px-16 font-sans">
      
      {/* 1. HERO BANNER FULL-WIDTH */}
      <section className="w-full rounded-3xl overflow-hidden border border-[#F8D7E0]/80 bg-gradient-to-r from-[#FFFBFB] via-[#FDF5F7] to-[#FAF0F3] shadow-xs relative">
        
        {/* Marca de agua de supervisión */}
        {esAdmin && (
          <div className="absolute top-4 right-4 bg-[#1C1819]/80 backdrop-blur-md text-[#F8D7E0] border border-[#701A3B]/50 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
            <Lock className="w-3 h-3 text-[#A24869]" /> Vista Preliminar de Clientes
          </div>
        )}

        <div className="py-16 sm:py-24 px-8 sm:px-16 text-center max-w-3xl mx-auto space-y-5">
          <span className="inline-block bg-white text-[#701A3B] border border-[#F8D7E0] text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] px-4 py-1.5 rounded-full uppercase">
            Colección ROSSELY 2026
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-stone-900 tracking-tight leading-[1.15]">
            Prendas de descanso confeccionadas con suavidad y diseño exclusivo
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto font-light leading-relaxed">
            Piezas concebidas por ROSSELY para transformar tus noches y momentos de calma en una experiencia de lujo íntimo y confort.
          </p>

          <div className="pt-4 flex justify-center gap-4">
            <button 
              onClick={() => navegarA('catalog')}
              className="bg-[#701A3B] hover:bg-[#56132D] text-white text-[11px] uppercase font-bold tracking-[0.2em] px-9 py-4 rounded-full shadow-sm transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              Explorar Colección →
            </button>
            {esAdmin && (
              <button 
                onClick={() => navegarA('admin')}
                className="bg-[#1C1819] hover:bg-stone-800 text-stone-200 border border-stone-700 text-[11px] uppercase font-bold tracking-[0.2em] px-6 py-4 rounded-full shadow-sm transition cursor-pointer flex items-center gap-2"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#F8D7E0]" /> Administrar
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. CATEGORÍAS EDITORIALES */}
      <section className="w-full">
        <div className="text-center mb-10">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#A24869] font-bold block mb-1">
            Categorías ROSSELY
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 tracking-tight">
            Diseñadas para tu Descanso
          </h2>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {colecciones.map((col) => (
            <div 
              key={col.nombre}
              onClick={() => navegarA('catalog')}
              className="bg-white border border-[#FCE4EC] hover:border-[#701A3B]/40 p-8 sm:p-10 rounded-3xl cursor-pointer shadow-xs hover:shadow-md transition duration-300 text-center space-y-3 group"
            >
              <span className="text-[9px] uppercase tracking-[0.25em] text-stone-400 font-bold block">
                {col.tag}
              </span>
              <h3 className="font-serif text-xl font-bold text-stone-900">{col.nombre}</h3>
              <p className="text-xs text-stone-500 font-light">{col.desc}</p>
              <span className="inline-flex items-center text-xs font-semibold text-[#701A3B] pt-2 group-hover:underline">
                Descubrir modelos <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. BENEFICIOS EXCLUSIVOS */}
      <section className="w-full grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
        {[
          { title: "Despacho Rápido", sub: "Cobertura Lima & Provincias", icon: <Truck className="w-5 h-5 text-[#701A3B]" /> },
          { title: "Garantía de Talla", sub: "Cambios simples y asesorados", icon: <RefreshCw className="w-5 h-5 text-[#701A3B]" /> },
          { title: "Pagos Verificados", sub: "Yape, Plin y cuentas directas", icon: <ShieldCheck className="w-5 h-5 text-[#701A3B]" /> },
          { title: "Empaque ROSSELY", sub: "Presentación de regalo satinada", icon: <Sparkles className="w-5 h-5 text-[#701A3B]" /> },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-[#FCE4EC] shadow-xs flex flex-col items-center">
            <div className="mb-2.5 p-2.5 bg-[#FDF5F7] rounded-xl">{item.icon}</div>
            <p className="text-xs sm:text-sm font-semibold text-stone-800">{item.title}</p>
            <p className="text-[10px] sm:text-xs text-stone-400 mt-0.5 font-light">{item.sub}</p>
          </div>
        ))}
      </section>

      {/* 4. CATÁLOGO EN TIEMPO REAL */}
      <section className="w-full">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 mb-8 border-b border-[#FCE4EC] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#A24869] font-bold block">
                Catálogo Oficial
              </span>
              {esAdmin && (
                <span className="bg-[#1C1819] text-[#F8D7E0] text-[9px] font-mono px-2 py-0.5 rounded border border-[#701A3B]/40">
                  Total: {productos.length} prendas
                </span>
              )}
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 tracking-tight mt-1">
              Prendas Activas ROSSELY
            </h2>
          </div>
          <button 
            onClick={() => navegarA('catalog')} 
            className="text-xs font-semibold text-[#701A3B] hover:underline uppercase tracking-wider self-start sm:self-auto"
          >
            Ver Todo el Catálogo →
          </button>
        </div>

        {cargandoProductos ? (
          <div className="w-full bg-white p-16 rounded-3xl border border-[#FCE4EC] text-center text-xs text-stone-400">
            Sincronizando colección ROSSELY en tiempo real...
          </div>
        ) : productos.length === 0 ? (
          <div className="w-full bg-white p-16 rounded-3xl border border-[#FCE4EC] text-center space-y-3">
            <PackageOpen className="w-12 h-12 text-[#A24869] mx-auto opacity-70" />
            <h3 className="font-serif text-lg font-bold text-stone-800">El catálogo está listo</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto font-light">
              Publica artículos desde el panel de administración y aparecerán de inmediato aquí.
            </p>
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
            {productos.map(prod => (
              <ProductCardRossely 
                key={prod.id} 
                producto={prod} 
                onSelect={() => navegarA('detail', prod)} 
                onAdd={agregarAlCarrito} 
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

function ProductCardRossely({ producto, onSelect, onAdd }) {
  const { esAdmin, navegarA } = useStore();
  const [talla, setTalla] = useState(producto.tallas?.[0] || 'M');

  return (
    <div className={`w-full bg-white border rounded-3xl overflow-hidden transition duration-300 flex flex-col justify-between group ${
      esAdmin ? 'border-[#701A3B]/30 shadow-xs hover:border-[#701A3B]' : 'border-[#FCE4EC] hover:shadow-md'
    }`}>
      
      {/* Contenedor Fotográfico */}
      <div 
        className="relative h-72 sm:h-80 bg-[#FDF5F7] flex items-center justify-center cursor-pointer overflow-hidden border-b border-[#FCE4EC]/50" 
        onClick={onSelect}
      >
        <span className="absolute top-3 left-3 bg-[#701A3B] text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full z-10 shadow-xs">
          ROSSELY
        </span>

        {/* Telemetría Admin Flotante */}
        {esAdmin && (
          <div className="absolute top-3 right-3 z-10 bg-[#1C1819]/90 backdrop-blur-md text-[#F8D7E0] border border-[#701A3B]/40 text-[9px] font-mono px-2 py-1 rounded-lg flex items-center gap-1 shadow-xs">
            <span>Stock: {producto.stock ?? 'Infinito'}</span>
          </div>
        )}
        
        {producto.img ? (
          <img 
            src={producto.img} 
            alt={producto.nombre} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
          />
        ) : (
          <div className="text-center p-4">
            <span className="text-3xl opacity-80">🎀</span>
            <p className="text-[10px] font-bold text-[#701A3B] uppercase tracking-widest mt-2">
              {producto.categoria}
            </p>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#A24869]">
              {producto.categoria}
            </span>
            {esAdmin && (
              <span className="text-[9px] font-mono text-stone-400">
                #{producto.id ? producto.id.slice(0, 6) : 'DOC'}
              </span>
            )}
          </div>

          <h4 
            onClick={onSelect} 
            className="font-serif font-bold text-sm text-stone-900 hover:text-[#701A3B] cursor-pointer mt-1 line-clamp-1"
          >
            {producto.nombre}
          </h4>
          
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-lg font-bold text-[#701A3B]">
              S/. {parseFloat(producto.precio || 0).toFixed(2)}
            </p>
            {producto.precioOferta && (
              <p className="text-xs text-stone-400 line-through">
                S/. {parseFloat(producto.precioOferta).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {/* Tallas Disponibles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-stone-400 mr-1 font-medium">Talla:</span>
          {(producto.tallas || ['S', 'M', 'L']).map(t => (
            <button
              key={t}
              onClick={() => setTalla(t)}
              className={`px-2.5 py-0.5 text-xs rounded-lg border transition cursor-pointer ${
                talla === t
                  ? 'border-[#701A3B] bg-[#701A3B] text-white font-medium'
                  : 'border-[#F8D7E0] text-stone-600 hover:border-[#701A3B]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Botón de Acción según Rol */}
        {esAdmin ? (
          /* Botón de Gestión con Poder Administrativo */
          <button 
            onClick={() => navegarA('admin')}
            className="w-full bg-[#1C1819] hover:bg-[#701A3B] text-white border border-stone-800 hover:border-[#701A3B] font-semibold py-3 rounded-xl text-[10px] uppercase tracking-widest transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            title="Ir al panel para modificar fotos, tallas, precios o stock"
          >
            <Settings className="w-3.5 h-3.5 text-[#F8D7E0]" />
            <span>Gestionar en Inventario</span>
          </button>
        ) : (
          /* Botón para Clientes Comunes */
          <button 
            onClick={() => onAdd(producto, talla)}
            className="w-full bg-[#221F20] hover:bg-[#701A3B] text-white font-bold py-3 rounded-xl text-[11px] uppercase tracking-widest transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Agregar a la Bolsa
          </button>
        )}
      </div>
    </div>
  );
}