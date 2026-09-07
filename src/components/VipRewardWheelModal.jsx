import React, { useState, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Sparkles, Trophy, Gift, X, Check, Copy } from 'lucide-react';

const PREMIOS_ESTANDAR = [
  { label: '5% OFF', valor: 'DESC-5', bg: '#FFF5F7', color: '#701A3B' },
  { label: '10% OFF', valor: 'DESC-10', bg: '#701A3B', color: '#FFF5F7' },
  { label: '15% OFF', valor: 'DESC-15', bg: '#FCE4EC', color: '#701A3B' },
  { label: '20% OFF', valor: 'DESC-20', bg: '#56132D', color: '#FFF5F7' },
  { label: '5% OFF', valor: 'DESC-5B', bg: '#FFF5F7', color: '#701A3B' },
  { label: '10% OFF', valor: 'DESC-10B', bg: '#A24869', color: '#FFF5F7' },
];

const PREMIOS_GOLD = [
  { label: '20% OFF', valor: 'GOLD-20', bg: '#1C1819', color: '#D4AF37' },
  { label: '25% OFF', valor: 'GOLD-25', bg: '#D4AF37', color: '#1C1819' },
  { label: '30% OFF', valor: 'GOLD-30', bg: '#701A3B', color: '#FFF5F7' },
  { label: 'PRENDA SEDA', valor: 'GOLD-SEDA', bg: '#2A101A', color: '#F8D7E0' },
  { label: '25% OFF', valor: 'GOLD-25B', bg: '#D4AF37', color: '#1C1819' },
  { label: '30% OFF', valor: 'GOLD-30B', bg: '#701A3B', color: '#FFF5F7' },
];

