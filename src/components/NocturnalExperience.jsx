import React, { useState, useEffect } from 'react';
import { Sparkles, Gift, X } from 'lucide-react';

export default function NocturnalExperience() {
  const [saludo, setSaludo] = useState('');
  const [abierto, setAbierto] = useState(false);
  const [revelado, setRevelado] = useState(false);

  useEffect(() => {
    const hora = new Date().getHours();
    if (hora >= 20 || hora < 6) {
      setSaludo("Buenas noches. El confort de la seda te espera...");
    } else if (hora >= 6 && hora < 12) {
      setSaludo("Buenos días. Despierta con la delicadeza de ROSSELY...");
    } else {
      setSaludo("Buenas tardes. Haz una pausa y renueva tu descanso...");
    }
  }, []);

  return (
    <>
      {/* Saludo dinámico en cintillo o widget flotante inferior */}
      <div className="fixed bottom-5 left-5 z-40">
        <button
          onClick={() => setAbierto(true)}
          className="bg-white/90 backdrop-blur-md border border-[#F8D7E0] hover:border-[#701A3B] text-stone-800 px-4 py-2.5 rounded-full shadow-lg text-xs flex items-center gap-2 transition duration-300 transform hover:scale-105 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#701A3B] animate-pulse" />
          <span className="font-serif italic text-stone-700 hidden sm:inline">{saludo}</span>
          <span className="font-bold text-[10px] uppercase tracking-wider text-[#701A3B] bg-[#FDF5F7] px-2 py-0.5 rounded-full">
            ✦ Beneficio
          </span>
        </button>
      </div>

      {/* Modal Editorial del Beneficio Nocturno */}
      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 border border-[#F8D7E0] shadow-2xl text-center space-y-4">
            <button onClick={() => setAbierto(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 cursor-pointer">
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-full bg-[#FDF5F7] border border-[#F8D7E0] text-[#701A3B] flex items-center justify-center mx-auto">
              <Gift className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-xl font-bold text-stone-900">Cofre de Seda ROSSELY</h3>
            <p className="text-xs text-stone-500 font-light leading-relaxed">
              Un detalle reservado para celebrar tu buen gusto y descanso esta temporada.
            </p>

            {!revelado ? (
              <button
                onClick={() => setRevelado(true)}
                className="w-full bg-[#701A3B] hover:bg-[#56132D] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer transition shadow-xs"
              >
                Abrir Detalle Exclusivo
              </button>
            ) : (
              <div className="p-4 bg-[#FDF5F7] rounded-xl border border-[#F8D7E0] space-y-1">
                <span className="text-[10px] font-bold text-[#A24869] uppercase tracking-widest">Cortesía Desbloqueada</span>
                <p className="font-serif text-base font-bold text-[#701A3B]">Empaque de Seda de Regalo + Envío Bonificado</p>
                <p className="text-[10px] text-stone-500">Se aplicará de forma preferencial en tu orden.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}