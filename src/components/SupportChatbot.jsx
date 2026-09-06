import React, { useState } from 'react';
import { MessageCircle, X, Send, PhoneCall } from 'lucide-react';

const FAQS = [
  {
    pregunta: '¿Cuál es la guía de tallas?',
    keywords: ['talla', 'tallas', 'medida', 'medidas', 'guia'],
    respuesta: 'Nuestras pijamas y batas se confeccionan en corte estándar nacional: Talla S (28-30), M (30-32), L (32-34) y XL (36). En lencería manejamos copas 32B, 34B y 36B con tirantes regulables.'
  },
  {
    pregunta: '¿Cuáles son los métodos de pago?',
    keywords: ['pago', 'pagos', 'metodo', 'yape', 'plin', 'bcp', 'bbva', 'tarjeta'],
    respuesta: 'Aceptamos transferencias BCP, BBVA y pagos directos por Yape al número oficial +51 971 490 117. Tu comprobante se valida al instante.'
  },
  {
    pregunta: '¿Cuánto tarda el envío?',
    keywords: ['envio', 'envios', 'tiempo', 'despacho', 'demora', 'lima', 'provincia'],
    respuesta: 'Para Lima Metropolitana el despacho demora de 24 a 48 horas hábiles. Para envíos a provincias (vía Olva Courier o Shalom) toma de 2 a 4 días hábiles.'
  },
  {
    pregunta: '¿Políticas de cambio y garantía?',
    keywords: ['cambio', 'cambios', 'garantia', 'devolucion', 'devoluciones'],
    respuesta: 'Cuentas con hasta 7 días calendario para solicitar cambios de talla. La prenda debe conservar sus etiquetas originales intactas y no mostrar signos de uso.'
  }
];

export default function SupportChatbot() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([
    { remitente: 'bot', texto: '¡Hola! Bienvenida a ROSSELY ✨. ¿En qué te puedo asesorar hoy sobre nuestras prendas de descanso?' }
  ]);
  const [entrada, setEntrada] = useState('');

  const obtenerRespuesta = (texto) => {
    const q = texto.toLowerCase();
    const match = FAQS.find(f => f.keywords.some(k => q.includes(k)));
    if (match) return match.respuesta;
    return 'Disculpa, no encontré una respuesta exacta para eso. Pero con gusto nuestra asesora te atenderá de inmediato por WhatsApp (+51 971 490 117).';
  };

  const enviarMensaje = (texto = entrada) => {
    if (!texto.trim()) return;
    const msgUsuario = { remitente: 'user', texto };
    const botRespuesta = { remitente: 'bot', texto: obtenerRespuesta(texto) };

    setMensajes(prev => [...prev, msgUsuario, botRespuesta]);
    setEntrada('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!abierto && (
        <button
          onClick={() => setAbierto(true)}
          className="bg-[#E6007E] hover:bg-[#c2006a] text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition transform hover:scale-110 cursor-pointer"
          title="Atención al cliente ROSSELY"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {abierto && (
        <div className="bg-white border border-pink-200 w-80 sm:w-96 rounded-3xl shadow-2xl flex flex-col h-[500px] overflow-hidden">
          {/* Header */}
          <div className="bg-[#831843] text-white px-5 py-4 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm tracking-wider">ROSSELY SOPORTE</h3>
              <p className="text-[10px] text-pink-200">Asistente en línea 24/7</p>
            </div>
            <button onClick={() => setAbierto(false)} className="text-white hover:text-pink-200">
              <X className="w-5 h-5 cursor-pointer" />
            </button>
          </div>

          {/* Historial Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FFF5F7]/30 text-xs">
            {mensajes.map((m, idx) => (
              <div key={idx} className={`flex ${m.remitente === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl leading-relaxed ${
                    m.remitente === 'user'
                      ? 'bg-[#831843] text-white rounded-br-none'
                      : 'bg-white border border-pink-100 text-gray-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  {m.texto}
                </div>
              </div>
            ))}

            {/* Sugerencias Rápidas */}
            <div className="pt-2">
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-1.5">Preguntas frecuentes:</p>
              <div className="flex flex-col gap-1.5">
                {FAQS.map((faq) => (
                  <button
                    key={faq.pregunta}
                    onClick={() => enviarMensaje(faq.pregunta)}
                    className="text-left bg-white text-[#831843] border border-pink-200 hover:bg-pink-50 px-3 py-1.5 rounded-xl text-[11px] font-medium transition cursor-pointer"
                  >
                    • {faq.pregunta}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Derivación directa a WhatsApp */}
          <div className="px-4 py-2 bg-white border-t border-pink-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 text-[11px]">¿Atención humana?</span>
            <a
              href="https://wa.me/51971490117?text=Hola%20ROSSELY,%20tengo%20una%20consulta%20sobre%20sus%20prendas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] font-bold flex items-center gap-1 hover:underline text-[11px]"
            >
              <PhoneCall className="w-3.5 h-3.5" /> +51 971 490 117
            </a>
          </div>

          {/* Input de Consulta */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviarMensaje();
            }}
            className="p-3 bg-white border-t border-pink-100 flex gap-2"
          >
            <input
              type="text"
              placeholder="Escribe tu duda aquí..."
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              className="flex-1 bg-[#FFF5F7] border border-pink-200 rounded-xl px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#831843]"
            />
            <button
              type="submit"
              className="bg-[#831843] hover:bg-[#6b1336] text-white p-2.5 rounded-xl transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}