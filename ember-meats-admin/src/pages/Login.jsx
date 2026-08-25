import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import '../assets/EmberMeat.css';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', { email, password });
  };

  return (
    <div className="ember-login-container">
      {/* LOGO */}  
      <div className="ember-logo">
        <span className="ember-logo-text">EmberMeat</span>
      </div>

      <div className="ember-card">
        <h1 className="ember-title">Iniciar sesión</h1>
        <p className="ember-subtitle">Accede a tu cuenta EmberMeat</p>

        <form className="ember-form" onSubmit={handleSubmit}>
          {/* EMAIL */}
          <div className="ember-input-group">
            <Mail size={18} strokeWidth={1.8} className="ember-input-icon" />
            <input
              type="email"
              className="ember-input"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="ember-input-group">
            <Lock size={18} strokeWidth={1.8} className="ember-input-icon" />
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
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                <EyeOff size={18} strokeWidth={1.8} />
              ) : (
                <Eye size={18} strokeWidth={1.8} />
              )}
            </button>
          </div>

          <NavLink to="/recuperar" className="ember-forgot">
            ¿Olvidaste tu contraseña?
          </NavLink>

          <NavLink to="/dashboard" type="submit" className="ember-btn-primary text-decoration-none text-center">
            Ingresar
          </NavLink>

          {/* BOTÓN REGRESAR - estilo secundario  */}
           <NavLink
            to="/"
            className="ember-btn-primary text-decoration-none text-center"
          >
            Regresar al inicio
          </NavLink>

          <div className="ember-divider">
            <span className="ember-divider-line"></span>
            <span className="ember-divider-text">o</span>
            <span className="ember-divider-line"></span>
          </div>

          <p className="ember-register">
            ¿No tienes cuenta?{' '}
            <NavLink to="/Registrarse" className="ember-register-link">
              Regístrate
            </NavLink>
          </p>
        </form>
      </div>
    </div>
  );
}