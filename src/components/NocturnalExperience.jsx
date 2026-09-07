import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Moon, Sparkles, Check, X } from 'lucide-react';

export default function NocturnalExperience() {
  const { usuarioActual, esAdmin } = useStore();

  // 1. REGLA ESTRICTA: Solo clientas registradas. Jamás anónimos ni Admin.
  if (!usuarioActual || esAdmin) {
    return null;
  }

  const [config, setConfig] = useState({
    activo: true,
    mensaje: "El confort de la seda te espera esta noche...",
    textoBoton: "+ BENEFICIO",
    codigoDescuento: "SEDA-NOCHE",
    horaInicio: 20,
    horaFin: 6
  });

  const [esHorarioNocturno, setEsHorarioNocturno] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [visible, setVisible] = useState(true);

  // 2. Lee la configuración que tú guardas desde el Dashboard
  useEffect(() => {
    const docRef = doc(db, 'configuracion', 'experiencia_nocturna');
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setConfig(prev => ({ ...prev, ...snap.data() }));
      }
    });
    return () => unsub();
  }, []);

  // 3. Valida el horario configurado
  useEffect(() => {
    const verificarHora = () => {
      const horaActual = new Date().getHours();
      const { horaInicio, horaFin } = config;
      
      if (horaInicio > horaFin) {
        setEsHorarioNocturno(horaActual >= horaInicio || horaActual < horaFin);
      } else {
        setEsHorarioNocturno(horaActual >= horaInicio && horaActual < horaFin);
      }
    };

    verificarHora();
    const intervalo = setInterval(verificarHora, 60000);
    return () => clearInterval(intervalo);
  }, [config]);

  if (!config.activo || !esHorarioNocturno || !visible) {
    return null;
  }

  const handleCopiarCupon = () => {
    navigator.clipboard.writeText(config.codigoDescuento || 'SEDA-NOCHE');
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3500);
  };

  return (
    <aside className="fixed bottom-6 left-6 z-40 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-500 font-sans">
      <div className="bg-[#1C1819]/95 backdrop-blur-md border border-[#701A3B]/60 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#701A3B]/40 border border-[#701A3B] flex items-center justify-center shrink-0">
          <Moon className="w-4 h-4 text-[#F8D7E0]" />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <p className="text-[11px] font-medium text-stone-200 truncate">
            {config.mensaje}
          </p>
          <span className="text-[9px] text-[#A24869] font-serif uppercase tracking-wider block">
            Exclusivo para ti, {usuarioActual.nombre?.split(' ')[0]}
          </span>
        </div>

        <button
          onClick={handleCopiarCupon}
          className="bg-gradient-to-r from-[#701A3B] to-[#8E214B] text-[#FFF5F7] px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shrink-0 border border-[#F8D7E0]/20"
        >
          {copiado ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span>¡Copiado!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{config.textoBoton || '+ BENEFICIO'}</span>
            </>
          )}
        </button>

        <button
          onClick={() => setVisible(false)}
          className="text-stone-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}