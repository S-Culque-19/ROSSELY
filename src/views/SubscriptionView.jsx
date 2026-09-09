import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Crown, Sparkles, UploadCloud, Loader2, CheckCircle2, ArrowLeft, ShieldCheck, QrCode } from 'lucide-react';

const optimizarCapturaCanvas = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("Archivo inválido"));
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > 900) {
          h = Math.round((h * 900) / w);
          w = 900;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export default function SubscriptionView() {
  const { usuarioActual, navegarA } = useStore();
  const [numeroOperacion, setNumeroOperacion] = useState('');
  const [comprobanteFile, setComprobanteFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [enviadoExito, setEnviadoExito] = useState(false);

  if (!usuarioActual) {
    navegarA('auth');
    return null;
  }

  const handleSeleccionarComprobante = (e) => {
    const f = e.target.files[0];
    if (f) {
      setComprobanteFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const handleEnviarSuscripcion = async (e) => {
    e.preventDefault();
    if (!numeroOperacion.trim() || !comprobanteFile) {
      alert("Por favor ingresa el número de operación y adjunta la captura del pago.");
      return;
    }

    setProcesando(true);
    try {
      const base64Img = await optimizarCapturaCanvas(comprobanteFile);

      // Guardamos la solicitud de suscripción para que el admin la valide con Check Verde o X Roja
      await addDoc(collection(db, 'suscripciones_pendientes'), {
        uid: usuarioActual.uid || usuarioActual.id,
        nombre: usuarioActual.nombre,
        email: usuarioActual.email,
        monto: 60.00,
        numeroOperacion: numeroOperacion.trim(),
        comprobanteImg: base64Img,
        estado: 'Por Verificar', // Por defecto con X roja en el panel de admin
        createdAt: serverTimestamp()
      });

      setEnviadoExito(true);
    } catch (err) {
      console.error("Error al enviar suscripción:", err);
      alert("No se pudo enviar el comprobante.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="w-full py-10 px-6 sm:px-10 md:px-16 max-w-4xl mx-auto space-y-8 font-sans">
      <button onClick={() => navegarA('home')} className="inline-flex items-center gap-2 text-xs text-stone-500 hover:text-stone-900 cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Regresar al inicio
      </button>

      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#F8D7E0] shadow-sm space-y-8">
        
        <div className="text-center space-y-3 max-w-lg mx-auto">
          <span className="bg-[#FFF5F7] text-[#701A3B] border border-[#F8D7E0] text-[10px] uppercase tracking-[0.25em] px-4 py-1.5 rounded-full font-bold inline-flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-[#D4AF37]" /> Membresía Exclusiva Atelier ROSSELY
          </span>
          <h2 className="font-serif text-3xl font-black text-[#701A3B]">
            Afíliate al Plan Premium (S/. 60.00 / mes)
          </h2>
          <p className="text-xs text-stone-600 font-light leading-relaxed">
            Disfruta de puntos canjeables por prendas (8 pts = S/. 1.00), empaquetado de lujo y acceso al sistema de recompensas semanales.
          </p>
        </div>

        {/* Bloque de Pago Yape / Plin */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 items-center bg-[#FFFBFB] p-6 rounded-2xl border border-[#F8D7E0]">
          <div className="sm:col-span-5 flex justify-center">
            <div className="w-48 h-48 bg-white p-2 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-center">
              <img src="/qr.jpg" alt="QR Yape Plin ROSSELY" className="w-full h-full object-contain" onError={(e)=>{e.target.src="/qr-rossely.png"}} />
            </div>
          </div>
          <div className="sm:col-span-7 space-y-3 text-xs text-stone-700">
            <h4 className="font-serif font-bold text-sm text-[#701A3B]">Instrucciones de Pago:</h4>
            <p>1. Escanea el código QR desde Yape o Plin.</p>
            <p>2. Realiza la transferencia exacta de <strong>S/. 60.00 Soles</strong> a nombre de <strong>Rosario Estrada</strong> (Cel: 971 490 117).</p>
            <p>3. Ingresa tu número de operación y adjunta la captura abajo para la validación administrativa.</p>
          </div>
        </div>

        {enviadoExito ? (
          <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-3 max-w-md mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-emerald-950 text-base">¡Comprobante enviado con éxito!</h4>
            <p className="text-xs text-emerald-800 font-light leading-relaxed">
              Tu solicitud está en estatus <strong className="text-rose-600">"Por Verificar"</strong> (X Roja). En breve la administración validará tu número de operación y activará tu estatus Premium y tarjeta de puntos (Check Verde).
            </p>
            <button
              onClick={() => navegarA('home')}
              className="mt-2 bg-[#701A3B] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Volver a la Tienda
            </button>
          </div>
        ) : (
          <form onSubmit={handleEnviarSuscripcion} className="space-y-5 max-w-md mx-auto text-xs">
            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">Número de Operación Yape / Plin *</label>
              <input 
                type="text" 
                required
                placeholder="Ej. 984512"
                value={numeroOperacion}
                onChange={(e) => setNumeroOperacion(e.target.value)}
                className="w-full bg-[#FFFBFB] border border-[#F8D7E0] rounded-xl px-4 py-3 outline-none focus:border-[#701A3B]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">Captura del Comprobante de Pago *</label>
              <label className="w-full border-2 border-dashed border-[#F8D7E0] hover:border-[#701A3B] rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer bg-[#FFFBFB] transition">
                <UploadCloud className="w-6 h-6 text-[#701A3B] mb-1" />
                <span className="text-xs text-stone-700 font-medium">Subir captura de pantalla</span>
                <input type="file" accept="image/*" onChange={handleSeleccionarComprobante} className="hidden" />
              </label>

              {previewUrl && (
                <div className="mt-3 relative w-24 h-24 rounded-xl overflow-hidden border border-[#F8D7E0] mx-auto">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={procesando}
              className="w-full bg-[#701A3B] hover:bg-[#56132D] text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] transition cursor-pointer shadow-md disabled:opacity-50"
            >
              {procesando ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : '✦ Enviar Solicitud de Suscripción'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}