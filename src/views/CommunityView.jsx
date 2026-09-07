import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { Star, CheckCircle2, Heart, Sparkles, X, MessageSquareHeart, Loader2 } from 'lucide-react';

const SENSACIONES = [
  'Tacto de Seda',
  'Frescura Absoluta',
  'Calce Perfecto',
  'Elegancia Pura',
  'Acabado Premium'
];

export default function CommunityView() {
  const [testimonios, setTestimonios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  // Estado del formulario
  const [form, setForm] = useState({
    nombre: '',
    prenda: '',
    calificacion: 5,
    sensacion: SENSACIONES[0],
    comentario: ''
  });

  // Suscripción en tiempo real a la colección "testimonios"
  useEffect(() => {
    const q = query(collection(db, 'testimonios'), orderBy('fecha', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTestimonios(docs);
      setCargando(false);
    }, (error) => {
      console.error("Error al obtener testimonios:", error);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.prenda.trim() || !form.comentario.trim()) {
      alert("Por favor completa todos los campos requeridos.");
      return;
    }

    setEnviando(true);
    try {
      await addDoc(collection(db, 'testimonios'), {
        nombre: form.nombre.trim(),
        prenda: form.prenda.trim(),
        calificacion: Number(form.calificacion),
        sensacion: form.sensacion,
        comentario: form.comentario.trim(),
        fecha: serverTimestamp(),
        verificado: true
      });

      setExito(true);
      setTimeout(() => {
        setExito(false);
        setModalAbierto(false);
        setForm({
          nombre: '',
          prenda: '',
          calificacion: 5,
          sensacion: SENSACIONES[0],
          comentario: ''
        });
      }, 1800);
    } catch (err) {
      console.error("Error al registrar testimonio:", err);
      alert("No se pudo publicar la reseña. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="w-full py-8 px-6 sm:px-10 md:px-16 font-sans space-y-16">
      
      {/* 1. ENCABEZADO EDITORIAL */}
      <section className="w-full text-center max-w-3xl mx-auto space-y-4 pt-4">
        <span className="inline-flex items-center gap-1.5 bg-[#FDF5F7] border border-[#F8D7E0] text-[#701A3B] text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] px-4 py-1.5 rounded-full uppercase">
          <Sparkles className="w-3.5 h-3.5" /> Comunidad ROSSELY
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-stone-900 tracking-tight leading-tight">
          Experiencias de Seda
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed max-w-xl mx-auto">
          Descubre las sensaciones y momentos compartidos por quienes han transformado su descanso nocturno con nuestras piezas exclusivas.
        </p>

        <div className="pt-2">
          <button
            onClick={() => setModalAbierto(true)}
            className="inline-flex items-center gap-2 bg-[#701A3B] hover:bg-[#56132D] text-white text-[11px] uppercase font-bold tracking-[0.2em] px-8 py-3.5 rounded-full shadow-xs transition duration-300 transform hover:-translate-y-0.5 cursor-pointer"
          >
            ✦ Compartir mi Experiencia
          </button>
        </div>
      </section>

      {/* 2. CUADRÍCULA DE TESTIMONIOS EDITORIALES */}
      <section className="w-full">
        {cargando ? (
          <div className="w-full bg-white p-16 rounded-3xl border border-[#FCE4EC] text-center text-xs text-stone-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#701A3B]" />
            Cargando el diario de la comunidad...
          </div>
        ) : testimonios.length === 0 ? (
          <div className="w-full bg-white p-16 rounded-3xl border border-[#FCE4EC] text-center space-y-3">
            <MessageSquareHeart className="w-12 h-12 text-[#A24869] mx-auto opacity-70" />
            <h3 className="font-serif text-lg font-bold text-stone-800">Sé la primera persona en compartir su experiencia</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto font-light">
              Cuéntale a la comunidad cómo sientes la suavidad y el corte de tus prendas ROSSELY.
            </p>
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonios.map((t) => (
              <div
                key={t.id}
                className="bg-white border border-[#FCE4EC] hover:border-[#701A3B]/40 p-7 rounded-3xl shadow-xs hover:shadow-md transition duration-300 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-4">
                  {/* Puntuación y Sensación */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < t.calificacion
                              ? 'fill-[#701A3B] text-[#701A3B]'
                              : 'text-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold text-[#701A3B] bg-[#FDF5F7] border border-[#F8D7E0] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {t.sensacion}
                    </span>
                  </div>

                  {/* Reseña en tipografía editorial */}
                  <p className="text-stone-700 text-sm font-light leading-relaxed italic">
                    "{t.comentario}"
                  </p>
                </div>

                {/* Datos del Cliente y Prenda */}
                <div className="pt-4 border-t border-[#FCE4EC]/70 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-serif text-sm font-bold text-stone-900">
                        {t.nombre}
                      </span>
                      {t.verificado && (
                        <span className="inline-flex items-center text-[10px] text-emerald-700 font-medium" title="Comprador verificado">
                          <CheckCircle2 className="w-3 h-3 ml-0.5 fill-emerald-100" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#A24869] font-medium tracking-wide">
                      {t.prenda}
                    </p>
                  </div>

                  <span className="text-[10px] text-stone-400 font-light">
                    {t.fecha?.toDate
                      ? t.fecha.toDate().toLocaleDateString('es-PE', { month: 'short', day: 'numeric' })
                      : 'Reciente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. MODAL EDITORIAL: COMPARTE TU EXPERIENCIA */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#F8D7E0] overflow-hidden p-6 sm:p-8 space-y-6">
            
            {/* Botón Cerrar */}
            <button
              onClick={() => setModalAbierto(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {exito ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#FDF5F7] border border-[#F8D7E0] text-[#701A3B] flex items-center justify-center mx-auto">
                  <Heart className="w-6 h-6 fill-[#701A3B]" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  ¡Gracias por ser parte de ROSSELY!
                </h3>
                <p className="text-xs text-stone-500 font-light max-w-xs mx-auto">
                  Tu testimonio se ha publicado correctamente y ya es visible en la comunidad.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="text-center space-y-1">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#A24869] font-bold">
                    Tu Voz en ROSSELY
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    Cuéntanos tu Experiencia
                  </h3>
                </div>

                {/* Calificación Interactiva */}
                <div className="flex flex-col items-center space-y-1.5 py-1">
                  <div className="flex gap-2 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setForm({ ...form, calificacion: num })}
                        className="p-1 hover:scale-110 transition cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            num <= form.calificacion
                              ? 'fill-[#701A3B] text-[#701A3B]'
                              : 'text-stone-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest font-medium">
                    {form.calificacion} de 5 Estrellas
                  </span>
                </div>

                {/* Campos de Texto */}
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Nombre o Iniciales *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Valeria M."
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      className="w-full bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl px-4 py-2.5 outline-none focus:border-[#701A3B] text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Prenda Adquirida *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Set Pijama Seda Rosa Talla M"
                      value={form.prenda}
                      onChange={(e) => setForm({ ...form, prenda: e.target.value })}
                      className="w-full bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl px-4 py-2.5 outline-none focus:border-[#701A3B] text-stone-800"
                    />
                  </div>

                  {/* Chips de Sensación */}
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-2">
                      Sensación Destacada
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SENSACIONES.map((sens) => (
                        <button
                          type="button"
                          key={sens}
                          onClick={() => setForm({ ...form, sensacion: sens })}
                          className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-semibold transition cursor-pointer border ${
                            form.sensacion === sens
                              ? 'bg-[#701A3B] text-white border-[#701A3B]'
                              : 'bg-white text-stone-600 border-[#F8D7E0] hover:border-[#701A3B]'
                          }`}
                        >
                          {sens}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Tu Opinión *
                    </label>
                    <textarea
                      required
                      rows="3"
                      placeholder="¿Cómo describirías el satén, los acabados y el descanso con esta prenda?"
                      value={form.comentario}
                      onChange={(e) => setForm({ ...form, comentario: e.target.value })}
                      className="w-full bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl p-3 outline-none focus:border-[#701A3B] text-stone-800 font-light resize-none"
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full bg-[#701A3B] hover:bg-[#56132D] text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {enviando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Publicando...
                    </>
                  ) : (
                    'Publicar en la Comunidad'
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}