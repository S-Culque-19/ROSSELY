import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Search, User, Crown, LogOut, Menu, X } from 'lucide-react';

export default function Navbar({ busqueda, setBusqueda }) {
  const { usuarioActual, carrito, navegarA, cerrarSesion, esAdmin } = useStore();

  const totalItemsCarrito = carrito.reduce((acc, it) => acc + (it.cantidad || 1), 0);

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#F8D7E0] font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 h-20 flex items-center justify-between gap-4">
        
        {/* Logo de la Marca */}
        <div className="cursor-pointer flex items-center gap-2" onClick={() => navegarA('home')}>
          <h1 className="font-serif text-2xl tracking-[0.25em] text-stone-900 font-bold">ROSSELY</h1>
          <span className="text-[9px] uppercase tracking-widest text-[#701A3B] hidden sm:inline-block font-semibold">Sleepwear & Silk</span>
        </div>

        {/* Barra de Búsqueda */}
        <div className="hidden md:flex flex-1 max-w-md mx-6 relative items-center">
          <Search className="w-4 h-4 text-stone-400 absolute left-4" />
          <input 
            type="text" 
            placeholder="Buscar modelos de satén..." 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
            className="w-full bg-white border border-[#F8D7E0] rounded-full pl-11 pr-4 py-2 text-xs text-stone-800 outline-none shadow-xs focus:border-[#701A3B]"
          />
        </div>

        {/* Navegación */}
        <div className="flex items-center gap-4">
          <button onClick={() => navegarA('home')} className="hidden lg:block text-xs font-bold text-stone-700 hover:text-[#701A3B]">Inicio</button>
          <button onClick={() => navegarA('catalog')} className="hidden lg:block text-xs font-bold text-stone-700 hover:text-[#701A3B]">Colección</button>
          
          {/* La Membresía S/. 60 SOLO se muestra a clientes, NO al administrador */}
          {!esAdmin && (
            <button onClick={() => navegarA('suscripcion')} className="hidden lg:block text-xs font-bold text-[#701A3B] flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-[#D4AF37]" /> Membresía S/.60
            </button>
          )}

          {usuarioActual ? (
            <div className="flex items-center gap-3">
              {esAdmin && (
                <button onClick={() => navegarA('admin')} className="bg-[#701A3B] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer">
                  Panel Gestor
                </button>
              )}
              <button onClick={cerrarSesion} className="p-2 text-stone-600 hover:text-rose-600 rounded-xl" title="Cerrar Sesión">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => navegarA('auth')} className="bg-[#701A3B] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs">
              <User className="w-3.5 h-3.5" /> Iniciar Sesión
            </button>
          )}

          {/* Carrito */}
          <button onClick={() => navegarA('cart')} className="relative p-2.5 bg-white border border-[#F8D7E0] rounded-xl text-stone-800 hover:border-[#701A3B] cursor-pointer">
            <ShoppingBag className="w-4 h-4 text-[#701A3B]" />
            {totalItemsCarrito > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#701A3B] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {totalItemsCarrito}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}