import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';

export default function AuthView() {
  const { iniciarSesion, registrarUsuario, recuperarContrasena, authCargando } = useStore();
  const [modo, setModo] = useState('login');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setEnviando(true);
    try {
      if (modo === 'recuperacion') {
        const result = await recuperarContrasena(email);
        if (!result.success) setError(result.error);
        else setMensaje('Si el correo corresponde a una cuenta, recibirás instrucciones para restablecer la contraseña.');
      } else if (modo === 'registro') {
        const result = await registrarUsuario(nombre, email, password);
        if (!result.success) setError(result.error);
      } else {
        const result = await iniciarSesion(email, password);
        if (!result.success) setError(result.error);
      }
    } catch (err) {
      setError(err?.message || 'No se pudo completar la operación.');
    } finally {
      setEnviando(false);
    }
  };

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo);
    setError('');
    setMensaje('');
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-6 py-12 bg-[#FFF5F7] font-sans">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#F8D7E0] shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#701A3B] font-bold">Atelier ROSSELY</span>
          <h2 className="font-serif text-3xl font-normal text-stone-900">
            {modo === 'registro' ? 'Crea tu Cuenta' : modo === 'recuperacion' ? 'Recuperar contraseña' : 'Bienvenida'}
          </h2>
          <p className="text-xs text-stone-500">
            {modo === 'recuperacion' ? 'Te enviaremos las instrucciones al correo asociado a tu cuenta.' : 'Accede de forma segura para sincronizar tu carrito y tus pedidos.'}
          </p>
        </div>

        {error && <div role="alert" className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">{error}</div>}
        {mensaje && <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">{mensaje}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {modo === 'registro' && <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">Nombre completo</label>
            <input type="text" autoComplete="name" required maxLength={120} value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-[#FFFBFB] border border-[#F8D7E0] rounded-xl px-4 py-3 text-xs outline-none" />
          </div>}
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">Correo electrónico</label>
            <input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#FFFBFB] border border-[#F8D7E0] rounded-xl px-4 py-3 text-xs outline-none font-mono" placeholder="tu@correo.com" />
          </div>
          {modo !== 'recuperacion' && <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">Contraseña</label>
            <input type="password" autoComplete={modo === 'registro' ? 'new-password' : 'current-password'} required minLength={modo === 'registro' ? 8 : 1} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#FFFBFB] border border-[#F8D7E0] rounded-xl px-4 py-3 text-xs outline-none" />
          </div>}
          <button disabled={enviando || authCargando} type="submit" className="w-full bg-[#701A3B] disabled:opacity-60 text-white py-3.5 rounded-xl font-bold uppercase text-xs cursor-pointer shadow-md">
            {enviando ? 'Procesando…' : modo === 'registro' ? 'Registrarse en el Atelier' : modo === 'recuperacion' ? 'Enviar instrucciones' : 'Acceder al Atelier'}
          </button>
        </form>

        <div className="flex flex-col items-center gap-3 text-center pt-2">
          {modo === 'login' && <button type="button" onClick={() => cambiarModo('recuperacion')} className="text-xs text-stone-600 hover:underline">¿Olvidaste tu contraseña?</button>}
          <button type="button" onClick={() => cambiarModo(modo === 'registro' || modo === 'recuperacion' ? 'login' : 'registro')} className="text-xs text-[#701A3B] font-bold hover:underline cursor-pointer">
            {modo === 'registro' ? '¿Ya tienes cuenta? Inicia sesión' : modo === 'recuperacion' ? 'Volver al inicio de sesión' : '¿Primera vez en ROSSELY? Crea tu cuenta'}
          </button>
        </div>
      </div>
    </div>
  );
}
