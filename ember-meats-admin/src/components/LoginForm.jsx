
import { useState } from 'react';
import '../assets/styles/LoginEmberMeat.css';

const demoUsers = [
  { role: 'cliente', email: 'cliente@test.com', pass: '12345678' },
  { role: 'vendedor', email: 'vendedor@test.com', pass: '12345678' },
  { role: 'repartidor', email: 'repartidor@test.com', pass: '12345678' },
  { role: 'admin', email: 'admin@test.com', pass: '12345678' },
];

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Tu lógica de autenticación aquí
    console.log('Login:', { email, password });
  };

  return (
    <div className="ember-login-container">
      <div className="ember-logo">
        <span className="ember-logo-text">EmberMeat</span>
      </div>

      <div className="ember-card">
        <h1 className="ember-title">Iniciar sesión</h1>
        <p className="ember-subtitle">Accede a tu cuenta EmberMeat</p>

        <form className="ember-form" onSubmit={handleSubmit}>
          <div className="ember-input-group">
            <svg className="ember-input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <input
              type="email"
              className="ember-input"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="ember-input-group">
            <svg className="ember-input-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              type={showPassword ? 'text' : 'password'}
              className="ember-input ember-input-password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="ember-toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                  <line x1="2" x2="22" y1="2" y2="22"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>

          <a href="/recuperar" className="ember-forgot">¿Olvidaste tu contraseña?</a>

          <button type="submit" className="ember-btn-primary">Ingresar</button>

         
          <div className="ember-divider">
            <span className="ember-divider-line"></span>
            <span className="ember-divider-text">o</span>
            <span className="ember-divider-line"></span>
          </div>

          <p className="ember-register">
            ¿No tienes cuenta? <a href="/registro" className="ember-register-link">Regístrate</a>
          </p>
        </form>
      </div>
    </div>
  );
}