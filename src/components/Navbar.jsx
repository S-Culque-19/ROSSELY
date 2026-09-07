import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  ShoppingBag, 
  Search, 
  Shield, 
  LogOut, 
  User, 
  Sparkles, 
  LayoutDashboard, 
  Package, 
  Clock, 
  Eye, 
  ArrowRight,
  Truck 
} from 'lucide-react';

export default function Navbar({ busqueda, setBusqueda }) {
  const { 
    carrito, 
    usuarioActual, 
    esAdmin, 
    cerrarSesion, 
    navegarA, 
    currentView, 
    productos = [], 
    pedidos = [] 
  } = useStore();
  
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Telemetría en vivo
  const totalPrendas = productos.length;
  const pedidosPendientes = pedidos.filter(p => p.estado === 'Pendiente' || p.estado === 'Pendiente de Verificación').length;

  return (
    <header className="sticky top-0 z-50 w-full shadow-xs">
      
      {/* 1. GOD BAR SUPERIOR (SOLO ADMIN) */}
      {esAdmin ? (
        <div className="w-full bg-[#1C1819] text-white py-2 px-6 md:px-16 border-b border-[#701A3B]/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-[0.22em] text-[10px] text-stone-200">
              <Eye className="w-3.5 h-3.5 text-[#F8D7E0]" />
              <span>Modo Supervisión en Vivo</span>
            </div>
            <span className="hidden sm:inline-block text-stone-600">|</span>
            <span className="hidden sm:inline-block text-[10px] tracking-wider text-stone-400 font-light">
              Taller Nuevo Chimbote
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <div className="hidden md:flex items-center gap-1.5 text-stone-300">
              <Package className="w-3.5 h-3.5 text-[#A24869]" />
              <span>Prendas:</span>
              <span className="font-bold text-white bg-stone-800/80 px-2 py-0.5 rounded-md border border-stone-700">
                {totalPrendas}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-stone-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Por Atender:</span>
              <span className="font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-800/60">
                {pedidosPendientes}
              </span>
            </div>

            <button
              onClick={() => navegarA('admin')}
              className="bg-[#701A3B] hover:bg-[#8D254C] text-white text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition duration-200 cursor-pointer shadow-xs"
            >
              <LayoutDashboard className="w-3 h-3" />
              <span>Panel Gestor</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        /* Cintillo Oficial con Origen y Logística */
        <div className="w-full bg-[#701A3B] text-white text-[10px] sm:text-[11px] py-2 px-6 md:px-16 text-center font-medium tracking-[0.2em] uppercase flex items-center justify-center gap-2">
          <span>✦ Confeccionado en Nuevo Chimbote • Envíos a todo el Perú vía Shalom ✦</span>
        </div>
      )}

      {/* 2. BARRA DE NAVEGACIÓN PRINCIPAL */}
      <div className="w-full bg-white/95 backdrop-blur-md border-b border-[#FCE4EC] px-6 sm:px-10 md:px-16 py-4 flex items-center justify-between gap-6">
        
        {/* Logotipo */}
        <div 
          className="flex flex-col cursor-pointer select-none group shrink-0" 
          onClick={() => navegarA('home')}
        >
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-black tracking-[0.3em] text-[#701A3B] group-hover:opacity-90 transition">
              ROSSELY
            </span>
            {esAdmin && (
              <span className="bg-[#1C1819] text-[#F8D7E0] text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border border-[#701A3B]/40">
                Admin
              </span>
            )}
          </div>
          <span className="text-[9px] uppercase tracking-[0.35em] text-[#A24869] font-medium -mt-1">
            Sleepwear & Silk
          </span>
        </div>

        {/* Menú Editorial */}
        <nav className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-[0.2em] font-semibold text-stone-600">
          <button 
            onClick={() => navegarA('home')}
            className={`hover:text-[#701A3B] transition cursor-pointer ${currentView === 'home' ? 'text-[#701A3B] font-bold' : ''}`}
          >
            Inicio
          </button>
          <button 
            onClick={() => navegarA('catalog')}
            className={`hover:text-[#701A3B] transition cursor-pointer ${currentView === 'catalog' ? 'text-[#701A3B] font-bold' : ''}`}
          >
            Colección
          </button>
          <button 
            onClick={() => navegarA('community')}
            className={`hover:text-[#701A3B] transition cursor-pointer flex items-center gap-1.5 ${currentView === 'community' ? 'text-[#701A3B] font-bold' : ''}`}
          >
            <Sparkles className="w-3 h-3 text-[#701A3B]" />
            <span>Comunidad</span>
          </button>
        </nav>

        {/* Buscador */}
        <div className="flex-1 max-w-xs xl:max-w-md mx-2 hidden md:block">
          <div className="relative flex items-center bg-[#FDF5F7] border border-[#F8D7E0] rounded-full px-4 py-2">
            <Search className="w-4 h-4 text-[#A24869] mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Buscar modelos de satén..." 
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                navegarA('catalog');
              }}
              className="w-full text-xs text-stone-800 bg-transparent outline-none placeholder:text-stone-400 font-light"
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-5 text-xs font-medium shrink-0">
          
          <button 
            onClick={() => navegarA('community')}
            className="lg:hidden text-[11px] font-bold uppercase tracking-wider text-[#701A3B] px-3 py-1.5 rounded-full bg-[#FDF5F7] border border-[#F8D7E0]"
          >
            Comunidad
          </button>

          {usuarioActual ? (
            <div className="relative">
              <button 
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="flex items-center gap-2 text-[#701A3B] bg-[#FDF5F7] border border-[#F8D7E0] px-4 py-2 rounded-full cursor-pointer hover:bg-[#FCE4EC]/50 transition"
              >
                {esAdmin ? <Shield className="w-4 h-4 text-[#701A3B]" /> : <User className="w-4 h-4" />}
                <span className="font-semibold">{usuarioActual.nombre.split(' ')[0]}</span>
                <span className="text-[10px]">▾</span>
              </button>

              {menuAbierto && (
                <div className="absolute right-0 top-12 bg-white text-stone-800 rounded-2xl shadow-xl py-2 w-56 z-50 border border-[#FCE4EC]">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="font-semibold text-stone-900 text-xs">{usuarioActual.nombre}</p>
                    <p className="text-[10px] text-[#A24869] font-medium">{usuarioActual.email}</p>
                  </div>

                  {esAdmin && (
                    <button 
                      onClick={() => { navegarA('admin'); setMenuAbierto(false); }}
                      className="w-full text-left px-4 py-2.5 font-semibold text-[#701A3B] hover:bg-[#FDF5F7] flex items-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" /> Panel Gestor
                    </button>
                  )}

                  <button 
                    onClick={() => { cerrarSesion(); setMenuAbierto(false); }}
                    className="w-full text-left px-4 py-2.5 text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => navegarA('auth')}
              className="text-[#701A3B] hover:text-stone-900 tracking-wider uppercase font-semibold text-[11px] cursor-pointer"
            >
              Iniciar Sesión
            </button>
          )}

          {/* Bolsa de Compras */}
          {esAdmin ? (
            <div 
              className="relative p-2 text-stone-400 cursor-not-allowed group"
              title="Compras restringidas en Modo Supervisión"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              <span className="absolute -top-1 -right-1 bg-stone-800 text-[#F8D7E0] text-[8px] font-bold px-1.5 py-0.2 rounded-full border border-stone-600">
                Eye
              </span>
            </div>
          ) : (
            <button 
              onClick={() => navegarA('cart')}
              className="relative p-2 text-[#701A3B] hover:scale-105 transition cursor-pointer"
              title="Bolsa de Compras"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {carrito.length > 0 && (
                <span className="absolute top-0 right-0 bg-[#701A3B] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {carrito.length}
                </span>
              )}
            </button>
          )}

        </div>

      </div>
    </header>
  );
}