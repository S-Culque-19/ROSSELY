import React from 'react';
import { useStore } from '../context/StoreContext';
import { Wallet, Sparkles, Bell, Shield } from 'lucide-react';

export default function LoyaltyWalletCard() {
  const { usuarioActual, avisosGlobales, esAdmin } = useStore();

  // Si no hay usuario registrado o SI ES ADMIN, NO se muestra la tarjeta de cliente
  if (!usuarioActual || esAdmin) return null;

  const esPremium = usuarioActual?.suscripcion?.tipo === 'premium';
  const puntos = usuarioActual?.puntos || 0;

  // Filtrar avisos según si el cliente es premium o general
  const avisosRelevantes = avisosGlobales.filter(a => a.destinatario === 'todos' || (a.destinatario === 'premium' && esPremium));
  const ultimoAviso = avisosRelevantes[0];

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-sm w-full bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-[#F8D7E0] shadow-2xl space-y-4 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[#701A3B]" />
          <span className="font-serif font-bold text-xs uppercase tracking-wider text-stone-900">Wallet Digital ROSSELY</span>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FAF7F2] text-[#701A3B] border border-[#F8D7E0]">
          {esPremium ? 'Club Premium' : 'Cliente General'}
        </span>
      </div>

      {/* Tarjeta de Fidelización */}
      <div className="bg-gradient-to-r from-[#1C1819] to-[#3a262d] text-[#F8D7E0] p-4 rounded-2xl space-y-2 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="flex justify-between items-center">
          <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">Tarjeta de Fidelización</p>
          <Shield className="w-4 h-4 text-[#D4AF37]" />
        </div>
        <p className="font-serif text-sm font-bold text-white">{usuarioActual.nombre}</p>
        <div className="flex justify-between items-end pt-1">
          <span className="text-[11px] text-stone-300">Puntos Acumulados</span>
          <span className="font-mono text-lg font-bold text-[#D4AF37]">{puntos} Pts</span>
        </div>
      </div>

      {/* Notificaciones y Avisos Exclusivos enviados por la Administración */}
      {ultimoAviso && (
        <div className="bg-[#FFFBFB] p-3 rounded-2xl border border-[#F8D7E0] flex items-start gap-3">
          <Bell className="w-4 h-4 text-[#701A3B] shrink-0 mt-0.5 animate-bounce" />
          <div className="text-[11px] space-y-0.5">
            <p className="font-bold text-stone-900">{ultimoAviso.titulo}</p>
            <p className="text-stone-600 line-clamp-2">{ultimoAviso.mensaje}</p>
          </div>
        </div>
      )}
    </div>
  );
}