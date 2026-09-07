import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Lock, Mail, User, AlertCircle, ArrowRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

export default function AuthView() {
  const { iniciarSesion, registrarUsuario, navegarA } = useStore();
  const [esRegistro, setEsRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setCargando(true);

    const emailTrim = email.trim().toLowerCase();

    // 1. Acceso Administrativo Instantáneo sin bloqueo
    if (emailTrim === 'carmenadeshda.org.com' && password === 'prins2026') {
      const res = await iniciarSesion(emailTrim, password);
      setCargando(false);
      if (res.success) {
        navegarA('admin');
      } else {
        setErrorMsg(res.error || 'Error al iniciar sesión administrativa.');
      }
      return;
    }

    // 2. Validación de Clientes
    if (esRegistro) {
      if (!nombre.trim()) {
        setErrorMsg('Por favor ingresa tu nombre completo.');
        setCargando(false);
        return;
      }
      if (!emailTrim.endsWith('@gmail.com')) {
        setErrorMsg('El registro de clientas está reservado exclusivamente para correos @gmail.com');
        setCargando(false);
        return;
      }
      if (password.length < 6) {
        setErrorMsg('La contraseña debe tener un mínimo de 6 caracteres.');
        setCargando(false);
        return;
      }

      const res = await registrarUsuario(nombre.trim(), emailTrim, password);
      setCargando(false);
      if (res.success) {
        navegarA('home');
      } else {
        setErrorMsg(res.error || 'No se pudo completar el registro.');
      }
    } else {
      const res = await iniciarSesion(emailTrim, password);
      setCargando(false);
      if (res.success) {
        navegarA(res.role === 'admin' ? 'admin' : 'home');
      } else {
        setErrorMsg(res.error || 'Credenciales no reconocidas.');
      }
    }
  };

  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center py-12 px-6 sm:px-10 font-sans">
      <div className="w-full max-w-md bg-white border border-[#F8D7E0] rounded-3xl shadow-xl p-8 sm:p-10 space-y-7 relative overflow-hidden">
        
        {/* Decoración Editorial Satinada */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FDF5F7] rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#FFF5F7] rounded-full blur-2xl pointer-events-none" />

        {/* Encabezado */}
        <div className="text-center space-y-2 relative z-10">
          <span className="inline-flex items-center gap-1 bg-[#FDF5F7] text-[#701A3B] border border-[#F8D7E0] text-[9px] uppercase tracking-[0.25em] px-3 py-1 rounded-full font-bold">
            <Sparkles className="w-3 h-3" /> Atelier ROSSELY
          </span>
          <h2 className="font-serif text-3xl font-black text-[#701A3B] tracking-tight">
            {esRegistro ? 'Crear Cuenta' : 'Bienvenida'}
          </h2>
          <p className="text-xs text-stone-500 font-light max-w-xs mx-auto">
            {esRegistro 
              ? 'Únete al club exclusivo de descanso de seda desde Nuevo Chimbote.' 
              : 'Ingresa tus credenciales para sincronizar tu carrito y pedidos.'}
          </p>
        </div>

        {/* Alerta de Error Elegante (Muestra errores limpios sin el código crudo de Firebase Auth) */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="leading-relaxed font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10 text-xs">
          {esRegistro && (
            <div>
              <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                Nombre Completo *
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-[#A24869] absolute left-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Ej. Carmen Estrada"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl outline-none focus:border-[#701A3B] text-stone-800 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">
              Correo Electrónico *
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-[#A24869] absolute left-3.5" />
              <input
                type="text"
                required
                placeholder={esRegistro ? "tu.nombre@gmail.com" : "correo@gmail.com o .org.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl outline-none focus:border-[#701A3B] text-stone-800 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">
              Contraseña *
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-[#A24869] absolute left-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#FDF5F7] border border-[#F8D7E0] rounded-xl outline-none focus:border-[#701A3B] text-stone-800 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full mt-2 bg-[#701A3B] hover:bg-[#56132D] text-white py-3.5 rounded-xl font-bold uppercase tracking-[0.2em] text-[11px] transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            {cargando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verificando...
              </>
            ) : (
              <>
                <span>{esRegistro ? 'Completar Registro' : 'Acceder al Atelier'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Selector Alternante */}
        <div className="text-center pt-2 relative z-10 border-t border-[#F8D7E0]/60 space-y-2">
          <p className="text-xs text-stone-500 font-light">
            {esRegistro ? '¿Ya tienes una cuenta registrada?' : '¿Primera vez descansando con ROSSELY?'}
          </p>
          <button
            type="button"
            onClick={() => {
              setEsRegistro(!esRegistro);
              setErrorMsg('');
            }}
            className="text-xs font-bold text-[#701A3B] hover:underline uppercase tracking-wider cursor-pointer"
          >
            {esRegistro ? 'Iniciar Sesión' : 'Crea tu Cuenta con @gmail.com'}
          </button>
        </div>

        {/* Nota de Despacho */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400 font-light text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Taller matriz en Nuevo Chimbote • Envíos seguros vía Shalom</span>  
        </div>

      </div>
    </div>
  );
}