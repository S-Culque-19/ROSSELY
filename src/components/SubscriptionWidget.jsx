import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Crown, Sparkles, X, ArrowRight } from 'lucide-react';

export default function SubscriptionWidget() {
  const { usuarioActual, navegarA } = useStore();
  const [minimizado, setMinimizado] = useState(false);

  // Si ya es admin o ya tiene suscripción premium activa, no se muestra este banner flotante
  if (usuarioActual?.role === 'admin' || usuarioActual?.suscripcion?.tipo === 'premium') {
    return null;
  }

  if (minimizado) {
    return (
      <button 
        onClick={() => setMinimizado(false)}
        className="fixed bottom-6 left-6 z-40 bg-[#701A3B] text-[#F8D7E0] p-3.5 rounded-2xl shadow-xl flex items-center gap-2 border border-[#D4AF37]/50 cursor-pointer hover:scale-105 transition-transform"
      >
        <Crown className="w-5 h-5 text-[#D4AF37]" />
        <span className="text-xs font-bold uppercase tracking-wider">Club de Seda S/. 60</span>
      </button>
    );
  }

  return (
    <aside className="fixed bottom-6 left-6 z-40 max-w-sm w-full animate-fade-in font-sans">
      <div className="bg-gradient-to-br from-[#1C1819] via-[#3a262d] to-[#701A3B] text-[#F8D7E0] p-5 rounded-3xl border border-[#D4AF37]/40 shadow-2xl relative overflow-hidden space-y-3">
        {/* Destello de fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            <Crown className="w-3.5 h-3.5 text-[#D4AF37]" /> Exclusivo ROSSELY
          </div>
          <button 
            onClick={() => setMinimizado(true)} 
            className="text-stone-400 hover:text-white p-1 transition cursor-pointer"
            title="Minimizar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h4 className="font-serif text-base font-bold text-white">Membresía Premium (S/. 60 / mes)</h4>
          <p className="text-[11px] text-stone-300 mt-1 leading-relaxed">
            Desbloquea acumulación de puntos dobles (8 pts = S/. 1.00), empaquetado en caja de alta costura y acceso a ruletas de premios semanales.
          </p>
        </div>

        <button 
          onClick={() => navegarA('suscripcion')}
          className="w-full bg-[#D4AF37] text-stone-900 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md hover:bg-[#c29e2f] transition"
        >
          <span>Afiliarme Ahora</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}