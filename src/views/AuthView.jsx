// ============================================================================
// COMPONENTE 4: GESTIÓN DE AUTENTICACIÓN Y REGISTRO (AuthView.jsx)
// ============================================================================
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, CheckCircle } from 'lucide-react';

export default function AuthView() {
  const { iniciarSesion, registrarUsuario, navegarA } = useStore();
  const [esRegistro, setEsRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (esRegistro) {
      const res = await registrarUsuario(nombre, email, password);
      if (!res.success) setError(res.error);
    } else {
      const res = await iniciarSesion(email, password);
      if (!res.success) setError(res.error);
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-6 py-12 bg-[#FFF5F7] font-sans">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#F8D7E0] shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#701A3B] font-bold">Atelier ROSSELY</span>
          <h2 className="font-serif text-3xl font-normal text-stone-900">{esRegistro ? 'Crea tu Cuenta' : 'Bienvenida'}</h2>
          <p className="text-xs text-stone-500">Ingrese sus credenciales para sincronizar su carrito y pedidos.</p>
        </div>

        {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {esRegistro && (
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">Nombre Completo</label>
              <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-[#FFFBFB] border border-[#F8D7E0] rounded-xl px-4 py-3 text-xs outline-none" />
            </div>
          )}
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">Correo Electrónico</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#FFFBFB] border border-[#F8D7E0] rounded-xl px-4 py-3 text-xs outline-none font-mono" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">Contraseña</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#FFFBFB] border border-[#F8D7E0] rounded-xl px-4 py-3 text-xs outline-none" />
          </div>

          <button type="submit" className="w-full bg-[#701A3B] text-white py-3.5 rounded-xl font-bold uppercase text-xs cursor-pointer shadow-md">
            {esRegistro ? 'Registrarse en el Atelier' : 'Acceder al Atelier'}
          </button>
        </form>

        <div className="text-center pt-2">
          <button onClick={() => setEsRegistro(!esRegistro)} className="text-xs text-[#701A3B] font-bold hover:underline cursor-pointer">
            {esRegistro ? '¿Ya tienes una cuenta? Inicia sesión' : '¿Primera vez descansando con ROSSELY? Crea tu cuenta'}
          </button>
        </div>
      </div>
    </div>
  );
}