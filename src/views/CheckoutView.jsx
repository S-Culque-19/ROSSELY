import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';

export default function CheckoutView() {
  const { carrito, usuarioActual, registrarPedido, navegarA } = useStore();
  const [paso, setPaso] = useState(3);
  const [metodoPago, setMetodoPago] = useState('yape');
  const [terminos, setTerminos] = useState(true);
  const [telefono, setTelefono] = useState('');
  const [ordenGenerada, setOrdenGenerada] = useState(null);

  if (!usuarioActual) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white border border-gray-200 p-8 rounded-xl text-center space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Inicia sesión para continuar</h2>
        <p className="text-xs text-gray-500">Debes tener una cuenta registrada para procesar tu orden y coordinar la entrega.</p>
        <button 
          onClick={() => navegarA('auth')}
          className="w-full btn-ripley-dark uppercase"
        >
          Ir a Iniciar Sesión
        </button>
      </div>
    );
  }

  const subtotal = carrito.reduce((acc, item) => acc + item.precio, 0);
  const total = subtotal;

  const handlePagar = () => {
    if (!terminos) return alert('Debes aceptar los términos y condiciones');
    if (!telefono) return alert('Por favor ingresa tu número de celular');

    const id = registrarPedido({
      nombre: usuarioActual.nombre,
      email: usuarioActual.email,
      telefono,
      direccion: "Lima, Perú",
      metodoPago: metodoPago === 'yape' ? 'Yape (+51 971 490 117)' : 'BCP Soles'
    });

    setOrdenGenerada(id);
    setPaso(5);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      {/* 1. STEPPER EXACTO DE RIPLEY (Captura 6) */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center max-w-2xl mx-auto relative">
          <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-gray-200 -z-0"></div>

          {[
            { n: 1, t: "Carro de compras", s: "Revisa tus productos" },
            { n: 2, t: "Inicio de sesión", s: "Cuenta validada" },
            { n: 3, t: "Entrega", s: "Elige donde recibir" },
            { n: 4, t: "Pago", s: "Elige como vas a pagar" },
            { n: 5, t: "¡Listo!", s: "Revisa el detalle" }
          ].map(st => {
            const activo = paso >= st.n;
            return (
              <div key={st.n} className="flex flex-col items-center bg-white px-2 z-10 text-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  activo ? 'bg-[#E6007E] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {st.n}
                </div>
                <p className={`text-[11px] font-semibold mt-1 ${activo ? 'text-gray-800' : 'text-gray-400'}`}>{st.t}</p>
                <p className="text-[9px] text-gray-400 hidden sm:block">{st.s}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. PASO 5: PANTALLA ¡LISTO! */}
      {paso === 5 ? (
        <div className="max-w-lg mx-auto bg-white border border-gray-200 p-8 rounded-xl text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-gray-900">¡Orden Recibida!</h2>
          <p className="text-xs text-gray-600">Número de orden oficial: <b className="text-gray-900">#{ordenGenerada}</b></p>
          
          <div className="bg-gray-50 border p-4 rounded-lg text-left text-xs space-y-2">
            <p className="font-bold text-gray-800">Instrucciones de Pago:</p>
            <p>1. Transfiere <b>S/ {total.toFixed(2)}</b> vía Yape al número <b>+51 971 490 117</b>.</p>
            <p>2. Envía tu comprobante con el número de orden <b>#{ordenGenerada}</b>.</p>
            <p>3. El administrador validará el despacho en el sistema central.</p>
          </div>

          <button onClick={() => navegarA('home')} className="w-full btn-ripley-dark">
            Volver al Inicio
          </button>
        </div>
      ) : (
        /* 3. PROCESO DE PAGO (Capturas 7, 8 y 9) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Izquierda: Medios de Pago */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Medios de pago</h2>

              <div className="bg-[#EBF5FF] text-[#1E429F] p-3 rounded-lg text-xs flex items-center gap-2">
                <span>ℹ️</span> Recuerda activar las compras por internet y proteger tus pagos.
              </div>

              {/* Opción Yape */}
              <div 
                onClick={() => setMetodoPago('yape')}
                className={`p-4 border rounded-xl cursor-pointer transition ${
                  metodoPago === 'yape' ? 'border-[#E6007E] bg-pink-50/20' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-purple-700 text-white font-bold text-xs flex items-center justify-center">
                      S/
                    </span>
                    <div>
                      <p className="font-bold text-xs text-gray-800">Yape Directo</p>
                      <p className="text-[11px] text-purple-700 font-semibold">+51 971 490 117</p>
                    </div>
                  </div>
                  <input type="radio" checked={metodoPago === 'yape'} readOnly className="accent-[#E6007E]" />
                </div>

                {metodoPago === 'yape' && (
                  <div className="mt-4 pt-3 border-t border-gray-100 text-xs space-y-2 text-gray-600">
                    <p className="font-bold text-gray-800">Pago con Yape:</p>
                    <p>1. Ingresa a tu App Yape y transfiere el monto exacto al número <b>+51 971 490 117</b>.</p>
                    <p>2. Ingresa tu número de celular para asociar tu pedido:</p>
                    <input 
                      type="tel" 
                      placeholder="Tu número de celular Yape *" 
                      value={telefono} 
                      onChange={e => setTelefono(e.target.value)}
                      className="ripley-input w-full"
                    />
                  </div>
                )}
              </div>

              {/* Opción BCP */}
              <div 
                onClick={() => setMetodoPago('bcp')}
                className={`p-4 border rounded-xl cursor-pointer transition ${
                  metodoPago === 'bcp' ? 'border-[#E6007E] bg-pink-50/20' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center">
                      BCP
                    </span>
                    <div>
                      <p className="font-bold text-xs text-gray-800">Transferencia Bancaria BCP</p>
                      <p className="text-[11px] text-gray-500">Cta: 191-8839201-0-12</p>
                    </div>
                  </div>
                  <input type="radio" checked={metodoPago === 'bcp'} readOnly className="accent-[#E6007E]" />
                </div>
              </div>

              {/* Boleta */}
              <div className="border-t pt-4 text-xs text-gray-600">
                <p className="font-bold text-gray-800 mb-1">Boleta Electrónica</p>
                <p>La boleta se enviará al siguiente correo: <b>{usuarioActual.email}</b></p>
              </div>
            </div>
          </div>

          {/* Derecha: Resumen de la compra */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900">Resumen de la compra</h3>

              <div className="space-y-2 text-xs border-b pb-3">
                <div className="flex justify-between text-gray-600">
                  <span>Productos ({carrito.length})</span>
                  <span className="text-gray-900 font-semibold">S/ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Entregas (1)</span>
                  <span className="text-green-700 font-semibold">S/ 0.00</span>
                </div>
              </div>

              <div className="flex justify-between text-sm font-bold text-gray-900">
                <span>Total a pagar:</span>
                <span>S/ {total.toFixed(2)}</span>
              </div>

              <div className="flex items-start gap-2 pt-1 text-[11px] text-gray-500">
                <input 
                  type="checkbox" 
                  checked={terminos} 
                  onChange={e => setTerminos(e.target.checked)} 
                  className="accent-[#E6007E] mt-0.5"
                />
                <label>Acepto los términos y condiciones y políticas de privacidad</label>
              </div>

              <button 
                onClick={handlePagar}
                className="w-full btn-ripley-dark py-3"
              >
                Pagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}