export default function VipRewardWheelModal({ isOpen, onClose, tipo = 'estandar', cliente, onPremioReclamado }) {
  if (!isOpen) return null;

  const esGold = tipo === 'gold';
  const premios = esGold ? PREMIOS_GOLD : PREMIOS_ESTANDAR;
  const numSectores = premios.length;
  const arco = 360 / numSectores;

  const [girando, setGirando] = useState(false);
  const [rotacionTotal, setRotacionTotal] = useState(0);
  const [premioGanado, setPremioGanado] = useState(null);
  const [cuponGenerado, setCuponGenerado] = useState('');
  const [copiado, setCopiado] = useState(false);

  const girarRuleta = async () => {
    if (girando || premioGanado) return;

    setGirando(true);
    // Seleccionar índice ganador aleatorio
    const indiceGanador = Math.floor(Math.random() * numSectores);
    const vueltasCompletas = 5 + Math.floor(Math.random() * 3); // 5 a 7 vueltas completas
    
    // Cálculo angular para que el puntero superior (270°) coincida con el centro del sector
    const anguloCentroSector = (indiceGanador * arco) + (arco / 2);
    const destinoFinal = (vueltasCompletas * 360) + (360 - anguloCentroSector);

    setRotacionTotal(destinoFinal);

    setTimeout(async () => {
      const premio = premios[indiceGanador];
      const codigo = `ROSS-${premio.valor}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setPremioGanado(premio);
      setCuponGenerado(codigo);
      setGirando(false);

      // Persistir cupón en la subcolección del cliente
      if (cliente?.uid || cliente?.id) {
        try {
          const idTarget = cliente.uid || cliente.id;
          await addDoc(collection(db, 'usuarios', idTarget, 'premios'), {
            tipoRuleta: tipo,
            premio: premio.label,
            codigoCupon: codigo,
            reclamado: false,
            fecha: serverTimestamp()
          });
        } catch (err) {
          console.error("Error guardando premio:", err);
        }
      }

      if (onPremioReclamado) onPremioReclamado(codigo, premio);
    }, 4500);
  };

  const copiarCodigo = () => {
    navigator.clipboard.writeText(cuponGenerado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border flex flex-col items-center text-center overflow-hidden ${
        esGold 
          ? 'bg-gradient-to-b from-[#1C1819] via-[#2A101A] to-[#120B0E] border-[#D4AF37]/50 text-white' 
          : 'bg-white border-[#F8D7E0] text-stone-900'
      }`}>
        
        {/* Botón Cerrar */}
        {!girando && (
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-full transition cursor-pointer ${
              esGold ? 'text-stone-400 hover:text-white hover:bg-white/10' : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Insignia y Cabecera */}
        <div className="flex items-center gap-2 mb-2">
          {esGold ? (
            <span className="bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" /> Club VIP Gold ROSSELY
            </span>
          ) : (
            <span className="bg-[#FFF5F7] border border-[#F8D7E0] text-[#701A3B] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#701A3B]" /> Recompensa por Compra $\ge$ S/. 300
            </span>
          )}
        </div>

        <h2 className={`font-serif text-2xl font-black mb-1 ${esGold ? 'text-[#D4AF37]' : 'text-[#701A3B]'}`}>
          {esGold ? 'Ruleta Exclusiva Semanal' : 'Ruleta de Seda ROSSELY'}
        </h2>
        <p className={`text-xs max-w-xs mb-6 font-light ${esGold ? 'text-stone-300' : 'text-stone-500'}`}>
          {esGold 
            ? 'Has superado los S/. 1,000 en compras esta semana. Gira para obtener beneficios exclusivos de alta gama.' 
            : 'Tu orden califica para un beneficio directo en satén. Gira y descubre tu beneficio.'}
        </p>

        {/* Contenedor de la Ruleta */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 mb-6 flex items-center justify-center">
          
          {/* Puntero Superior */}
          <div className="absolute -top-3 z-30 flex flex-col items-center">
            <div className={`w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] drop-shadow-md ${
              esGold ? 'border-t-[#D4AF37]' : 'border-t-[#701A3B]'
            }`} />
          </div>

          {/* Disco Giratorio SVG */}
          <div
            className="w-full h-full rounded-full shadow-2xl relative overflow-hidden transition-transform duration-[4500ms] ease-[cubic-bezier(0.15,0.95,0.35,1)]"
            style={{ transform: `rotate(${rotacionTotal}deg)` }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full rounded-full">
              {premios.map((p, i) => {
                const anguloInicio = (i * arco) * (Math.PI / 180);
                const anguloFin = ((i + 1) * arco) * (Math.PI / 180);
                const x1 = 50 + 50 * Math.cos(anguloInicio);
                const y1 = 50 + 50 * Math.sin(anguloInicio);
                const x2 = 50 + 50 * Math.cos(anguloFin);
                const y2 = 50 + 50 * Math.sin(anguloFin);

                const d = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
                const rotacionTexto = (i * arco) + (arco / 2);

                return (
                  <g key={i}>
                    <path d={d} fill={p.bg} stroke={esGold ? '#D4AF37' : '#F8D7E0'} strokeWidth="0.5" />
                    <text
                      x="50"
                      y="20"
                      fill={p.color}
                      fontSize="4.5"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${rotacionTexto} 50 50)`}
                    >
                      {p.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Eje Central */}
          <div className={`absolute w-14 h-14 rounded-full shadow-lg flex items-center justify-center font-serif font-black text-xs border-2 ${
            esGold 
              ? 'bg-[#1C1819] border-[#D4AF37] text-[#D4AF37]' 
              : 'bg-[#701A3B] border-[#FFF5F7] text-white'
          }`}>
            Seda
          </div>
        </div>

        {/* Sección de Acción o Resultado */}
        {!premioGanado ? (
          <button
            onClick={girarRuleta}
            disabled={girando}
            className={`w-full max-w-xs py-3.5 rounded-2xl font-bold uppercase tracking-widest text-xs transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 ${
              esGold 
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89020] text-stone-900 hover:brightness-110' 
                : 'bg-[#701A3B] hover:bg-[#56132D] text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{girando ? 'Determinando Beneficio...' : 'Girar Ruleta Ahora'}</span>
          </button>
        ) : (
          <div className="w-full max-w-sm space-y-3 animate-in zoom-in-95">
            <div className={`p-4 rounded-2xl border text-center ${
              esGold ? 'bg-white/5 border-[#D4AF37]/40' : 'bg-[#FFF5F7] border-[#F8D7E0]'
            }`}>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block mb-1">
                ¡Felicidades! Obtuviste:
              </span>
              <p className={`font-serif text-2xl font-black ${esGold ? 'text-[#D4AF37]' : 'text-[#701A3B]'}`}>
                {premioGanado.label}
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="font-mono text-xs px-3 py-1 rounded-lg bg-black/20 border border-current font-bold">
                  {cuponGenerado}
                </span>
                <button
                  onClick={copiarCodigo}
                  className="p-1.5 rounded-lg bg-[#701A3B] text-white hover:opacity-90 transition cursor-pointer"
                  title="Copiar cupón"
                >
                  {copiado ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Packaging Obligatorio */}
            <p className={`text-[10px] font-serif italic text-center ${esGold ? 'text-stone-300' : 'text-stone-500'}`}>
              Todos los productos son envueltos en papel seda y con su respectiva caja ROSSELY.
            </p>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-current text-xs font-bold uppercase tracking-wider hover:bg-black/10 transition cursor-pointer"
            >
              Cerrar y Usar en Mi Pedido
            </button>
          </div>
        )}

      </div>
    </div>
  );
}