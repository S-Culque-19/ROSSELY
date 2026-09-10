// ============================================================================
// COMPONENTE 1: INTERFAZ CINEMATOGRÁFICA PREMIUM TIPO STREAMING (SubscriptionView.jsx)
// ============================================================================
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Crown, Sparkles, CheckCircle, Clock, ShieldCheck, QrCode } from 'lucide-react';

export default function SubscriptionView() {
  const { usuarioActual, navegarA } = useStore();
  const [numeroOperacion, setNumeroOperacion] = useState('');
  const [enviando, setEnviando] = useState(`enviado_ok`);
  const [mensajeExito, setMensajeExito] = useState('');

  const suscripcionEstado = usuarioActual?.suscripcion?.tipo || 'free';
  const esPremium = suscripcionEstado === 'premium';

  const handleSubmitYape = async (e) => {
    e.preventDefault();
    if (!numeroOperacion.trim()) return;
    setEnviando(true);
    try {
      await addDoc(collection(db, 'suscripciones_pendientes'), {
        uid: usuarioActual.uid || usuarioActual.id,
        nombre: usuarioActual.nombre,
        email: usuarioActual.email,
        numeroOperacion: numeroOperacion.trim(),
        estado: 'Por Verificar',
        createdAt: serverTimestamp()
      });
      setMensajeExito("✦ Solicitud enviada con éxito. La administración validará su operación Yape en breve.");
      setNumeroOperacion('');
    } catch (err) {
      console.error(err);
      alert("Error al registrar solicitud de suscripción.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-[#222222] font-sans pb-20">
      {/* Header Cinematográfico Estilo Prime / Editorial */}
      <div className="relative w-full py-20 px-6 sm:px-12 md:px-20 bg-gradient-to-b from-[#FCE7F3]/60 via-[#F5EBE6]/40 to-[#FAF7F2] border-b border-[#F8D7E0] text-center space-y-6">
        <span className="inline-flex items-center gap-2 bg-white text-[#701A3B] border border-[#F8D7E0] text-[10px] uppercase tracking-[0.4em] px-5 py-2 rounded-full font-bold shadow-xs">
          <Crown className="w-4 h-4 text-[#D4AF37]" /> Atelier ROSSELY • Streaming & Silk Club
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl text-stone-900 font-normal tracking-wide">
          Experiencia Exclusiva de Alta Costura
        </h1>
        <p className="text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Acceda a catálogos privados, acumule puntos con la divisa interna (1 Sol = 8 Puntos), canjee prendas de seda instantáneamente y disfrute de transmisiones y beneficios de nivel internacional.
        </p>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Panel Izquierdo: Estado del Plan y Beneficios */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#FCE4EC] shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl font-bold text-stone-900">Estado de Membresía</h3>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${esPremium ? 'bg-emerald-100 text-emerald-800' : 'bg-pink-100 text-[#701A3B]'}`}>
                {esPremium ? '✓ Premium Activo' : 'Suscripción Estándar / Free'}
              </span>
            </div>

            {esPremium ? (
              <div className="p-6 rounded-2xl bg-[#FFFBFB] border border-[#F8D7E0] space-y-3">
                <p className="text-xs font-bold text-[#701A3B]">✦ Su membresía se encuentra activa y monitoreada por la dirección.</p>
                <p className="text-xs text-stone-600">Tiene acceso completo a la tienda con divisa de puntos y ruletas de premios semanales.</p>
                <button onClick={() => navegarA('catalog')} className="mt-4 bg-[#701A3B] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md">
                  Ir al Catálogo con Divisa de Puntos
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-stone-600 leading-relaxed">
                  Disfrute de la experiencia completa por solo <strong className="text-[#701A3B]">S/. 60.00 / mes</strong>. Escanee el código QR de Yape/Plin, efectúe el pago e ingrese su número de operación para aprobación administrativa instantánea.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#FFFBFB] border border-[#F8D7E0] flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#701A3B] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs">Divisa de Puntos</p>
                      <p className="text-[11px] text-stone-500">1 Sol = 8 Puntos para canjes autónomos.</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FFFBFB] border border-[#F8D7E0] flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-[#701A3B] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs">Ruletas VIP & Golden</p>
                      <p className="text-[11px] text-stone-500">Premios exclusivos semanales.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel Derecho: Pasarela de Pago Yape / Plin */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-[#FCE4EC] shadow-sm space-y-6">
            <h3 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#701A3B]" /> Afiliación Yape / Plin
            </h3>

            <div className="bg-[#FFFBFB] p-6 rounded-2xl border border-[#F8D7E0] text-center space-y-4">
              <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-3 border border-[#F8D7E0] flex items-center justify-center shadow-inner">
                <span className="text-xs font-bold text-stone-400">QR Yape / Plin (Cargado en Public)</span>
              </div>
              <p className="text-xs font-bold text-stone-800">Rosario Estrada (+51 971 490 117)</p>
              <p className="text-[11px] text-stone-500">Monto exacto: <strong>S/. 60.00</strong></p>
            </div>

            <form onSubmit={handleSubmitYape} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Número de Operación Yape</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ej. 9845210" 
                  value={numeroOperacion} 
                  onChange={e => setNumeroOperacion(e.target.value)} 
                  className="w-full bg-[#FFFBFB] border border-[#F8D7E0] rounded-xl px-4 py-3 text-xs outline-none font-mono" 
                />
              </div>

              {mensajeExito && <p className="text-xs text-emerald-700 font-bold bg-emerald-50 p-3 rounded-xl">{mensajeExito}</p>}

              <button type="submit" disabled={enviando} className="w-full bg-[#701A3B] text-white py-3.5 rounded-xl font-bold uppercase text-xs cursor-pointer shadow-md">
                {enviando ? 'Registrando...' : 'Enviar Comprobante de Afiliación'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}