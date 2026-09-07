import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { compressAndConvertToBase64 } from '../services/imageOptimizer';
import { ShieldCheck, QrCode, UploadCloud, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

export default function CheckoutView() {
  const { carrito, limpiarCarrito, navegarA, usuarioActual } = useStore();
  const [nombre, setNombre] = useState(usuarioActual?.nombre || '');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('Lima');
  const [archivoComprobante, setArchivoComprobante] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [completado, setCompletado] = useState(false);
  const [idPedido, setIdPedido] = useState('');

  const subtotal = carrito.reduce((acc, it) => acc + (it.precio * it.cantidad), 0);
  const envio = ciudad.toLowerCase() === 'lima' ? 10 : 15;
  const total = subtotal + envio;

  const handleSeleccionarComprobante = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoComprobante(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleConfirmarPedido = async (e) => {
    e.preventDefault();
    if (carrito.length === 0) return alert("Tu bolsa está vacía.");
    if (!archivoComprobante) return alert("Por favor adjunta la captura de tu transferencia o QR.");

    setProcesando(true);
    try {
      const comprobanteBase64 = await compressAndConvertToBase64(archivoComprobante, 900, 0.7);

      const docRef = await addDoc(collection(db, 'pedidos'), {
        cliente: {
          nombre,
          telefono,
          direccion,
          ciudad,
          email: usuarioActual?.email || 'invitado@rossely.pe'
        },
        items: carrito,
        subtotal,
        envio,
        total,
        estado: 'Pendiente de Verificación',
        comprobanteImg: comprobanteBase64,
        fecha: serverTimestamp()
      });

      setIdPedido(docRef.id);
      setCompletado(true);
      limpiarCarrito();
    } catch (err) {
      console.error("Error al registrar pedido:", err);
      alert("Hubo un problema procesando tu comprobante.");
    } finally {
      setProcesando(false);
    }
  };

  if (completado) {
    return (
      <div className="w-full max-w-lg mx-auto py-20 px-6 text-center space-y-5">
        <div className="w-16 h-16 bg-[#FDF5F7] border border-[#F8D7E0] text-[#701A3B] rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-stone-900">¡Pedido Registrado con Éxito!</h2>
        <p className="text-xs text-stone-600 leading-relaxed font-light">
          Hemos recibido tu orden y comprobante de pago. Nuestro equipo verificará la transacción y preparará tu empaque de seda ROSSELY.
        </p>
        <div className="bg-white p-4 rounded-2xl border border-[#F8D7E0] text-xs font-mono text-[#701A3B]">
          Código de seguimiento: #{idPedido.slice(0, 8)}
        </div>
        <button
          onClick={() => navegarA('home')}
          className="bg-[#701A3B] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer"
        >
          Volver a la Tienda
        </button>
      </div>
    );
  }

  return (
    <div className="w-full py-10 px-6 sm:px-10 md:px-16 max-w-6xl mx-auto space-y-8 font-sans">
      <button onClick={() => navegarA('cart')} className="inline-flex items-center gap-2 text-xs text-stone-500 hover:text-stone-900 cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Regresar a la bolsa
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Formulario de Envío */}
        <form onSubmit={handleConfirmarPedido} className="lg:col-span-7 bg-white p-8 rounded-3xl border border-[#FCE4EC] shadow-xs space-y-4">
          <h2 className="font-serif text-xl font-bold text-stone-900">Detalles de Entrega</h2>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Nombre Completo *</label>
            <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl px-4 py-2.5 text-xs outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Teléfono Móvil *</label>
              <input required type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl px-4 py-2.5 text-xs outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Ciudad / Destino *</label>
              <select value={ciudad} onChange={e => setCiudad(e.target.value)} className="w-full bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl px-4 py-2.5 text-xs outline-none">
                <option value="Lima">Lima Metropolitana (S/. 10)</option>
                <option value="Provincias">Provincias del Perú (S/. 15)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Dirección Exacta de Envío *</label>
            <input required type="text" placeholder="Av. Los Conquistadores 420, Dpto 301" value={direccion} onChange={e => setDireccion(e.target.value)} className="w-full bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl px-4 py-2.5 text-xs outline-none" />
          </div>

          {/* Subida de Comprobante */}
          <div className="pt-2">
            <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">Adjuntar Captura del Pago *</label>
            <label className="w-full border-2 border-dashed border-[#F8D7E0] hover:border-[#701A3B] rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer bg-[#FDF5F7]/40 transition">
              <UploadCloud className="w-6 h-6 text-[#701A3B] mb-1" />
              <span className="text-xs text-stone-600 font-medium">Subir foto de comprobante</span>
              <input type="file" accept="image/*" onChange={handleSeleccionarComprobante} className="hidden" />
            </label>

            {previewUrl && (
              <div className="mt-3 relative w-28 h-28 rounded-xl overflow-hidden border border-[#F8D7E0]">
                <img src={previewUrl} alt="Comprobante" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={procesando}
            className="w-full bg-[#701A3B] hover:bg-[#56132D] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 mt-4"
          >
            {procesando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Pedido y Enviar'}
          </button>
        </form>

        {/* Panel Lateral: Marco Satinado con QR */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-7 rounded-3xl border border-[#FCE4EC] shadow-xs text-center space-y-4">
            <span className="text-[10px] font-bold text-[#A24869] uppercase tracking-[0.25em]">
              Código QR Exclusivo de Pago
            </span>

            {/* Marco de Lujo con QR Oficial */}
            <div className="p-4 bg-gradient-to-b from-[#FFF5F7] to-[#FDF5F7] rounded-2xl border border-[#F8D7E0] inline-block shadow-inner">
              <div className="w-48 h-48 bg-white p-2 rounded-xl flex items-center justify-center border border-[#FCE4EC] mx-auto">
                <img 
                  src="/qr-rossely.png" 
                  alt="QR de Pago Oficial ROSSELY" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback visual en caso de que la imagen aún no esté en /public
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div style={{ display: 'none' }} className="flex-col items-center justify-center text-center p-2">
                  <QrCode className="w-16 h-16 text-[#701A3B] mb-2" />
                  <span className="text-[9px] font-bold text-stone-500">QR Oficial de Pago</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-serif font-bold text-stone-900">
                Titular: Carmennadeshdadelrosario Estrada
              </p>
              <p className="text-[10px] text-stone-400 font-light">
                Escanea desde tu app Yape, Plin o banca móvil preferida.
              </p>
            </div>

            <div className="border-t border-[#FCE4EC] pt-4 text-xs space-y-1.5 text-stone-600">
              <div className="flex justify-between"><span>Subtotal:</span><span>S/. {subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Envío ({ciudad}):</span><span>S/. {envio.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-sm text-[#701A3B] pt-2 border-t border-stone-100">
                <span>Total a Transferir:</span><span>S/. {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}