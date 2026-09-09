import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Crown, Sparkles, X, ShieldCheck, Gift, ArrowRight } from 'lucide-react';

export default function SubscriptionBannerWidget() {
  const { usuarioActual, navegarA } = useStore();
  const [minimizado, setMinimizado] = useState(false);

  // Si ya es admin o ya tiene suscripción premium activa, no se muestra este banner de invitación
  if (usuarioActual?.role === 'admin' || usuarioActual?.suscripcion?.tipo === 'premium') {
    return null;
  }

  return (
    <aside className="fixed bottom-6 left-6 z-40 max-w-sm sm:max-w-md animate-fadeIn font-sans">
      <div className="bg-gradient-to-br from-[#1C1819] via-[#2A101A] to-[#120B0E] text-white border-2 border-[#D4AF37]/60 p-5 rounded-3xl shadow-2xl relative overflow-hidden space-y-3">
        
        {/* Destello de fondo estilo lujo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Crown className="w-3 h-3 text-[#D4AF37]" /> Exclusivo ROSSELY
            </span>
          </div>
          <button 
            onClick={() => setMinimizado(true)}
            className="text-stone-400 hover:text-white p-1 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <h4 className="font-serif text-lg font-black text-[#D4AF37] tracking-tight">
            Membresía Premium (S/. 60 / mes)
          </h4>
          <p className="text-xs text-stone-300 font-light leading-relaxed">
            Desbloquea acumulación de puntos dobles (8 pts = S/. 1.00), empaquetado en caja de alta costura y acceso a ruletas de premios semanales.
          </p>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={() => navegarA('suscripcion')}
            className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#B89020] text-stone-900 py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:brightness-110"
          >
            <span>Afiliarme Ahora</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1 text-[9px] text-stone-400 font-light pt-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Validación manual segura vía Yape / Plin por administración.</span>
        </div>
      </div>
    </aside>
  );
}