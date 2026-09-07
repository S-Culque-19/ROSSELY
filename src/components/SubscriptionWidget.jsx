import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Sparkles, Crown, Gift, Check, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';

export default function SubscriptionWidget() {
  const { usuarioActual } = useStore();
  const [procesando, setProcesando] = useState(false);
  const [mensajeToast, setMensajeToast] = useState('');

  if (!usuarioActual) return null;

  const esPremium = usuarioActual.suscripcion?.tipo === 'premium' && 
    new Date() < (usuarioActual.suscripcion?.fechaExpiracion?.toDate ? usuarioActual.suscripcion.fechaExpiracion.toDate() : new Date(usuarioActual.suscripcion?.fechaExpiracion || 0));

  const puntosDisponibles = usuarioActual.puntos || 0;
  const descuentoEquivalente = (puntosDisponibles / 8).toFixed(2);

  const handleSuscribirsePremium = async () => {
    setProcesando(true);
    try {
      const treintaDiasDespues = new Date();
      treintaDiasDespues.setDate(treintaDiasDespues.getDate() + 30);

      const userRef = doc(db, 'usuarios', usuarioActual.uid || usuarioActual.id);
      await setDoc(userRef, {
        suscripcion: {
          tipo: 'premium',
          costoMensual: 60.00,
          fechaInicio: serverTimestamp(),
          fechaExpiracion: treintaDiasDespues,
          estado: 'activo'
        }
      }, { merge: true });

      setMensajeToast("✦ ¡Te has afiliado al Plan Premium ROSSELY con éxito!");
      setTimeout(() => setMensajeToast(''), 4000);
    } catch (err) {
      console.error("Error al procesar suscripción:", err);
      alert("Error al procesar el pago de la suscripción.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-[#F8D7E0] shadow-sm space-y-4 font-sans">
      
      {/* Sello de Packaging Permanente */}
      <div className="bg-[#FFF5F7] border border-[#F8D7E0] p-3 rounded-2xl flex items-center gap-2 text-[11px] text-[#701A3B]">
        <Gift className="w-4 h-4 text-[#701A3B] shrink-0" />
        <span className="font-serif italic">Todos los productos son envueltos en papel seda y con su respectiva caja ROSSELY.</span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-stone-100 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#A24869]">
            Programa de Beneficios Atelier
          </span>
          <h3 className="font-serif text-lg font-black text-[#701A3B]">
            {esPremium ? 'Membresía Premium ROSSELY' : 'Plan Free (Gratuito)'}
          </h3>
        </div>

        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
          esPremium 
            ? 'bg-[#1C1819] text-[#D4AF37] border border-[#D4AF37]' 
            : 'bg-[#FDF5F7] text-[#701A3B] border border-[#F8D7E0]'
        }`}>
          {esPremium ? <Crown className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Sparkles className="w-3.5 h-3.5" />}
          {esPremium ? 'Premium Activo' : 'Plan Gratis'}
        </span>
      </div>

      {/* Saldo de Puntos Canjeables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#FFFBFB] p-4 rounded-2xl border border-[#F8D7E0] space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Puntos Acumulados</span>
          <p className="text-xl font-black text-[#701A3B]">{puntosDisponibles} pts</p>
          <span className="text-[10px] text-stone-600 font-medium">
            Equivale a <strong>S/. {descuentoEquivalente}</strong> de descuento (8 pts = S/. 1.00)
          </span>
        </div>

        <div className="bg-[#FFFBFB] p-4 rounded-2xl border border-[#F8D7E0] space-y-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Taller & Envíos</span>
          <p className="text-xs font-bold text-stone-800">Nuevo Chimbote ➔ Perú</p>
          <span className="text-[10px] text-[#A24869] font-medium">Despachos diarios vía Shalom</span>
        </div>
      </div>

      {mensajeToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-semibold text-center">
          {mensajeToast}
        </div>
      )}

      {/* Botón de Suscripción o Renovación Premium (S/. 60/mes) */}
      {!esPremium && (
        <div className="pt-2">
          <div className="bg-gradient-to-r from-[#1C1819] to-[#2A101A] text-white p-5 rounded-2xl space-y-3 shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-serif font-bold text-sm text-[#D4AF37]">Pásate a Premium ROSSELY</h4>
                <p className="text-[11px] text-stone-300 font-light">
                  S/. 60.00 / mes (Renovación automática o baja automática si no se paga). Puntos dobles por compra.
                </p>
              </div>
              <Crown className="w-8 h-8 text-[#D4AF37] shrink-0" />
            </div>

            <button
              onClick={handleSuscribirsePremium}
              disabled={procesando}
              className="w-full bg-[#D4AF37] hover:bg-[#c29d2f] text-stone-900 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {procesando ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              <span>Suscribirme por S/. 60/mes</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}