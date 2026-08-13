import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import '../assets/EmberMeat.css';

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (!aceptaTerminos) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }
    console.log('Registro:', form);
  };

  return (
    <div className="ember-login-container">
      {/* LOGO */}
      <div className="ember-logo">
        <span className="ember-logo-text">EmberMeat</span>
      </div>

      <div className="ember-card">
        <h1 className="ember-title">Crear cuenta</h1>
        <p className="ember-subtitle">
          Únete a EmberMeat y disfruta nuestros productos artesanales
        </p>

        <form className="ember-form" onSubmit={handleSubmit}>
          {/* NOMBRE COMPLETO */}
          <div className="ember-input-group">
            <User size={18} strokeWidth={1.8} className="ember-input-icon" />
            <input
              type="text"
              name="nombre"
              className="ember-input"
              placeholder="Nombre completo"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>

          {/* CORREO */}
          <div className="ember-input-group">
            <Mail size={18} strokeWidth={1.8} className="ember-input-icon" />
            <input
              type="email"
              name="email"
              className="ember-input"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* TELÉFONO */}
          <div className="ember-input-group">
            <Phone size={18} strokeWidth={1.8} className="ember-input-icon" />
            <input
              type="tel"
              name="telefono"
              className="ember-input ember-input-phone"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={handleChange}
              required
            />
          </div>

          {/* CONTRASEÑA */}
          <div className="ember-input-group">
            <Lock size={18} strokeWidth={1.8} className="ember-input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              className="ember-input ember-input-password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="ember-toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
            </button>
          </div>

          {/* CONFIRMAR CONTRASEÑA */}
          <div className="ember-input-group">
            <Lock size={18} strokeWidth={1.8} className="ember-input-icon" />
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              className="ember-input ember-input-password"
              placeholder="Confirmar contraseña"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="ember-toggle-password"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showConfirm ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
            </button>
          </div>

          {/* TÉRMINOS */}
          <label className="ember-terms">
            <input
              type="checkbox"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
            />
            <span>
              Acepto los{' '}
              <NavLink to="/terminos" className="ember-terms-link">
                términos y condiciones
              </NavLink>
            </span>
          </label>

          <button type="submit" className="ember-btn-primary">
            Crear cuenta
          </button>

          <div className="ember-divider">
            <span className="ember-divider-line"></span>
            <span className="ember-divider-text">o</span>
            <span className="ember-divider-line"></span>
          </div>

          <p className="ember-register">
            ¿Ya tienes cuenta?{' '}
            <NavLink to="/login" className="ember-register-link">
              Inicia sesión
            </NavLink>
          </p>
        </form>
      </div>
    </div>
  );
}