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
  Loader2
} from 'lucide-react';

export default function RegisterForm({
  show,
  onClose,
  enviarFormulario,
  loading,
  error,
  mensaje,
  /** form es un objeto que contiene la informacion del formulario */
  form,
  /** setForm es una funcion que actualiza el estado del formulario */
  setForm,
  /** aceptaTerminos es un booleano que indica si el usuario acepta los terminos y condiciones */
  aceptaTerminos,
  /** setAceptaTerminos es una funcion que actualiza el estado de aceptaTerminos */
  setAceptaTerminos
}){
const [buscando, setBuscando] = useState(false);


 if (!show) return null;

   /* la funcion handlechange se encarga de capturar los cambios 
  en los campos del formulario y actualiza el estado del formulario*/
const handleChange = (e) => {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));
};

const handleCedulaBlur = async (e) => {
    const cedula = e.target.value.trim();

    if (cedula.length < 5) return;

    setBuscando(true);

    try {
        const resultado = await buscarClientePorCedula(cedula);

        if (resultado.success && resultado.encontrado && resultado.data) {
            const {
                nombre,
                email,
                telefono,
                direccion
            } = resultado.data;

            setForm(prev => ({
                ...prev,
                nombre: nombre || prev.nombre,
                email: email || prev.email,
                telefono: telefono || prev.telefono,
                direccion: direccion || prev.direccion
            }));
        }

    } catch (error) {
        console.error('Error al autocompletar cliente por cédula:', error);
    } finally {
        setBuscando(false);
    }
};
  
  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content border-0 shadow-lg">

          {/* Header */}
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold text-ember-red">EmberMeat</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Cerrar"
            />
          </div>

          <div className="modal-body p-4 pt-2">
            {/* Título */}
            <div className="text-center mb-4">
              <h1 className="h3 fw-bold text-dark">Información personal</h1>
              <p className="text-muted mb-0 small">
                Ingresa la información solicitada para continuar
              </p>
            </div>

            {/* Alertas */}
            {error && (
              <div className="alert alert-danger py-2 small" role="alert">
                {error}
              </div>
            )}
            {mensaje && (
              <div className="alert alert-success py-2 small" role="alert">
                {mensaje}
              </div>
            )}
            {/* en el onSbmint se detecta el envio
             del formulario y llama a la funcion enviarFormulario
             que se encarga de enviar la informacion al backend*/}

            <form onSubmit={enviarFormulario} >

               {/* Cédula */}
              <div className="input-group mb-3">
                <span className="input-group-text bg-white border-end-0">
                  <IdCard size={18} strokeWidth={1.8} className="text-muted" />
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
                  <User size={18} strokeWidth={1.8} className="text-muted" />
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
                  <Mail size={18} strokeWidth={1.8} className="text-muted" />
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
                  <Phone size={18} strokeWidth={1.8} className="text-muted" />
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
                  <Home size={18} strokeWidth={1.8} className="text-muted" />
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

             

              {/* Método de envío */}
              <div className="input-group mb-3">
                <span className="input-group-text bg-white border-end-0">
                  <Truck size={18} strokeWidth={1.8} className="text-muted" />
                </span>
                <select
                  name="metodoEnvio"
                  className="form-select border-start-0"
                  value={form.metodoEnvio || ''}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Seleccione un método de envío</option>
                  <option value="domicilio">🏠 Domicilio</option>
                  <option value="tienda">🏬 Recoger en tienda</option>
                </select>
              </div>

              {/* Términos */}
              <div className=" form-check mb-4">
                <input
                  id="aceptaTerminos"
                  type="checkbox"
                  className="form-check-input"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                />
                <label htmlFor="aceptaTerminos" className="form-check-label small">
                  Acepto los{' '}
                  <NavLink to="/terminos" className="text-ember-red text-decoration-none">
                    términos y condiciones
                  </NavLink>
                </label>
              </div>

              {/* Botón Registrar */}
              <button
                type="submit"
                className="btn-comprar"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="me-2 spin-animation" />
                    Registrando...
                  </>
                ) : (
                  'Seguir con la compra'
                )}
              </button>

              {/* Divider */}
              <div className="ember-divider">
                <div className="ember-divider-line" />
                <span className="ember-divider-text">o</span>
                <div className="ember-divider-line" />
              </div>

              {/* Volver */}
              <button
                type="button"
                onClick={onClose}
                className="btn-vaciar w-100"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}