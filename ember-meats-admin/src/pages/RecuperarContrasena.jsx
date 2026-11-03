import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound } from 'lucide-react';
import { enviarCodigoRecuperacion, cambiarContrasena } from '../services/Api';
import '../assets/EmberMeat.css';

export default function RecuperarContrasena() {
    const navigate = useNavigate();

    /* paso 1: pedir el código al correo; paso 2: escribir el código y la nueva contraseña */
    const [paso, setPaso] = useState(1);
    const [email, setEmail] = useState('');
    const [codigo, setCodigo] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    const pedirCodigo = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const resultado = await enviarCodigoRecuperacion(email.trim());
            setMensaje(resultado.message);
            setPaso(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const guardarContrasena = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await cambiarContrasena({ email: email.trim(), codigo: codigo.trim(), password });
            alert('Contraseña actualizada. Ya puedes iniciar sesión.');
            navigate('/login', { replace: true });
        } catch (err) {
            setError(err.message);
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
                <h1 className="ember-title">Recuperar contraseña</h1>

                <p className="ember-subtitle">
                    {paso === 1
                        ? 'Te enviaremos un código a tu correo'
                        : 'Escribe el código que te llegó y tu nueva contraseña'}
                </p>

                <form
                    className="ember-form"
                    onSubmit={paso === 1 ? pedirCodigo : guardarContrasena}
                >
                    <div className="ember-input-group">
                        <Mail size={18} strokeWidth={1.8} className="ember-input-icon" />
                        <input
                            type="email"
                            className="ember-input"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading || paso === 2}
                        />
                    </div>

                    {paso === 2 && (
                        <>
                            <div className="ember-input-group">
                                <KeyRound size={18} strokeWidth={1.8} className="ember-input-icon" />
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    className="ember-input"
                                    placeholder="Código de 6 números"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value)}
                                    autoComplete="one-time-code"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="ember-input-group">
                                <Lock size={18} strokeWidth={1.8} className="ember-input-icon" />
                                <input
                                    type="password"
                                    className="ember-input"
                                    placeholder="Nueva contraseña (mínimo 6)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                    minLength={6}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </>
                    )}

                    {mensaje && !error && (
                        <div className="alert alert-success" role="status">{mensaje}</div>
                    )}
                    {error && (
                        <div className="alert alert-danger" role="alert" aria-live="polite">{error}</div>
                    )}

                    <button type="submit" className="ember-btn-primary w-100" disabled={loading}>
                        {loading
                            ? 'Enviando...'
                            : paso === 1 ? 'Enviar código' : 'Cambiar contraseña'}
                    </button>

                    <NavLink to="/login" className="ember-forgot">
                        Volver al inicio de sesión
                    </NavLink>
                </form>
            </div>
        </div>
    );
}
