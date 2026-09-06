import React from 'react';
import { useStore } from '../context/StoreContext';

export default function CartView() {
  const { carrito, removerDelCarrito, usuarioActual, navegarA } = useStore();

  const subtotal = carrito.reduce((acc, item) => acc + item.precio, 0);
  const total = subtotal;

  const handleContinuarCompra = () => {
    if (!usuarioActual) {
      navegarA('auth');
    } else {
      navegarA('checkout');
    }
  };

  if (carrito.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto py-16 px-4 text-center">
        <div className="bg-white border border-pink-100 rounded-3xl p-12 shadow-sm max-w-xl mx-auto space-y-4">
          <span className="text-5xl">🛍️</span>
          <h2 className="text-2xl font-bold text-gray-900">Tu bolsa de compras está vacía</h2>
          <p className="text-xs text-gray-500">Explora nuestras colecciones y descubre prendas diseñadas para tu descanso.</p>
          <button 
            onClick={() => navegarA('catalog')}
            className="mt-4 bg-[#831843] hover:bg-[#9D174D] text-white font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl transition shadow-md"
          >
            Ir al Catálogo de Prendas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
      
      {/* Título de Sección y Conteo */}
      <div className="border-b border-pink-200 pb-4 flex justify-between items-baseline">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#831843]">
          Bolsa de Compras <span className="text-gray-400 font-normal text-lg">({carrito.length} {carrito.length === 1 ? 'producto' : 'productos'})</span>
        </h1>
        <button 
          onClick={() => navegarA('catalog')}
          className="text-xs text-[#9D174D] font-bold hover:underline"
        >
          ← Seguir comprando
        </button>
      </div>

      {/* Grid de 2 Columnas Grandes que Ocupa Toda la Pantalla */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Columna Izquierda (8 de 12): Listado Amplio de Artículos */}
        <div className="lg:col-span-8 bg-white border border-pink-100 rounded-3xl p-6 shadow-sm space-y-4">
          
          <div className="hidden sm:grid grid-cols-12 text-xs font-bold text-gray-400 uppercase border-b pb-3">
            <span className="col-span-6">Producto</span>
            <span className="col-span-2 text-center">Talla</span>
            <span className="col-span-2 text-right">Precio</span>
            <span className="col-span-2 text-center">Acción</span>
          </div>

          <div className="divide-y divide-gray-100">
            {carrito.map(item => (
              <div key={item.cartItemId} className="py-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                
                {/* Imagen y Nombre */}
                <div className="sm:col-span-6 flex gap-4 items-center">
                  <img 
                    src={item.img} 
                    alt={item.nombre} 
                    className="w-20 h-24 object-cover rounded-xl border border-pink-100 shadow-sm"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-[#BE185D] uppercase tracking-wider">{item.categoria}</span>
                    <h3 className="font-bold text-sm text-gray-900 leading-snug">{item.nombre}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Vendido por: <b>ROSSELY</b></p>
                  </div>
                </div>

                {/* Talla */}
                <div className="sm:col-span-2 text-left sm:text-center">
                  <span className="text-xs bg-pink-50 border border-pink-200 text-[#831843] font-extrabold px-3 py-1 rounded-lg">
                    Talla {item.tallaSeleccionada}
                  </span>
                </div>

                {/* Precio */}
                <div className="sm:col-span-2 text-left sm:text-right">
                  <p className="text-base font-black text-[#831843]">S/ {item.precio.toFixed(2)}</p>
                </div>

                {/* Botón Eliminar */}
                <div className="sm:col-span-2 text-left sm:text-center">
                  <button 
                    onClick={() => removerDelCarrito(item.cartItemId)}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                  >
                    Quitar
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Banner de Envío Gratis */}
          <div className="bg-pink-50/70 border border-pink-200 p-4 rounded-2xl flex items-center justify-between text-xs">
            <span className="font-bold text-[#831843]">✨ ¡Calificas para retiro gratis y despacho rápido a todo el país!</span>
            <span className="text-[10px] bg-white border border-pink-300 text-[#831843] font-black px-2 py-0.5 rounded">
              LLEGA MAÑANA
            </span>
          </div>

        </div>

        {/* Columna Derecha (4 de 12): Resumen de Pedido y Botón Continuar */}
        <div className="lg:col-span-4 bg-white border border-pink-100 rounded-3xl p-6 shadow-sm space-y-6 sticky top-28">
          
          <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
            Resumen de tu Bolsa
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({carrito.length} productos)</span>
              <span className="font-bold text-gray-900">S/ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Costo estimado de entrega</span>
              <span className="font-bold text-emerald-600">Gratis</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-black text-gray-900">
              <span>Total a Pagar:</span>
              <span className="text-[#831843] text-xl font-extrabold">S/ {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-[#FFF5F7] border border-pink-200 p-3.5 rounded-2xl text-[11px] text-[#831843] space-y-1">
            <p className="font-bold">💳 Métodos aceptados en el siguiente paso:</p>
            <p>• Yape directo (+51 971 490 117)</p>
            <p>• Transferencias directas BCP y BBVA</p>
          </div>

          <button 
            onClick={handleContinuarCompra}
            className="w-full bg-[#831843] hover:bg-[#6b1336] text-white py-4 rounded-2xl text-xs uppercase tracking-widest font-black shadow-lg hover:shadow-xl transition transform active:scale-95"
          >
            Continuar al Proceso de Pago →
          </button>

          <p className="text-[10px] text-gray-400 text-center">
            {usuarioActual ? `Sesión iniciada como ${usuarioActual.nombre}` : '* Se solicitará inicio de sesión antes de emitir tu boleta.'}
          </p>

        </div>

      </div>

    </div>
  );
}