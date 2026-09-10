import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, ArrowRight, ShieldCheck, Coins } from 'lucide-react';

export default function CatalogView() {
  const { productos, agregarAlCarrito, usuarioActual, registrarPedidoConPuntos } = useStore();
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [cargandoCompra, setCargandoCompra] = useState(false);

  const esPremium = usuarioActual?.suscripcion?.tipo === 'premium';
  const puntosUsuario = usuarioActual?.puntos || 0;

  const categorias = ['Todas', 'Pijamas', 'Batas', 'Lencería', 'Accesorios'];
  const productosFiltrados = categoriaFiltro === 'Todas' 
    ? productos 
    : productos.filter(p => p.categoria?.toLowerCase() === categoriaFiltro.toLowerCase());

  const handleComprarConPuntosDirecto = async (p) => {
    const precioSoles = parseFloat(p.precio || 0);
    const puntosRequeridos = Math.ceil(precioSoles * 8);

    if (puntosUsuario < puntosRequeridos) {
      alert(`Puntos insuficientes. Necesitas ${puntosRequeridos} puntos y tu saldo actual es de ${puntosUsuario} pts.`);
      return;
    }

    if (confirm(`¿Deseas canjear "${p.nombre}" por ${puntosRequeridos} Puntos al instante?`)) {
      setCargandoCompra(true);
      try {
        // Añadimos temporalmente el producto al carrito para procesar la transacción autónoma
        agregarAlCarrito(p, p.tallas?.[0] || 'M');
        const idPedido = await registrarPedidoConPuntos();
        if (idPedido) {
          alert(`✦ ¡Compra con divisa de puntos exitosa! Pedido #${idPedido.slice(0, 8)} registrado con estatus Verificado.`);
        }
      } catch (err) {
        console.error(err);
        alert("Error al procesar el pago con puntos.");
      } finally {
        setCargandoCompra(false);
      }
    }
  };

  return (
    <div className="w-full min-h-screen py-10 px-6 sm:px-10 md:px-16 bg-[#FFF5F7] font-sans space-y-12">
      
      {/* Banner Superior de Divisa si es Premium */}
      {esPremium && (
        <div className="bg-[#1C1819] text-[#D4AF37] border border-[#D4AF37]/50 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <Coins className="w-6 h-6 text-[#D4AF37]" />
            <div>
              <p className="font-bold text-xs uppercase tracking-widest">Modo Divisa Club de Seda Activado (1 Sol = 8 Puntos)</p>
              <p className="text-[11px] text-stone-300">Tienes <strong>{puntosUsuario} Puntos</strong> disponibles para canjear prendas al instante sin trámites.</p>
            </div>
          </div>
        </div>
      )}

      {/* Portada Editorial */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#FDF5F7] via-[#F8D7E0]/35 to-[#FFF5F7] border border-[#F8D7E0] p-8 sm:p-14 text-center space-y-4 shadow-sm">
        <span className="inline-flex items-center gap-1.5 bg-white text-[#701A3B] border border-[#F8D7E0] text-[10px] uppercase tracking-[0.3em] px-4 py-1.5 rounded-full font-bold">
          <Sparkles className="w-3.5 h-3.5" /> Colección Exclusiva • Atelier ROSSELY
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#701A3B]">
          {esPremium ? 'Tienda Club de Seda (Divisa Puntos)' : 'El Confort de la Seda & Elegancia'}
        </h1>

        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaFiltro(cat)}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer border ${
                categoriaFiltro === cat ? 'bg-[#701A3B] text-white border-[#701A3B]' : 'bg-white text-stone-700 border-[#F8D7E0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {productosFiltrados.map(p => {
          const precioSoles = parseFloat(p.precio || 0);
          const puntosCalculados = Math.ceil(precioSoles * 8);

          return (
            <div key={p.id} className="bg-[#FDFBFB] border border-[#F8D7E0] rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition flex flex-col justify-between">
              <div className="relative w-full h-80 overflow-hidden bg-[#FDF5F7]">
                <img src={p.img} alt={p.nombre} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 bg-white/90 text-[#701A3B] text-[9px] font-bold px-2.5 py-1 rounded-full">
                  {p.categoria || 'Seda'}
                </span>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#701A3B]">{p.nombre}</h3>
                  <p className="text-[11px] text-stone-600 italic mt-1">"{p.descripcion || 'Elegancia atemporal.'}"</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#F8D7E0]/60">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] font-bold uppercase text-stone-400">Precio</span>
                    <span className="text-lg font-black text-[#701A3B]">
                      {esPremium ? `${puntosCalculados} Pts` : `S/. ${precioSoles.toFixed(2)}`}
                    </span>
                  </div>

                  {esPremium ? (
                    <button
                      onClick={() => handleComprarConPuntosDirecto(p)}
                      disabled={cargandoCompra}
                      className="w-full bg-[#1C1819] hover:bg-[#D4AF37] hover:text-stone-900 text-[#D4AF37] py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition flex items-center justify-center gap-2 cursor-pointer border border-[#D4AF37]/50"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Canjear con Puntos</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => agregarAlCarrito(p, p.tallas?.[0] || 'M')}
                      className="w-full bg-[#701A3B] hover:bg-[#56132D] text-white py-3 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Adquirir Prenda</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}