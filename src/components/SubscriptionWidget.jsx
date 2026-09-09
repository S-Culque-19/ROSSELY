import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Crown, Sparkles, Gift, UploadCloud, Loader2, QrCode, CheckCircle2 } from 'lucide-react';

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

export default function SubscriptionWidget() {
  const { usuarioActual } = useStore();
  const [numeroOperacion, setNumeroOperacion] = useState('');
  const [comprobanteFile, setComprobanteFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [enviadoExito, setEnviadoExito] = useState(false);

  if (!usuarioActual) return null;

  const esPremium = usuarioActual.suscripcion?.tipo === 'premium';

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

      // Se guarda en la colección que el admin revisa y aprueba con Check Verde
      await addDoc(collection(db, 'suscripciones_pendientes'), {
        uid: usuarioActual.uid || usuarioActual.id,
        nombre: usuarioActual.nombre,
        email: usuarioActual.email,
        monto: 60.00,
        numeroOperacion: numeroOperacion.trim(),
        comprobanteImg: base64Img,
        estado: 'Por Verificar', // Por defecto con X roja para el admin
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
    <div className="bg-white p-8 rounded-3xl border border-[#F8D7E0] shadow-sm space-y-6 font-sans max-w-2xl mx-auto">
      
      <div className="text-center space-y-2">
        <span className="bg-[#FFF5F7] text-[#701A3B] border border-[#F8D7E0] text-[10px] uppercase tracking-[0.25em] px-3 py-1 rounded-full font-bold">
          Membresía Atelier • S/. 60.00 / mes
        </span>
        <h3 className="font-serif text-2xl font-black text-[#701A3B]">
          {esPremium ? 'Plan Premium Activo' : 'Adquiere tu Suscripción Mensual'}
        </h3>
        <p className="text-xs text-stone-500 font-light">
          Escanea el código QR de Yape/Plin, realiza tu transferencia de S/. 60 y envía tus datos para verificación.
        </p>
      </div>

      {/* Cuadro QR de Pago */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 bg-[#FFFBFB] p-6 rounded-2xl border border-[#F8D7E0]">
        <div className="w-48 h-48 bg-white p-2 rounded-xl border border-stone-200 shadow-xs flex items-center justify-center">
          <img src="/qr.jpg" alt="QR Yape Plin ROSSELY" className="w-full h-full object-contain" onError={(e)=>{e.target.src="/qr-rossely.png"}} />
        </div>
        <div className="text-xs space-y-2 text-stone-700">
          <p><strong className="text-[#701A3B]">Titular:</strong> Rosario Estrada</p>
          <p><strong className="text-[#701A3B]">Número Yape / Plin:</strong> 971 490 117</p>
          <p><strong className="text-[#701A3B]">Monto Exacto:</strong> S/. 60.00 Soles</p>
          <p className="text-[10px] text-stone-400 italic">Incluye empaque en papel seda y caja oficial ROSSELY.</p>
        </div>
      </div>

      {enviadoExito ? (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h4 className="font-bold text-emerald-900 text-sm">Comprobante enviado a la administración</h4>
          <p className="text-xs text-emerald-700 font-light">
            Tu estatus actual está como <strong>"Por Verificar"</strong>. Una vez que la administración apruebe tu pago, se activarán tus puntos y beneficios de inmediato.
          </p>
        </div>
      ) : (
        <form onSubmit={handleEnviarSuscripcion} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">Número de Operación de Pago *</label>
            <input 
              type="text" 
              required
              placeholder="Ej. 849102"
              value={numeroOperacion}
              onChange={(e) => setNumeroOperacion(e.target.value)}
              className="w-full bg-[#FFFBFB] border border-[#F8D7E0] rounded-xl px-4 py-3 outline-none focus:border-[#701A3B]"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">Captura del Comprobante *</label>
            <label className="w-full border-2 border-dashed border-[#F8D7E0] hover:border-[#701A3B] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-[#FFFBFB] transition">
              <UploadCloud className="w-6 h-6 text-[#701A3B] mb-1" />
              <span className="text-xs text-stone-700 font-medium">Subir foto de transferencia Yape / Plin</span>
              <input type="file" accept="image/*" onChange={handleSeleccionarComprobante} className="hidden" />
            </label>

            {previewUrl && (
              <div className="mt-3 relative w-24 h-24 rounded-xl overflow-hidden border border-[#F8D7E0]">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={procesando}
            className="w-full bg-[#701A3B] hover:bg-[#56132D] text-white py-3.5 rounded-xl font-bold uppercase tracking-[0.2em] transition cursor-pointer shadow-sm disabled:opacity-50"
          >
            {procesando ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : '✦ Enviar Comprobante para Validación'}
          </button>
        </form>
      )}

    </div>
  );
}