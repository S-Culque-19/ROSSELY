import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';

export default function CatalogView({ busqueda = '' }) {
  const { productos, agregarAlCarrito, navegarA } = useStore();
  const [categoria, setCategoria] = useState('Todas');
  const [orden, setOrden] = useState('popular');

  const categorias = ['Todas', 'Pijamas', 'Batas', 'Lencería'];

  const productosFiltrados = productos
    .filter(p => categoria === 'Todas' ? true : p.categoria === categoria)
    .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      if (orden === 'menor') return a.precio - b.precio;
      if (orden === 'mayor') return b.precio - a.precio;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Filtros Horizontales */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Catálogo de Artículos</h1>
          <p className="text-xs text-gray-500">Mostrando prendas exclusivas ROSSELY</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${categoria === cat ? 'bg-[#E6007E] text-white shadow' : 'text-gray-600 hover:text-black'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <select 
            value={orden} 
            onChange={(e) => setOrden(e.target.value)}
            className="p-2 text-xs border rounded-lg bg-white text-gray-700 outline-none"
          >
            <option value="popular">Más Populares</option>
            <option value="menor">Precio: Menor a Mayor</option>
            <option value="mayor">Precio: Mayor a Menor</option>
          </select>
        </div>
      </div>

      {/* Grid de Productos Horizontal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productosFiltrados.map(p => (
          <div key={p.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="relative cursor-pointer" onClick={() => navegarA('detail', p)}>
              <span className="absolute top-2 right-2 bg-[#E6007E] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                -30%
              </span>
              <img src={p.img} alt={p.nombre} className="w-full h-64 object-cover" />
            </div>

            <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">{p.categoria}</span>
                <h4 onClick={() => navegarA('detail', p)} className="font-bold text-sm text-gray-800 hover:text-[#E6007E] cursor-pointer mt-0.5 line-clamp-1">
                  {p.nombre}
                </h4>
                <p className="text-lg font-black text-[#E6007E] mt-1">S/. {p.precio.toFixed(2)}</p>
                <p className="text-[10px] text-gray-400 line-through">S/. {(p.precio * 1.3).toFixed(2)}</p>
              </div>

              <button 
                onClick={() => agregarAlCarrito(p, 'M')}
                className="w-full bg-[#262626] hover:bg-black text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition"
              >
                + Añadir a la Bolsa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}