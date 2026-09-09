import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  MessageCircle, 
  X, 
  Send, 
  UserCheck, 
  Sparkles, 
  Truck, 
  CreditCard, 
  Ruler,
  ArrowLeft
} from 'lucide-react';

export default function SupportChatbot() {
  const { esAdmin, usuarioActual } = useStore();

  // El administrador jamás ve la burbuja de cliente
  if (esAdmin) return null;

  const [abierto, setAbierto] = useState(false);
  const [modoEnVivo, setModoEnVivo] = useState(false);
  const [chatId, setChatId] = useState(() => {
    return localStorage.getItem('rossely_chat_id') || null;
  });

  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [cargandoEnvio, setCargandoEnvio] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes, modoEnVivo, abierto]);

  // Escucha mensajes en tiempo real cuando está en modo asesor
  useEffect(() => {
    if (!chatId || !modoEnVivo) return;

    const q = query(
      collection(db, 'chats', chatId, 'mensajes'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMensajes(msgs);
    });

    return () => unsubscribe();
  }, [chatId, modoEnVivo]);

  // Respuestas Automáticas Rápidas de Alta Costura
  const faqRespuestas = {
    tallas: "Nuestras prendas de satén y seda cuentan con un corte anatómico de alta costura (S, M, L). Si estás entre dos tallas, te sugerimos elegir la mayor para un confort absoluto al descansar.",
    shalom: "Confeccionamos cada pieza artesanalmente en nuestro taller matriz de Nuevo Chimbote. Realizamos envíos diarios a todo el Perú vía Shalom con empaque de papel seda y caja de regalo oficial.",
    pagos: "Aceptamos Yape, Plin y transferencias directas escaneando nuestro código QR oficial a nombre de Rosario Estrada (+51 971 490 117)."
  };

  const [faqRespuestaActual, setFaqRespuestaActual] = useState(null);

  // Iniciar Conversación con Asesor Humano en Firestore
  const activarAsesorHumano = async () => {
    setModoEnVivo(true);
    let idActual = chatId;

    if (!idActual) {
      idActual = usuarioActual?.uid || `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setChatId(idActual);
      localStorage.setItem('rossely_chat_id', idActual);
    }

    const clienteNombre = usuarioActual?.nombre || 'Clienta Visitante';
    const clienteEmail = usuarioActual?.email || 'Sin registrar';

    const chatDocRef = doc(db, 'chats', idActual);
    await setDoc(chatDocRef, {
      clienteId: idActual,
      clienteNombre,
      clienteEmail,
      ultimoMensaje: 'Solicitó asesor humano en vivo.',
      ultimaFecha: serverTimestamp(),
      noLeidoPorAdmin: true,
      estado: 'en_espera'
    }, { merge: true });

    // Mensaje inicial del sistema si no hay mensajes previos
    const colMensajes = collection(db, 'chats', idActual, 'mensajes');
    await addDoc(colMensajes, {
      remitente: 'sistema',
      texto: `¡Hola ${clienteNombre}! Una asesora de nuestro taller en Nuevo Chimbote se conectará en unos momentos para ayudarte con tu pedido.`,
      timestamp: serverTimestamp()
    });
  };

  const enviarMensajeCliente = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !chatId) return;

    const txt = nuevoMensaje.trim();
    setNuevoMensaje('');
    setCargandoEnvio(true);

    try {
      await addDoc(collection(db, 'chats', chatId, 'mensajes'), {
        remitente: 'cliente',
        texto: txt,
        timestamp: serverTimestamp()
      });

      await setDoc(doc(db, 'chats', chatId), {
        ultimoMensaje: txt,
        ultimaFecha: serverTimestamp(),
        noLeidoPorAdmin: true,
        estado: 'activo'
      }, { merge: true });
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
    } finally {
      setCargandoEnvio(false);
    }
  };

  return (
    <>
      {/* Botón Flotante (Burbuja Satinada Estilo Messenger) */}
      {!abierto && (
        <button
          onClick={() => setAbierto(true)}
          className="fixed bottom-6 right-6 z-50 bg-[#701A3B] hover:bg-[#56132D] text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center cursor-pointer border-2 border-[#D4AF37] group"
          title="Atención al Cliente ROSSELY"
        >
          <MessageCircle className="w-6 h-6 group-hover:rotate-6 transition-transform" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 text-[11px] font-bold uppercase tracking-widest pl-0 group-hover:pl-2">
            Asesoría Seda
          </span>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
        </button>
      )}

      {/* Ventana Flotante del Chatbot / Soporte Estilo WhatsApp & Messenger */}
      {abierto && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[390px] h-[550px] bg-white rounded-3xl shadow-2xl border border-[#F8D7E0] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 font-sans">
          
          {/* Cabecera Profesional Satinada */}
          <div className="bg-gradient-to-r from-[#701A3B] to-[#56132D] text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              {modoEnVivo && (
                <button 
                  onClick={() => setModoEnVivo(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer mr-1"
                  title="Volver a Preguntas Frecuentes"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center border border-white/20 font-serif font-bold text-sm">
                R
              </div>
              <div>
                <h3 className="font-serif text-xs font-bold tracking-wider">Atelier ROSSELY</h3>
                <p className="text-[9px] text-[#F8D7E0] font-light flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  {modoEnVivo ? 'Asesora en línea (Nuevo Chimbote)' : 'Asistente Virtual 24/7'}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setAbierto(false)}
              className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cuerpo del Chat */}
          <div className="flex-1 p-4 overflow-y-auto bg-[#FFFBFB] space-y-3">
            {!modoEnVivo ? (
              <div className="space-y-4 pt-1">
                <div className="bg-[#FDF5F7] border border-[#F8D7E0] p-4 rounded-2xl text-xs text-stone-700 leading-relaxed space-y-1.5">
                  <p className="font-bold text-[#701A3B] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#A24869]" /> ¡Bienvenida a ROSSELY Sleepwear!
                  </p>
                  <p className="font-light text-[11px] text-stone-600">
                    Selecciona una consulta rápida o comunícate al instante con el taller en Nuevo Chimbote.
                  </p>
                </div>

                {/* Botones de Consultas Rápidas */}
                <div className="space-y-2">
                  <button
                    onClick={() => setFaqRespuestaActual(faqRespuestas.tallas)}
                    className="w-full text-left p-3 rounded-2xl border border-[#F8D7E0] bg-white hover:bg-[#FDF5F7] text-xs font-semibold text-stone-800 transition flex items-center gap-3 shadow-2xs cursor-pointer"
                  >
                    <Ruler className="w-4 h-4 text-[#701A3B] shrink-0" />
                    <span>Guía de Tallas y Calce de Seda</span>
                  </button>

                  <button
                    onClick={() => setFaqRespuestaActual(faqRespuestas.shalom)}
                    className="w-full text-left p-3 rounded-2xl border border-[#F8D7E0] bg-white hover:bg-[#FDF5F7] text-xs font-semibold text-stone-800 transition flex items-center gap-3 shadow-2xs cursor-pointer"
                  >
                    <Truck className="w-4 h-4 text-[#701A3B] shrink-0" />
                    <span>Envíos Shalom (Nuevo Chimbote al Perú)</span>
                  </button>

                  <button
                    onClick={() => setFaqRespuestaActual(faqRespuestas.pagos)}
                    className="w-full text-left p-3 rounded-2xl border border-[#F8D7E0] bg-white hover:bg-[#FDF5F7] text-xs font-semibold text-stone-800 transition flex items-center gap-3 shadow-2xs cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-[#701A3B] shrink-0" />
                    <span>Medios de Pago (Yape / Plin / QR)</span>
                  </button>
                </div>

                {/* Respuesta FAQ Desplegada */}
                {faqRespuestaActual && (
                  <div className="p-3.5 bg-white border-l-4 border-[#701A3B] rounded-r-2xl text-xs text-stone-700 shadow-xs leading-relaxed animate-in fade-in font-light">
                    {faqRespuestaActual}
                  </div>
                )}

                {/* Botón para activar Asesor Humano en Vivo */}
                <div className="pt-2 border-t border-[#F8D7E0]/60">
                  <button
                    onClick={activarAsesorHumano}
                    className="w-full bg-[#701A3B] hover:bg-[#56132D] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                  >
                    <UserCheck className="w-4 h-4 text-[#F8D7E0]" />
                    <span>💬 Iniciar Chat en Vivo con Asesora</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Flujo de Mensajería en Vivo Estilo WhatsApp / Messenger */
              <div className="space-y-3 pt-1">
                <div className="text-center my-1">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-[#701A3B] bg-[#FDF5F7] px-3.5 py-1 rounded-full border border-[#F8D7E0]">
                    ✦ Conectada con Taller Matriz
                  </span>
                </div>

                {mensajes.map((m) => {
                  const esMio = m.remitente === 'cliente';
                  const esSistema = m.remitente === 'sistema';

                  if (esSistema) {
                    return (
                      <div key={m.id} className="text-center my-2">
                        <p className="text-[10px] text-stone-500 bg-[#FDF5F7] p-3 rounded-2xl border border-[#F8D7E0] inline-block font-light leading-relaxed max-w-[90%]">
                          {m.texto}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[9px] text-stone-400 px-1 mb-0.5 font-light">
                        {esMio ? 'Tú' : 'Asesora ROSSELY'}
                      </span>
                      <div
                        className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                          esMio
                            ? 'bg-[#701A3B] text-white rounded-br-xs shadow-xs'
                            : 'bg-white text-stone-800 border border-[#F8D7E0] rounded-bl-xs shadow-xs'
                        }`}
                      >
                        {m.texto}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Formulario de envío de mensajes en modo en vivo */}
          {modoEnVivo && (
            <form onSubmit={enviarMensajeCliente} className="p-3.5 bg-white border-t border-[#FCE4EC] flex items-center gap-2">
              <input
                type="text"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder="Escribe tu mensaje a la asesora..."
                className="flex-1 bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#701A3B] text-stone-800"
              />
              <button
                type="submit"
                disabled={cargandoEnvio || !nuevoMensaje.trim()}
                className="p-2.5 bg-[#701A3B] hover:bg-[#56132D] text-white rounded-xl transition cursor-pointer disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      )}
    </>
  );
}