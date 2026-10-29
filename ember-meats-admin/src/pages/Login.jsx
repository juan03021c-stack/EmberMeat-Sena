
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { login } from '../services/Api';
import '../assets/EmberMeat.css';

export default function LoginForm() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setError('');
        setLoading(true);

        try {
            const resultado = await login({
                email: email.trim(),
                password,
            });

            const usuario = resultado.usuario;

            if (!usuario || !usuario.rol_nombre) {
                throw new Error(
                    'El servidor no devolvió la información del rol.'
                );
            }

            const rol = String(usuario.rol_nombre)
                .trim()
                .toLowerCase();

            const rutasPorRol = {
                administrador: '/dashboard',
                vendedor: '/ventas',
                repartidor: '/ordenes',
            };

            const ruta = rutasPorRol[rol];

            if (!ruta) {
                throw new Error(
                    'Tu rol no tiene acceso al panel administrativo.'
                );
            }

            // Guardar únicamente los datos públicos del usuario.
            localStorage.setItem(
                'usuarioEmber',
                JSON.stringify({
                    id: usuario.id,
                    nombre: usuario.nombre,
                    correo: usuario.correo,
                    rol_id: usuario.rol_id,
                    rol_nombre: rol,
                })
            );

            navigate(ruta, { replace: true });

        } catch (err) {
            setError(
                err.message ||
                'No fue posible iniciar sesión. Inténtalo nuevamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ember-login-container">
            <div className="ember-logo">
                <span className="ember-logo-text">EmberMeat</span>
            </div>

            <div className="ember-card">
                <h1 className="ember-title">Iniciar sesión</h1>

                <p className="ember-subtitle">
                    Accede al panel administrativo de EmberMeat
                </p>

                <form
                    className="ember-form"
                    onSubmit={handleSubmit}
                >
                    <div className="ember-input-group">
                        <Mail
                            size={18}
                            strokeWidth={1.8}
                            className="ember-input-icon"
                        />

                        <input
                            type="email"
                            className="ember-input"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="username"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="ember-input-group">
                        <Lock
                            size={18}
                            strokeWidth={1.8}
                            className="ember-input-icon"
                        />

                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="ember-input ember-input-password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                            disabled={loading}
                        />

                        <button
                            type="button"
                            className="ember-toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={
                                showPassword
                                    ? 'Ocultar contraseña'
                                    : 'Mostrar contraseña'
                            }
                            disabled={loading}
                        >
                            {showPassword ? (
                                <EyeOff size={18} strokeWidth={1.8} />
                            ) : (
                                <Eye size={18} strokeWidth={1.8} />
                            )}
                        </button>
                    </div>

                    {error && (
                        <div
                            className="alert alert-danger"
                            role="alert"
                            aria-live="polite"
                        >
                            {error}
                        </div>
                    )}

                    <NavLink
                        to="/recuperar"
                        className="ember-forgot"
                    >
                        ¿Olvidaste tu contraseña?
                    </NavLink>

                    <button
                        type="submit"
                        className="ember-btn-primary w-100"
                        disabled={loading}
                    >
                        {loading ? 'Verificando...' : 'Ingresar'}
                    </button>

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
                </form>
            </div>
        </div>
    );
}
