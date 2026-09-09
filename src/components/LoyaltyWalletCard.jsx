import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Crown, Wallet, QrCode, X, Sparkles } from 'lucide-react';

export default function LoyaltyWalletCard() {
  const { usuarioActual } = useStore();
  const [modalAbierto, setModalAbierto] = useState(false);

  if (!usuarioActual || usuarioActual.role === 'admin') return null;

  const puntos = usuarioActual.puntos || 0;
  const solesEquivalentes = (puntos / 8).toFixed(2);
  const esPremium = usuarioActual.suscripcion?.tipo === 'premium';

  const simularWallet = (tipo) => {
    alert(`✦ Atelier ROSSELY: Tu pase digital ha sido enlazado a ${tipo}. ¡Tus puntos se sincronizan en tiempo real!`);
    setModalAbierto(false);
  };

  return (
    <>
      {/* Cuadro Flotante Persistente de Puntos (Nunca desaparece al cambiar de pestaña) */}
      <div className="fixed bottom-24 right-6 z-40 bg-[#1C1819]/95 backdrop-blur-md text-white border border-[#D4AF37]/60 p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 font-sans animate-fadeIn">
        <div className="w-9 h-9 rounded-xl bg-[#701A3B] border border-[#D4AF37] flex items-center justify-center shrink-0">
          <Crown className="w-4 h-4 text-[#D4AF37]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider">
            {esPremium ? 'Socio Premium ROSSELY' : 'Club de Seda'}
          </p>
          <p className="text-xs font-bold text-white">
            {puntos} Ptos <span className="text-[10px] text-stone-400 font-light">(S/. {solesEquivalentes})</span>
          </p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="bg-[#D4AF37] hover:bg-[#c29d2f] text-stone-900 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shadow-xs shrink-0"
        >
          <Wallet className="w-3 h-3" /> Tarjeta Digital
        </button>
      </div>

      {/* Modal de Fidelización y Billeteras Virtuales */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn font-sans">
          <div className="relative w-full max-w-sm bg-gradient-to-br from-[#1C1819] via-[#3E1123] to-[#120B0E] text-white rounded-3xl p-6 shadow-2xl border border-[#D4AF37] space-y-6">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold">Atelier ROSSELY</span>
                <h3 className="font-serif text-xl font-black text-white">Tarjeta de Fidelización</h3>
              </div>
              <button onClick={() => setModalAbierto(false)} className="text-stone-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tarjeta Visual de Socio */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl space-y-4 shadow-inner">
              <div className="flex justify-between items-center">
                <span className="font-serif font-bold text-xs tracking-wider">{usuarioActual.nombre}</span>
                <Crown className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] text-stone-300 uppercase tracking-widest">Saldo Acumulado</p>
                  <p className="text-2xl font-black text-[#D4AF37]">{puntos} Puntos</p>
                  <p className="text-[10px] text-stone-300 font-light">Equivalente a S/. {solesEquivalentes}</p>
                </div>
                <div className="bg-white p-1.5 rounded-xl shadow-xs">
                  <QrCode className="w-10 h-10 text-stone-900" />
                </div>
              </div>
            </div>

            {/* Opciones Apple Wallet / Google Wallet */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => simularWallet('Apple Wallet')}
                className="w-full bg-black hover:bg-stone-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-stone-800 transition cursor-pointer shadow-sm"
              >
                <span> Agregar a Apple Wallet</span>
              </button>
              <button
                onClick={() => simularWallet('Google Wallet')}
                className="w-full bg-white hover:bg-stone-100 text-stone-900 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
              >
                <span>G Pay Agregar a Google Wallet</span>
              </button>
            </div>

            <p className="text-[9px] text-stone-400 text-center font-light leading-relaxed">
              Tus puntos (8 pts = S/. 1.00) se actualizan al instante en cada compra validada por la administración en Nuevo Chimbote.
            </p>
          </div>
        </div>
      )}
    </>
  );
}