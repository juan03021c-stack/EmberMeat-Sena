
import Swal from 'sweetalert2';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../assets/EmberMeat.css';
import { buscarClientePorCedula } from '../services/Api.js';

import {
    User,
    Mail,
    Phone,
    Home,
    IdCard,
    Truck,
    Wallet,
    Loader2
} from 'lucide-react';

export default function RegisterForm({
    show,
    onClose,
    enviarFormulario,
    loading,
    error,
    mensaje,
    form,
    setForm,
    aceptaTerminos,
    setAceptaTerminos,
    comprobante
}) {
    const [buscando, setBuscando] = useState(false);

    if (!show) return null;

    // Manejar los cambios de los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Validar teléfono y cédula
        if (name === 'telefono' || name === 'cedula') {

            // Permitir solamente números
            if (!/^\d*$/.test(value)) {
                return;
            }

            // Validar máximo de 10 dígitos
            if (value.length > 10) {

                if (name === 'telefono') {
                    Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'El teléfono no puede tener más de 10 dígitos', showConfirmButton: false, timer: 2500 });
                }

                if (name === 'cedula') {
                    Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'La cédula no puede tener más de 10 dígitos', showConfirmButton: false, timer: 2500 });
                }

                return;
            }
        }

        // Actualizar el formulario
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Buscar cliente cuando termina de escribir la cédula
    const handleCedulaBlur = async (e) => {
        const cedula = e.target.value.trim();

        if (cedula.length < 5) return;

        setBuscando(true);

        try {
            const resultado = await buscarClientePorCedula(cedula);

            if (
                resultado.success &&
                resultado.encontrado &&
                resultado.data
            ) {
                const {
                    nombre,
                    email,
                    telefono,
                    direccion
                } = resultado.data;

                setForm((prev) => ({
                    ...prev,
                    nombre: nombre || prev.nombre,
                    email: email || prev.email,
                    telefono: telefono || prev.telefono,
                    direccion: direccion || prev.direccion
                }));
            }

        } catch (error) {
            console.error(
                'Error al autocompletar cliente por cédula:',
                error
            );
        } finally {
            setBuscando(false);
        }
    };

    return (
        <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)'
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="modal-dialog modal-dialog-centered"
                role="document"
                style={{ maxWidth: 640 }}
            >
                <div className="modal-content border-0 shadow-lg">

                    {/* Header */}
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold text-ember-red">
                            EmberMeat
                        </h5>

                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Cerrar"
                        />
                    </div>

                    <div className="modal-body p-4 pt-2">

                        {comprobante ? (

                            /* Comprobante del pedido */
                            <div>
                                <div className="text-center mb-4">
                                    <h1 className="h3 fw-bold text-dark">
                                        Comprobante de pedido
                                    </h1>

                                    <p className="text-muted mb-0 small">
                                        Presenta este comprobante en el punto
                                        para pagar y recoger tu pedido
                                    </p>
                                </div>

                                <div className="border rounded p-3 mb-3">

                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="text-muted">
                                            N.º de pedido
                                        </span>
                                        <strong>
                                            {comprobante.numeroPedido}
                                        </strong>
                                    </div>

                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="text-muted">
                                            Cliente
                                        </span>
                                        <span>
                                            {comprobante.nombre}
                                        </span>
                                    </div>

                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="text-muted">
                                            Cédula
                                        </span>
                                        <span>
                                            {comprobante.cedula}
                                        </span>
                                    </div>

                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">
                                            Fecha
                                        </span>
                                        <span>
                                            {comprobante.fecha}
                                        </span>
                                    </div>

                                    <hr />

                                    {comprobante.productos.map((p) => (
                                        <div
                                            key={p.id}
                                            className="d-flex justify-content-between small mb-1"
                                        >
                                            <span>
                                                {p.cantidad} × {p.nombre}
                                            </span>

                                            <span>
                                                ${p.subtotal.toLocaleString('es-CO')}
                                            </span>
                                        </div>
                                    ))}

                                    <hr />

                                    <div className="d-flex justify-content-between fw-bold">
                                        <span>Total a pagar</span>

                                        <span className="text-ember-red">
                                            ${comprobante.total.toLocaleString('es-CO')}
                                        </span>
                                    </div>
                                </div>

                                <div className="alert alert-warning py-2 small">
                                    Pago en el punto: efectivo o transferencia.
                                </div>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="btn-comprar"
                                >
                                    Listo
                                </button>
                            </div>

                        ) : (

                            <>
                                {/* Título */}
                                <div className="text-center mb-4">
                                    <h1 className="h3 fw-bold text-dark">
                                        Información personal
                                    </h1>

                                    <p className="text-muted mb-0 small">
                                        Ingresa la información solicitada
                                        para continuar
                                    </p>
                                </div>

                                {/* Alertas */}
                                {error && (
                                    <div
                                        className="alert alert-danger py-2 small"
                                        role="alert"
                                    >
                                        {error}
                                    </div>
                                )}

                                {mensaje && (
                                    <div
                                        className="alert alert-success py-2 small"
                                        role="alert"
                                    >
                                        {mensaje}
                                    </div>
                                )}

                                {/* Formulario */}
                                <form onSubmit={enviarFormulario}>

                                    {/* Cédula */}
                                    <div className="input-group mb-3">
                                        <span className="input-group-text bg-white border-end-0">
                                            <IdCard
                                                size={18}
                                                strokeWidth={1.8}
                                                className="text-muted"
                                            />
                                        </span>

                                        <input
                                            type="text"
                                            name="cedula"
                                            className="form-control border-start-0"
                                            placeholder="Cédula"
                                            value={form.cedula || ''}
                                            onChange={handleChange}
                                            onBlur={handleCedulaBlur}
                                            disabled={buscando}
                                            required
                                        />

                                        {buscando && (
                                            <span className="input-group-text bg-white border-start-0">
                                                <Loader2 className="spinner-border spinner-border-sm text-ember-red" />
                                            </span>
                                        )}
                                    </div>

                                    {/* Nombre */}
                                    <div className="input-group mb-3">
                                        <span className="input-group-text bg-white border-end-0">
                                            <User
                                                size={18}
                                                strokeWidth={1.8}
                                                className="text-muted"
                                            />
                                        </span>

                                        <input
                                            type="text"
                                            name="nombre"
                                            className="form-control border-start-0"
                                            placeholder="Nombre completo"
                                            value={form.nombre || ''}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Correo */}
                                    <div className="input-group mb-3">
                                        <span className="input-group-text bg-white border-end-0">
                                            <Mail
                                                size={18}
                                                strokeWidth={1.8}
                                                className="text-muted"
                                            />
                                        </span>

                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control border-start-0"
                                            placeholder="Correo electrónico"
                                            value={form.email || ''}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Teléfono */}
                                    <div className="input-group mb-3">
                                        <span className="input-group-text bg-white border-end-0">
                                            <Phone
                                                size={18}
                                                strokeWidth={1.8}
                                                className="text-muted"
                                            />
                                        </span>

                                        <input
                                            type="tel"
                                            name="telefono"
                                            className="form-control border-start-0"
                                            placeholder="Teléfono"
                                            value={form.telefono || ''}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Dirección */}
                                    <div className="input-group mb-3">
                                        <span className="input-group-text bg-white border-end-0">
                                            <Home
                                                size={18}
                                                strokeWidth={1.8}
                                                className="text-muted"
                                            />
                                        </span>

                                        <input
                                            type="text"
                                            name="direccion"
                                            className="form-control border-start-0"
                                            placeholder="Dirección"
                                            value={form.direccion || ''}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Confirmar dirección */}
                                    <div className="input-group mb-3">
                                        <span className="input-group-text bg-white border-end-0">
                                            <Home
                                                size={18}
                                                strokeWidth={1.8}
                                                className="text-muted"
                                            />
                                        </span>

                                        <input
                                            type="text"
                                            name="confirmarDireccion"
                                            className="form-control border-start-0"
                                            placeholder="Confirmar dirección"
                                            value={form.confirmarDireccion || ''}
                                            onChange={handleChange}
                                            autoComplete="off"
                                            required
                                        />
                                    </div>

                                    {/* Método de envío */}
                                    <div className="input-group mb-3">
                                        <span className="input-group-text bg-white border-end-0">
                                            <Truck
                                                size={18}
                                                strokeWidth={1.8}
                                                className="text-muted"
                                            />
                                        </span>

                                        <select
                                            name="metodoEnvio"
                                            className="form-select border-start-0"
                                            value={form.metodoEnvio || ''}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="" disabled>
                                                Seleccione un método de envío
                                            </option>

                                            <option value="domicilio">
                                                Domicilio
                                            </option>

                                            <option value="tienda">
                                                Recoger en tienda
                                            </option>
                                        </select>
                                    </div>

                                    {/* Lugar de pago */}
                                    <div className="input-group mb-3">
                                        <span className="input-group-text bg-white border-end-0">
                                            <Wallet
                                                size={18}
                                                strokeWidth={1.8}
                                                className="text-muted"
                                            />
                                        </span>

                                        <select
                                            name="lugarPago"
                                            className="form-select border-start-0"
                                            value={form.lugarPago || ''}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="" disabled>
                                                Seleccione el metodo de pago
                                            </option>

                                            <option value="punto">
                                                Pagar en efectivo
                                            </option>

                                            <option value="domicilio">
                                                Pagar con transferencia
                                            </option>
                                        </select>
                                    </div>

                                    {/* Términos y condiciones */}
                                    <div className="form-check mb-4">
                                        <input
                                            id="aceptaTerminos"
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={aceptaTerminos}
                                            onChange={(e) =>
                                                setAceptaTerminos(e.target.checked)
                                            }
                                        />

                                        <label
                                            htmlFor="aceptaTerminos"
                                            className="form-check-label small"
                                        >
                                            Acepto los{' '}

                                            {/* target _blank: se abren en otra pestaña para no perder el formulario */}
                                            <NavLink
                                                to="/terminos"
                                                target="_blank"
                                                className="text-ember-red text-decoration-none"
                                            >
                                                términos y condiciones
                                            </NavLink>
                                            {' '}y la{' '}
                                            <NavLink
                                                to="/tratamiento-datos"
                                                target="_blank"
                                                className="text-ember-red text-decoration-none"
                                            >
                                                política de tratamiento de datos
                                            </NavLink>
                                        </label>
                                    </div>

                                    {/* Botón registrar */}
                                    <button
                                        type="submit"
                                        className="btn-comprar"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2
                                                    size={18}
                                                    className="me-2 spin-animation"
                                                />
                                                Procesando compra...
                                            </>
                                        ) : (
                                            'Seguir con la compra'
                                        )}
                                    </button>

                                    {/* Separador */}
                                    <div className="ember-divider">
                                        <div className="ember-divider-line" />
                                        <span className="ember-divider-text">
                                            o
                                        </span>
                                        <div className="ember-divider-line" />
                                    </div>

                                    {/* Cancelar */}
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="btn-vaciar w-100"
                                    >
                                        Cancelar
                                    </button>

                                </form>
                            </>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
