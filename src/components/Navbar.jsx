import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Search, Shield, LogOut, User } from 'lucide-react';

export default function Navbar({ busqueda, setBusqueda }) {
  const { carrito, usuarioActual, esAdmin, cerrarSesion, navegarA } = useStore();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#FCE4EC] shadow-xs">
      {/* Cintillo Superior */}
      <div className="w-full bg-[#701A3B] text-white text-[10px] sm:text-[11px] py-2 px-6 md:px-16 text-center font-medium tracking-[0.2em] uppercase">
        {esAdmin 
          ? '✦ Sesión Administrativa ROSSELY • Modo Gestión ✦' 
          : '✦ Envíos a todo el Perú • Prendas confeccionadas en satín exclusivo ROSSELY ✦'}
      </div>

      {/* Contenedor Principal Full-Width */}
      <div className="w-full px-6 sm:px-10 md:px-16 py-4 flex items-center justify-between gap-6">
        
        {/* Logotipo Oficial */}
        <div 
          className="flex flex-col cursor-pointer select-none group" 
          onClick={() => navegarA(esAdmin ? 'admin' : 'home')}
        >
          <span className="font-serif text-2xl sm:text-3xl font-black tracking-[0.3em] text-[#701A3B] group-hover:opacity-90 transition">
            ROSSELY
          </span>
          <span className="text-[9px] uppercase tracking-[0.35em] text-[#A24869] font-medium -mt-1">
            Sleepwear & Silk
          </span>
        </div>

        {/* Buscador Minimalista */}
        {!esAdmin && (
          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative flex items-center bg-[#FDF5F7] border border-[#F8D7E0] rounded-full px-5 py-2">
              <Search className="w-4 h-4 text-[#A24869] mr-3 shrink-0" />
              <input 
                type="text" 
                placeholder="Buscar pijamas, batas envolventes, lencería en ROSSELY..." 
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  navegarA('catalog');
                }}
                className="w-full text-xs text-stone-800 bg-transparent outline-none placeholder:text-stone-400 font-light"
              />
            </div>
          </div>
        )}

        {/* Acciones de Usuario */}
        <div className="flex items-center gap-6 text-xs font-medium shrink-0">
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
                <div className="absolute right-0 top-12 bg-white text-stone-800 rounded-2xl shadow-xl py-2 w-52 z-50 border border-[#FCE4EC]">
                  <p className="px-4 py-2 font-semibold border-b border-stone-100 text-stone-900 text-xs">
                    {usuarioActual.nombre}
                  </p>
                  {esAdmin && (
                    <button 
                      onClick={() => { navegarA('admin'); setMenuAbierto(false); }}
                      className="w-full text-left px-4 py-2.5 font-medium text-[#701A3B] hover:bg-[#FDF5F7] flex items-center gap-2 cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5" /> Panel Administrativo
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

          {/* Bolsa de Compras (Oculta al Admin) */}
          {!esAdmin && (
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