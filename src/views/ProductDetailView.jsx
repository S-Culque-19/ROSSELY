import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';

export default function ProductDetailView() {
  const { selectedProduct, agregarAlCarrito, usuarioActual, productos, navegarA } = useStore();
  const [cantidad, setCantidad] = useState(1);
  const [tallaSel, setTallaSel] = useState('M');
  const [verMas, setVerMas] = useState(false);

  if (!selectedProduct) {
    navegarA('catalog');
    return null;
  }

  const handleComprarAhora = () => {
    for (let i = 0; i < cantidad; i++) {
      agregarAlCarrito(selectedProduct, tallaSel);
    }
    if (!usuarioActual) {
      navegarA('auth');
    } else {
      navegarA('checkout');
    }
  };

  const handleAgregarAlCarro = () => {
    for (let i = 0; i < cantidad; i++) {
      agregarAlCarrito(selectedProduct, tallaSel);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4">
      {/* 1. MÓDULO PRINCIPAL DE FICHA (3 COLUMNAS EXACTAS) */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Columna Izquierda: Galería y Foto Principal */}
        <div className="lg:col-span-5 flex gap-4">
          <div className="flex flex-col gap-2">
            {[selectedProduct.img, selectedProduct.img].map((img, i) => (
              <img 
                key={i} 
                src={img} 
                alt="miniatura" 
                className="w-16 h-20 object-cover rounded-md border border-[#E6007E] p-0.5 cursor-pointer"
              />
            ))}
          </div>
          <div className="flex-1 bg-white border border-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            <img src={selectedProduct.img} alt={selectedProduct.nombre} className="w-full h-[420px] object-cover" />
          </div>
        </div>

        {/* Columna Central: Badges, Nombre, Precio y Talla */}
        <div className="lg:col-span-4 space-y-4">
          {/* Badges superiores tipo Ripley */}
          <div className="flex gap-2 text-[10px] font-bold">
            <span className="bg-[#EBF5FF] text-[#1E429F] px-2.5 py-1 rounded">RETIRA GRATIS MAÑANA</span>
            <span className="bg-[#EBF5FF] text-[#1E429F] px-2.5 py-1 rounded">LLEGA MAÑANA</span>
          </div>

          <div>
            <p className="text-xs text-gray-500 font-semibold">ROSSELY</p>
            <h1 className="text-xl font-bold text-gray-900 uppercase leading-snug mt-0.5">
              {selectedProduct.nombre}
            </h1>
            <p className="text-[11px] text-gray-400 mt-1">Código de producto: {selectedProduct.id}8291</p>
            <p className="text-[11px] text-gray-500">Vendido por: <b className="text-gray-800">ROSSELY OFICIAL</b></p>
          </div>

          <div className="border-t border-b border-gray-100 py-3 space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-gray-500">Internet</span>
              <span className="text-2xl font-bold text-gray-900">S/ {selectedProduct.precio.toFixed(2)}</span>
            </div>
            <p className="text-[11px] text-gray-400">Paga con Yape al <b>+51 971 490 117</b> o BCP</p>
          </div>

          {/* Color y Talla */}
          <div className="space-y-3 pt-1">
            <div>
              <p className="text-xs text-gray-700">Color: <b className="text-gray-900">Rosé Clásico</b></p>
              <div className="w-6 h-6 rounded-full bg-[#E6007E] border-2 border-white shadow-sm mt-1"></div>
            </div>

            <div>
              <p className="text-xs text-gray-700 mb-1.5">Talla: <span className="text-gray-500">Selecciona Talla</span></p>
              <div className="flex gap-2">
                {["S", "M", "L", "XL"].map(t => (
                  <button
                    key={t}
                    onClick={() => setTallaSel(t)}
                    className={`w-11 h-9 rounded border text-xs font-semibold ${
                      tallaSel === t ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-700 bg-white hover:border-gray-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Cantidad, Botones y Caja de Entrega */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#FFFFFF] border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">Cantidad:</span>
              <div className="flex items-center border border-gray-300 rounded">
                <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="px-2 py-0.5 text-gray-600 hover:bg-gray-100">-</button>
                <span className="px-3 font-semibold text-gray-800">{cantidad}</span>
                <button onClick={() => setCantidad(cantidad + 1)} className="px-2 py-0.5 text-gray-600 hover:bg-gray-100">+</button>
              </div>
            </div>

            <button 
              onClick={handleComprarAhora}
              className="w-full btn-ripley-dark uppercase tracking-wide"
            >
              Comprar ahora
            </button>
            <button 
              onClick={handleAgregarAlCarro}
              className="w-full btn-ripley-outline uppercase tracking-wide"
            >
              Agregar al carro
            </button>
          </div>

          {/* Acordeón Opciones de Entrega */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white text-xs space-y-3">
            <div className="flex justify-between items-center font-bold text-gray-800">
              <span className="flex items-center gap-1.5">📍 Opciones de entrega</span>
              <span>▾</span>
            </div>

            <div className="p-2.5 border border-gray-200 rounded-lg space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">📦 Despacho a domicilio</span>
                <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.2 rounded font-semibold">Disponible</span>
              </div>
              <p className="text-[11px] text-gray-500">Recíbelo en la puerta de tu casa.</p>
            </div>

            <div className="p-2.5 border border-gray-200 rounded-lg space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">🏬 Puntos de retiro</span>
                <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.2 rounded font-semibold">Disponible</span>
              </div>
              <p className="text-[11px] text-gray-500">Retira sin costo en puntos seleccionados.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TABLA DE ESPECIFICACIONES (IDÉNTICA A LA CAPTURA 2) */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-bold text-gray-900">Especificaciones</h3>
        
        <div className="border border-gray-200 rounded-lg overflow-hidden text-xs">
          <div className="grid grid-cols-2 p-3 bg-gray-50 border-b border-gray-200">
            <span className="font-semibold text-gray-700">Marca</span>
            <span className="text-gray-800">ROSSELY</span>
          </div>
          <div className="grid grid-cols-2 p-3 bg-white border-b border-gray-200">
            <span className="font-semibold text-gray-700">Material</span>
            <span className="text-gray-800">Satín de Seda & Encaje Suave</span>
          </div>
          <div className="grid grid-cols-2 p-3 bg-gray-50 border-b border-gray-200">
            <span className="font-semibold text-gray-700">Tipo de producto</span>
            <span className="text-gray-800">{selectedProduct.categoria}</span>
          </div>
          <div className="grid grid-cols-2 p-3 bg-white border-b border-gray-200">
            <span className="font-semibold text-gray-700">Género</span>
            <span className="text-gray-800">Mujer</span>
          </div>
          {verMas && (
            <div className="grid grid-cols-2 p-3 bg-gray-50">
              <span className="font-semibold text-gray-700">Cuidado</span>
              <span className="text-gray-800">Lavado a mano con agua fría</span>
            </div>
          )}
        </div>

        <div className="text-center pt-2">
          <button 
            onClick={() => setVerMas(!verMas)}
            className="border border-gray-300 text-gray-700 font-semibold px-6 py-1.5 rounded-lg text-xs hover:bg-gray-50"
          >
            {verMas ? 'Ver menos' : 'Ver más'}
          </button>
        </div>
      </div>

      {/* 3. COMPARA PRODUCTOS SIMILARES (IDÉNTICO A LA CAPTURA 4) */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">COMPARA PRODUCTOS SIMILARES</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {productos.map(p => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col justify-between">
              <div className="relative">
                <span className="absolute top-0 right-0 bg-[#E6007E] text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                  -30%
                </span>
                <img src={p.img} alt={p.nombre} className="w-full h-32 object-cover rounded mt-2" />
              </div>
              <div className="mt-3 space-y-0.5">
                <p className="text-[10px] font-bold text-gray-800 uppercase">ROSSELY</p>
                <p className="text-xs text-gray-600 truncate">{p.nombre}</p>
                <p className="text-[11px] text-gray-400 line-through">S/ {(p.precio * 1.3).toFixed(2)}</p>
                <p className="text-xs font-bold text-[#E6007E]">S/ {p.precio.toFixed(2)}</p>
              </div>
              <button 
                onClick={() => agregarAlCarrito(p, 'M')}
                className="mt-3 w-full border border-purple-700 text-purple-700 hover:bg-purple-50 font-semibold py-1 rounded text-[11px]"
              >
                Agregar al Carro
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}