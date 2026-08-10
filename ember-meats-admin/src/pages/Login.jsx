import React from 'react';

export default function Login() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 text-2xl font-bold">
            <span className="text-orange-500 text-3xl">🔥</span>
            <span className="font-serif">EmberMeat</span>
          </div>

          <p className="text-neutral-400 text-sm mt-2">
            Bienvenido de nuevo
          </p>
        </div>

        {/* Tarjeta del Login */}
        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8 shadow-2xl">

          <h1 className="text-2xl font-bold text-center mb-2">
            Iniciar sesión
          </h1>

          <p className="text-neutral-400 text-sm text-center mb-8">
            Ingresa tus datos para continuar
          </p>

          {/* Correo */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Correo electrónico
            </label>

            <input
              type="email"
              placeholder="ejemplo@correo.com"
              className="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-neutral-500 outline-none focus:border-orange-500 transition"
            />
          </div>

          {/* Contraseña */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Contraseña
            </label>

            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-neutral-500 outline-none focus:border-orange-500 transition"
            />
          </div>

          {/* Recuperar contraseña */}
          <div className="text-right mb-6">
            <button className="text-orange-500 hover:text-orange-400 text-sm transition">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Botón */}
          <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition shadow-lg">
            Iniciar sesión
          </button>

          {/* Registro */}
          <p className="text-center text-neutral-400 text-sm mt-6">
            ¿No tienes una cuenta?{' '}
            <button className="text-orange-500 hover:text-orange-400 font-medium transition">
              Registrarse
            </button>
          </p>

        </div>

        {/* Regresar */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-neutral-500 hover:text-white text-sm transition"
          >
            ← Volver al inicio
          </a>
        </div>

      </div>

    </div>
  );
}