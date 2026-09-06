import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';

export default function AuthView() {
  const { iniciarSesion, registrarUsuario } = useStore();
  const [esRegistro, setEsRegistro] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (esRegistro) {
      const res = registrarUsuario(nombre, email, password);
      if (!res.success) setErrorMsg(res.error);
    } else {
      const res = iniciarSesion(email, password);
      if (!res.success) setErrorMsg(res.error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
      
      {/* Columna Izquierda: Logo y Bienvenida */}
      <div className="text-center md:text-left space-y-2">
        <h1 className="text-3xl font-extrabold tracking-[0.25em] text-gray-900">
          ROSSELY
        </h1>
        <h2 className="text-2xl font-bold text-[#E6007E]">
          Te damos la bienvenida
        </h2>
        <p className="text-xs text-gray-500">
          Ingresa tu usuario y contraseña para iniciar sesión
        </p>
      </div>

      {/* Columna Derecha: Tarjeta con Inputs de la Captura */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-md space-y-4 max-w-sm w-full mx-auto">
        {errorMsg && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {esRegistro && (
            <div className="relative flex items-center">
              <input 
                type="text" 
                required
                placeholder="Ingresa tu nombre completo*" 
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className="ripley-input w-full"
              />
            </div>
          )}

          <div className="relative flex items-center">
            <input 
              type="text" 
              required
              placeholder={esRegistro ? "Ingresa tu correo @gmail.com*" : "Ingresa tu correo o DNI*"} 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="ripley-input w-full"
            />
          </div>

          <div className="relative flex items-center">
            <input 
              type="password" 
              required
              placeholder="Ingresa tu contraseña*" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="ripley-input w-full"
            />
          </div>

          <button 
            type="submit"
            className="w-full btn-ripley-outline py-2.5 mt-2 rounded-full font-semibold text-xs text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            {esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="text-center pt-2 text-xs">
          {esRegistro ? (
            <p className="text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <button 
                onClick={() => { setEsRegistro(false); setErrorMsg(''); }}
                className="text-[#E6007E] font-bold hover:underline"
              >
                Inicia sesión
              </button>
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-500">
                ¿Primera vez en Rossely?{' '}
                <button 
                  onClick={() => { setEsRegistro(true); setErrorMsg(''); }}
                  className="text-[#E6007E] font-bold hover:underline"
                >
                  Crea tu cuenta
                </button>
              </p>
              <p className="text-[10px] text-gray-400">
                (Acceso administrativo con correo .org.com y contraseña autorizada)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}