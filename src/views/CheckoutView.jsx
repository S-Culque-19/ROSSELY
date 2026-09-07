import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, QrCode, UploadCloud, CheckCircle2, Loader2, ArrowLeft, Truck, Package } from 'lucide-react';

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

export default function CheckoutView() {
  const { carrito, registrarPedido, navegarA, usuarioActual } = useStore();

  // Datos de envío
  const [nombre, setNombre] = useState(usuarioActual?.nombre || '');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ciudad, setCiudad] = useState('Nuevo Chimbote');
  const [tipoEnvio, setTipoEnvio] = useState('local'); // 'local' | 'lima' | 'provincia'
  const [agenciaShalom, setAgenciaShalom] = useState('Agencia Shalom Central');
  const [comprobanteFile, setComprobanteFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  const [procesando, setProcesando] = useState(false);
  const [pedidoCompletadoId, setPedidoCompletadoId] = useState(null);

  // Cálculo de Envíos Shalom
  const subtotal = carrito.reduce((acc, it) => acc + (parseFloat(it.precio || 0) * (it.cantidad || 1)), 0);
  
  const costoEnvio = tipoEnvio === 'local' 
    ? 5.00 
    : tipoEnvio === 'lima' 
      ? 12.00 
      : 15.00;

  const total = subtotal + costoEnvio;

  const handleSeleccionarComprobante = (e) => {
    const f = e.target.files[0];
    if (f) {
      setComprobanteFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const handleConfirmarCompra = async (e) => {
    e.preventDefault();
    if (carrito.length === 0) return alert("Tu bolsa de compras está vacía.");
    if (!dni || dni.length < 8) return alert("Por favor ingresa un número de DNI válido para el recojo en Shalom.");
    if (!comprobanteFile) return alert("Por favor adjunta la captura del comprobante de transferencia o QR.");

    setProcesando(true);
    try {
      const base64Comprobante = await optimizarCapturaCanvas(comprobanteFile);

      const idGenerado = await registrarPedido({
        nombre,
        dni,
        telefono,
        ciudad,
        agenciaShalom,
        tipoEnvio,
        costoEnvio,
        email: usuarioActual?.email || 'cliente@rossely.pe'
      }, base64Comprobante);

      setPedidoCompletadoId(idGenerado);
    } catch (err) {
      console.error(err);
      alert("Hubo un problema procesando el comprobante.");
    } finally {
      setProcesando(false);
    }
  };

  if (pedidoCompletadoId) {
    return (
      <div className="w-full max-w-lg mx-auto py-20 px-6 text-center space-y-5 font-sans">
        <div className="w-16 h-16 bg-[#FDF5F7] border border-[#F8D7E0] text-[#701A3B] rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-stone-900">¡Orden Registrada con Éxito!</h2>
        <p className="text-xs text-stone-600 leading-relaxed font-light">
          Tu pedido está siendo preparado en nuestro taller de <strong>Nuevo Chimbote</strong>. Verificaremos tu comprobante y despacharemos tus prendas finas en empaque satinado hacia tu agencia <strong>Shalom</strong>.
        </p>
        <div className="bg-white p-4 rounded-2xl border border-[#F8D7E0] text-xs font-mono text-[#701A3B]">
          Código de seguimiento: #{pedidoCompletadoId.slice(0, 8)}
        </div>
        <button
          onClick={() => navegarA('home')}
          className="bg-[#701A3B] text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer shadow-md"
        >
          Regresar a la Tienda
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
        
        {/* Formulario Logístico Shalom */}
        <form onSubmit={handleConfirmarCompra} className="lg:col-span-7 bg-white p-8 rounded-3xl border border-[#FCE4EC] shadow-xs space-y-5">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="font-serif text-2xl font-bold text-stone-900">Datos para Despacho Shalom</h2>
            <p className="text-[11px] text-stone-500 font-light mt-0.5">
              Taller de confección en Nuevo Chimbote • Despachos a todo el Perú
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Nombre Completo de Quien Recoge *</label>
              <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#701A3B]" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">DNI del Titular (Para Shalom) *</label>
              <input required type="text" maxLength={9} placeholder="8 dígitos" value={dni} onChange={e => setDni(e.target.value)} className="w-full bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#701A3B]" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Teléfono Móvil *</label>
              <input required type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#701A3B]" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Ciudad de Destino *</label>
              <input required type="text" placeholder="Ej. Trujillo, Chiclayo, Huaraz..." value={ciudad} onChange={e => setCiudad(e.target.value)} className="w-full bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#701A3B]" />
            </div>
          </div>

          {/* Opciones de Envío */}
          <div>
            <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-2">Modalidad de Envío</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label className={`p-3 rounded-2xl border cursor-pointer flex flex-col justify-between transition ${tipoEnvio === 'local' ? 'border-[#701A3B] bg-[#FDF5F7]' : 'border-[#F8D7E0] bg-white'}`}>
                <input type="radio" name="envio" checked={tipoEnvio === 'local'} onChange={() => setTipoEnvio('local')} className="hidden" />
                <span className="font-bold text-stone-900">Local Chimbote</span>
                <span className="text-[11px] text-stone-500">Nuevo Chimbote / Chimbote</span>
                <span className="font-bold text-[#701A3B] mt-2">S/. 5.00</span>
              </label>

              <label className={`p-3 rounded-2xl border cursor-pointer flex flex-col justify-between transition ${tipoEnvio === 'lima' ? 'border-[#701A3B] bg-[#FDF5F7]' : 'border-[#F8D7E0] bg-white'}`}>
                <input type="radio" name="envio" checked={tipoEnvio === 'lima'} onChange={() => setTipoEnvio('lima')} className="hidden" />
                <span className="font-bold text-stone-900">Lima Metropolitana</span>
                <span className="text-[11px] text-stone-500">Agencia Shalom Lima</span>
                <span className="font-bold text-[#701A3B] mt-2">S/. 12.00</span>
              </label>

              <label className={`p-3 rounded-2xl border cursor-pointer flex flex-col justify-between transition ${tipoEnvio === 'provincia' ? 'border-[#701A3B] bg-[#FDF5F7]' : 'border-[#F8D7E0] bg-white'}`}>
                <input type="radio" name="envio" checked={tipoEnvio === 'provincia'} onChange={() => setTipoEnvio('provincia')} className="hidden" />
                <span className="font-bold text-stone-900">Provincias Nacional</span>
                <span className="text-[11px] text-stone-500">Agencia Shalom Perú</span>
                <span className="font-bold text-[#701A3B] mt-2">S/. 15.00</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Nombre o Dirección de Agencia Shalom Seleccionada *</label>
            <input required type="text" placeholder="Ej. Shalom Av. América Sur o Shalom San Isidro" value={agenciaShalom} onChange={e => setAgenciaShalom(e.target.value)} className="w-full bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#701A3B]" />
          </div>

          {/* Carga del Comprobante */}
          <div className="pt-2">
            <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Adjuntar Captura del Pago *</label>
            <label className="w-full border-2 border-dashed border-[#F8D7E0] hover:border-[#701A3B] rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer bg-[#FDF5F7]/40 transition">
              <UploadCloud className="w-6 h-6 text-[#701A3B] mb-1" />
              <span className="text-xs text-stone-700 font-medium">Subir foto de transferencia / Yape / Plin</span>
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
            className="w-full bg-[#701A3B] hover:bg-[#56132D] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-4"
          >
            {procesando ? <Loader2 className="w-4 h-4 animate-spin" /> : '✦ Confirmar Compra y Enviar a Confección'}
          </button>
        </form>

        {/* Marco Satinado con QR de Pago Exclusivo */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-7 rounded-3xl border border-[#FCE4EC] shadow-xs text-center space-y-4">
            <span className="text-[10px] font-bold text-[#A24869] uppercase tracking-[0.25em] block">
              Pago Seguro ROSSELY
            </span>

            {/* Recuadro Satinado del QR */}
            <div className="p-4 bg-gradient-to-b from-[#FFF5F7] to-[#FDF5F7] rounded-2xl border border-[#F8D7E0] inline-block shadow-inner">
              <div className="w-52 h-52 bg-white p-2 rounded-xl flex items-center justify-center border border-[#FCE4EC] mx-auto">
                <img 
                  src="/qr-rossely.png" 
                  alt="QR Oficial de Pago ROSSELY" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div style={{ display: 'none' }} className="flex-col items-center justify-center text-center p-2">
                  <QrCode className="w-16 h-16 text-[#701A3B] mb-2" />
                  <span className="text-[10px] font-bold text-stone-700">QR Oficial de Pago</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-serif font-bold text-stone-900">
                Titular: Carmennadeshdadelrosario Estrada
              </p>
              <p className="text-[11px] text-stone-500 font-light">
                Escanea desde Yape, Plin o tu banca móvil sin comisión.
              </p>
            </div>

            <div className="border-t border-[#FCE4EC] pt-4 text-xs space-y-2 text-stone-600">
              <div className="flex justify-between"><span>Prendas de Seda:</span><span>S/. {subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Envío Shalom ({tipoEnvio}):</span><span>S/. {costoEnvio.toFixed(2)}</span></div>
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