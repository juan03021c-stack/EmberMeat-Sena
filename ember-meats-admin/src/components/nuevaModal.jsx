
import { obtenerClientes, obtenerProductos, crearVenta } from '../services/Api'

import './NuevaVentaModal.css'


export default function NuevaVentaModal({ onClose, onVentaCreada }) {


  const [paso, setPaso] = useState(1)

 
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])

 
  const [clienteId, setClienteId] = useState('')      // ID del cliente seleccionado
  const [productoId, setProductoId] = useState('')  // ID del producto seleccionado
  const [cantidad, setCantidad] = useState(1)       // Cantidad de unidades
  const [metodoPago, setMetodoPago] = useState('efectivo')  // Método de pago
  const [descuento, setDescuento] = useState(0)     // Descuento en pesos (opcional)
  const [guardando, setGuardando] = useState(false) // true = enviando al servidor


  useEffect(() => {
    // Traemos la lista de clientes desde el backend
    obtenerClientes()
      .then(setClientes)           // Guardamos en el estado
      .catch(() => setClientes([])) // Si falla, array vacío (no se rompe)

    // Traemos la lista de productos desde el backend
    obtenerProductos()
      .then(setProductos)
      .catch(() => setProductos([]))
  }, []) // [] = solo una vez al montar

 
  const productoSeleccionado = productos.find(p => p.id == productoId)
  const subtotal = productoSeleccionado ? productoSeleccionado.precio * cantidad : 0
  const total = Math.max(0, subtotal - descuento)


  const puedeAvanzar = () => {
    if (paso === 1) return clienteId !== ''
    if (paso === 2) return productoId !== ''
    return true
  }


  const handleConfirmar = async () => {
    setGuardando(true) 

    // Armamos el payload que espera el backend PHP
    const venta = {
      cliente_id: Number(clienteId),   // Convertimos a número para la BD
      producto_id: Number(productoId), // Convertimos a número para la BD
      cantidad: Number(cantidad),        // Convertimos a número para la BD
      total: total                       // Total ya calculado en pesos
    }

    try {
      // Enviamos la venta al endpoint PHP
      const respuesta = await crearVenta(venta)

      if (respuesta.success) {
     
        alert('¡Venta guardada exitosamente!')
        onVentaCreada?.() // Notificamos a la página padre (para recargar lista)
        onClose()          // Cerramos el modal
      } else {
      
        alert('Error al guardar la venta')
      }
    } catch (err) {
     
      alert('Error de conexión con el servidor')
    } finally {
      setGuardando(false) 
    }
  }

  return (
    // ── OVERLAY (fondo oscuro) ──────────────────────────────────────────────
    // onClick={onClose} → cierra el modal al hacer clic fuera de la caja
    <div className="nvm-overlay" onClick={onClose}>

      {/* ── CAJA DEL MODAL ────────────────────────────────────────────────── */}
      {/* onClick={e => e.stopPropagation()} → evita que el clic dentro cierre el modal */}
      <div className="nvm-modal" onClick={e => e.stopPropagation()}>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HEADER: Título + subtítulo + botón cerrar                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="nvm-header">
          <div>
            <h2>Nueva venta</h2>
            <span className="nvm-subtitle">
              Paso {paso} de 3 — {paso === 1 ? 'Cliente' : paso === 2 ? 'Productos' : 'Pago'}
            </span>
          </div>
          <button className="nvm-close" onClick={onClose}>×</button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* INDICADOR DE PASOS (stepper)                                      */}
        {/* Muestra 3 círculos: 1.Cliente → 2.Productos → 3.Pago            */}
        {/* active = paso actual  |  done = pasos ya completados            */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="nvm-steps">
          {/* Paso 1: Cliente */}
          <div className={`nvm-step ${paso >= 1 ? 'active' : ''} ${paso > 1 ? 'done' : ''}`}>
            <div className="nvm-step-circle">{paso > 1 ? '✓' : '1'}</div>
            <span>Cliente</span>
          </div>
          <div className={`nvm-step-line ${paso > 1 ? 'active' : ''}`} />

          {/* Paso 2: Productos */}
          <div className={`nvm-step ${paso >= 2 ? 'active' : ''} ${paso > 2 ? 'done' : ''}`}>
            <div className="nvm-step-circle">{paso > 2 ? '✓' : '2'}</div>
            <span>Productos</span>
          </div>
          <div className={`nvm-step-line ${paso > 2 ? 'active' : ''}`} />

          {/* Paso 3: Pago */}
          <div className={`nvm-step ${paso >= 3 ? 'active' : ''}`}>
            <div className="nvm-step-circle">3</div>
            <span>Pago</span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PASO 1: SELECCIONAR CLIENTE Y CANAL DE VENTA                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {paso === 1 && (
          <div className="nvm-body">
            {/* Campo: Select de clientes (cargado desde la BD) */}
            <div className="nvm-field">
              <label>Nombre del cliente *</label>
              <select
                value={clienteId}
                onChange={e => setClienteId(e.target.value)}
                className="nvm-select"
              >
                <option value="">Seleccione un cliente</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            {/* Campo: Canal de venta (Punto de venta / Domicilio) */}
            <div className="nvm-field">
              <label>Canal de venta</label>
              <div className="nvm-canal-grid">
                <button type="button" className="nvm-canal-card selected">
                  <span>🏪</span>
                  <span>Punto de venta</span>
                </button>
                <button type="button" className="nvm-canal-card">
                  <span>🏠</span>
                  <span>Domicilio</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PASO 2: SELECCIONAR PRODUCTO Y CANTIDAD                           */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {paso === 2 && (
          <div className="nvm-body">
            {/* Campo: Select de productos (cargado desde la BD) */}
            <div className="nvm-field">
              <label>Producto *</label>
              <select
                value={productoId}
                onChange={e => setProductoId(e.target.value)}
                className="nvm-select"
              >
                <option value="">Seleccione un producto</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — ${Number(p.precio).toLocaleString('es-CO')}
                  </option>
                ))}
              </select>
            </div>

            {/* Campo: Cantidad (número, mínimo 1) */}
            <div className="nvm-field">
              <label>Cantidad</label>
              <input
                type="number"
                min="1"
                value={cantidad}
                onChange={e => setCantidad(Number(e.target.value))}
                className="nvm-input"
              />
            </div>

            {/* Mini resumen: muestra el subtotal calculado */}
            {productoSeleccionado && (
              <div className="nvm-resumen-mini">
                <span>Subtotal</span>
                <strong>${subtotal.toLocaleString('es-CO')}</strong>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PASO 3: MÉTODO DE PAGO, DESCUENTO Y RESUMEN FINAL                 */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {paso === 3 && (
          <div className="nvm-body">
            {/* Campo: Método de pago (4 opciones con color de punto) */}
            <div className="nvm-field">
              <label>Método de pago</label>
              <div className="nvm-pago-grid">
                {[
                  { id: 'efectivo', nombre: 'Efectivo', color: '#16a34a' },
                  { id: 'tarjeta', nombre: 'Tarjeta', color: '#2563eb' },
                  { id: 'nequi', nombre: 'Nequi', color: '#7c3aed' },
                  { id: 'bancolombia', nombre: 'Bancolombia', color: '#ea580c' },
                ].map(mp => (
                  <button
                    key={mp.id}
                    type="button"
                    className={`nvm-pago-card ${metodoPago === mp.id ? 'selected' : ''}`}
                    onClick={() => setMetodoPago(mp.id)}
                  >
                    <span className="nvm-pago-dot" style={{ background: mp.color }} />
                    <span>{mp.nombre}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Campo: Descuento opcional (en pesos) */}
            <div className="nvm-field">
              <label>Descuento (opcional)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={descuento || ''}
                onChange={e => setDescuento(Number(e.target.value))}
                className="nvm-input"
              />
            </div>

            {/* Resumen completo del pedido antes de confirmar */}
            <div className="nvm-resumen-pedido">
              <h4>Resumen del pedido</h4>
              <div className="nvm-resumen-linea">
                <span>Cliente</span>
                <span>{clientes.find(c => c.id == clienteId)?.nombre || '-'}</span>
              </div>
              <div className="nvm-resumen-linea">
                <span>Producto</span>
                <span>{productoSeleccionado?.nombre || '-'}</span>
              </div>
              <div className="nvm-resumen-linea">
                <span>Cantidad</span>
                <span>{cantidad}</span>
              </div>
              <div className="nvm-resumen-linea">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString('es-CO')}</span>
              </div>
              {descuento > 0 && (
                <div className="nvm-resumen-linea descuento">
                  <span>Descuento</span>
                  <span>−${descuento.toLocaleString('es-CO')}</span>
                </div>
              )}
              <div className="nvm-resumen-linea total">
                <span>Total</span>
                <strong>${total.toLocaleString('es-CO')}</strong>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* FOOTER: Botones de navegación (Atrás / Siguiente / Confirmar)      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="nvm-footer">
          {/* Botón "Atrás" — solo aparece en paso 2 y 3 */}
          {paso > 1 ? (
            <button className="nvm-btn-atras" onClick={() => setPaso(paso - 1)}>
              Atrás
            </button>
          ) : (
            <div /> /* Espacio vacío para mantener el layout */
          )}

          {/* Botón "Siguiente" — aparece en paso 1 y 2 */}
          {/* Se deshabilita si el usuario no ha llenado los campos obligatorios */}
          {paso < 3 ? (
            <button 
              className="nvm-btn-siguiente" 
              onClick={() => setPaso(paso + 1)}
              disabled={!puedeAvanzar()}
            >
              Siguiente →
            </button>
          ) : (
            /* Botón "Confirmar venta" — aparece solo en paso 3 */
            <button 
              className="nvm-btn-confirmar" 
              onClick={handleConfirmar}
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : '✓ Confirmar venta'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}