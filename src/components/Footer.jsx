import React from 'react';
import { useStore } from '../context/StoreContext';

export default function Footer() {
  const { navegarA } = useStore();

  return (
    <footer className="w-full bg-[#FAF5F6] text-stone-700 pt-16 pb-12 mt-24 border-t border-[#F8D7E0] font-sans">
      <div className="w-full px-6 sm:px-10 md:px-16">
        
        {/* Grid de 4 Columnas Full-Width */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14 pb-14 border-b border-[#F8D7E0]/70">
          
          {/* Columna 1: Marca & Identidad */}
          <div className="space-y-4">
            <div>
              <span className="font-serif text-2xl font-black tracking-[0.25em] text-[#701A3B] block">
                ROSSELY
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#A24869] font-semibold block mt-0.5">
                Sleepwear & Lingerie
              </span>
            </div>
            
            <p className="text-xs text-stone-500 font-light leading-relaxed max-w-sm">
              Prendas de descanso confeccionadas con satín de seda suave y cortes elegantes, pensadas para acompañar tu bienestar con distinción.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com/rossely_sleepwear"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-[#F8D7E0] flex items-center justify-center text-stone-600 hover:text-[#701A3B] hover:border-[#701A3B] transition"
                aria-label="Instagram ROSSELY"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-[#F8D7E0] flex items-center justify-center text-stone-600 hover:text-[#701A3B] hover:border-[#701A3B] transition"
                aria-label="Facebook ROSSELY"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Columna 2: Comunidad & Atención */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-900">
              Comunidad & Soporte
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-600 font-light">
              <li>
                <button 
                  onClick={() => navegarA('community')} 
                  className="hover:text-[#701A3B] font-semibold text-[#701A3B] transition cursor-pointer text-left flex items-center gap-1"
                >
                  ✦ Experiencias de Seda (Comunidad)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navegarA('catalog')} 
                  className="hover:text-[#701A3B] transition cursor-pointer text-left"
                >
                  • Colección Completa
                </button>
              </li>
              <li><a href="#guia-tallas" className="hover:text-[#701A3B] transition">• Guía de Tallas ROSSELY</a></li>
              <li><a href="#envios" className="hover:text-[#701A3B] transition">• Envíos Lima y Provincias</a></li>
              <li><a href="#cambios" className="hover:text-[#701A3B] transition">• Políticas de Cambio</a></li>
            </ul>
          </div>

          {/* Columna 3: Medios de Pago */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-900">
              Medios de Pago
            </h4>
            <p className="text-xs text-stone-500 font-light">
              Aceptamos pagos directos y billeteras electrónicas:
            </p>
            
            <div className="grid grid-cols-2 gap-2 pt-1 max-w-xs">
              <div className="bg-white border border-[#F8D7E0] rounded-xl py-2 px-3 text-center shadow-2xs">
                <span className="text-[11px] font-bold text-purple-700">YAPE</span>
              </div>
              <div className="bg-white border border-[#F8D7E0] rounded-xl py-2 px-3 text-center shadow-2xs">
                <span className="text-[11px] font-bold text-sky-600">PLIN</span>
              </div>
              <div className="bg-white border border-[#F8D7E0] rounded-xl py-2 px-3 text-center shadow-2xs">
                <span className="text-[11px] font-bold text-orange-600">BCP</span>
              </div>
              <div className="bg-white border border-[#F8D7E0] rounded-xl py-2 px-3 text-center shadow-2xs">
                <span className="text-[11px] font-bold text-blue-700">BBVA</span>
              </div>
            </div>
          </div>

          {/* Columna 4: Canal de Contacto */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-900">
              Contacto Oficial
            </h4>
            <p className="text-xs text-stone-500 font-light">
              Asesoría de tallas y pedidos personalizados vía WhatsApp:
            </p>
            
            <a
              href="https://wa.me/51971490117?text=Hola%20ROSSELY,%20tengo%20una%20consulta"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-white hover:bg-[#FDF5F7] text-stone-800 border border-[#F8D7E0] px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-2xs"
            >
              <span className="text-emerald-500 text-sm">💬</span>
              <span>+51 971 490 117</span>
            </a>

            <p className="text-[11px] text-stone-500 font-light pt-1">
              ✨ Cada prenda incluye empaque de regalo satinado ROSSELY
            </p>
          </div>

        </div>

        {/* Sub-barra Inferior */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-light">
          <p>© {new Date().getFullYear()} ROSSELY. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-[11px]">
            <a href="#privacidad" className="hover:text-[#701A3B] transition">Privacidad</a>
            <a href="#terminos" className="hover:text-[#701A3B] transition">Términos y Condiciones</a>
            <a href="#reclamaciones" className="hover:text-[#701A3B] transition">Libro de Reclamaciones</a>
          </div>
        </div>

      </div>
    </footer>
  );
}