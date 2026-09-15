import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ShoppingBag,
  Printer,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Hash,
  Mail,
  Calendar,
  DollarSign
} from 'lucide-react'
import { consultarTransaccionWompi, consultarEstadoPedido } from '../services/Api'
import '../assets/EmberMeat.css'

export default function RespuestaPago() {
  const [searchParams] = useSearchParams()
  const transaccionId = searchParams.get('id')
  const referenciaParam = searchParams.get('ref')

  const [cargando, setCargando] = useState(true)
  const [transaccion, setTransaccion] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const idOReferencia = transaccionId || referenciaParam

    if (!idOReferencia) {
      setTimeout(() => {
        setError('No se proporcionó un identificador de transacción válido.')
        setCargando(false)
      }, 0)
      return
    }

    const obtenerEstado = async () => {
      setCargando(true)
      setError(null)
      try {
        // 1. Intentar consultar directamente por ID de Wompi
        if (transaccionId && !transaccionId.startsWith('PED-')) {
          const respuesta = await consultarTransaccionWompi(transaccionId)
          if (respuesta.success && respuesta.data) {
            setTransaccion(respuesta.data)
            window.opener?.postMessage({
              tipo: 'wompi-payment-result',
              transactionId: respuesta.data.id,
              reference: respuesta.data.reference
            }, window.location.origin)
            setCargando(false)
            return
          }
        }

        // 2. Si es una referencia de pedido o falló Wompi ID, consultar estado en backend
        const resPedido = await consultarEstadoPedido(referenciaParam || transaccionId)
        if (resPedido.success) {
          const statusWompi = resPedido.aprobado ? 'APPROVED' : (resPedido.estado_pedido === 'cancelado' ? 'DECLINED' : 'PENDING')
          setTransaccion({
            id: resPedido.wompi_transaction_id || 'N/A',
            reference: resPedido.numero_pedido,
            status: statusWompi,
            amount_in_cents: Number(resPedido.total) * 100,
            currency: 'COP',
            payment_method_type: resPedido.estado_transaccion || 'Pasarela Wompi',
            created_at: new Date().toISOString()
          })
          window.opener?.postMessage({
            tipo: 'wompi-payment-result',
            transactionId: resPedido.wompi_transaction_id,
            reference: resPedido.numero_pedido
          }, window.location.origin)
        } else {
          setError('No fue posible consultar los detalles de la transacción.')
        }
      } catch (err) {
        console.error('Error al consultar Wompi:', err)
        setError('Ocurrió un error al verificar el estado del pago con Wompi.')
      } finally {
        setCargando(false)
      }
    }

    obtenerEstado()
  }, [transaccionId, referenciaParam])

  const formatearMonto = (centavos) => {
    if (!centavos) return '$0 COP'
    const pesos = centavos / 100
    return '$' + pesos.toLocaleString('es-CO') + ' COP'
  }

  const formatearFecha = (fechaIso) => {
    if (!fechaIso) return new Date().toLocaleDateString('es-CO')
    try {
      const fecha = new Date(fechaIso)
      return fecha.toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    } catch {
      return fechaIso
    }
  }

  const obtenerConfigEstado = (status) => {
    switch (status) {
      case 'APPROVED':
        return {
          titulo: '¡Pago Aprobado con Éxito!',
          subtitulo: 'Tu pedido ha sido recibido y ya estamos preparando tus cortes artesanales.',
          icono: <CheckCircle2 size={54} className="text-success" />,
          badgeClass: 'badge bg-success text-white px-3 py-2 fs-6',
          badgeTexto: 'Aprobado',
          colorFondo: 'rgba(25, 135, 84, 0.08)'
        }
      case 'PENDING':
        return {
          titulo: 'Pago en Proceso de Confirmación',
          subtitulo: 'Estamos esperando la respuesta de tu entidad financiera. Te notificaremos una vez sea procesado.',
          icono: <Clock size={54} className="text-warning" />,
          badgeClass: 'badge bg-warning text-dark px-3 py-2 fs-6',
          badgeTexto: 'Pendiente',
          colorFondo: 'rgba(255, 193, 7, 0.08)'
        }
      case 'DECLINED':
        return {
          titulo: 'Pago Declinado / Rechazado',
          subtitulo: 'La transacción no pudo completarse. Puedes intentar nuevamente con otro método de pago.',
          icono: <XCircle size={54} className="text-danger" />,
          badgeClass: 'badge bg-danger text-white px-3 py-2 fs-6',
          badgeTexto: 'Rechazado',
          colorFondo: 'rgba(220, 53, 69, 0.08)'
        }
      case 'VOIDED':
      case 'ERROR':
      default:
        return {
          titulo: 'Transacción No Completada',
          subtitulo: 'Ocurrió una eventualidad con la transacción o fue cancelada.',
          icono: <AlertTriangle size={54} className="text-secondary" />,
          badgeClass: 'badge bg-secondary text-white px-3 py-2 fs-6',
          badgeTexto: status || 'Error',
          colorFondo: 'rgba(108, 117, 125, 0.08)'
        }
    }
  }

  if (cargando) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '65vh' }}>
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <div className="spinner-border text-ember-red mb-3" style={{ width: '3rem', height: '3rem' }} role="status" />
          <h4 className="fw-bold text-dark">Verificando estado del pago en Wompi...</h4>
          <p className="text-muted">Por favor espera un momento mientras confirmamos tu transacción.</p>
        </div>
      </div>
    )
  }

  if (error || !transaccion) {
    return (
      <div className="container py-5" style={{ minHeight: '65vh' }}>
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-6">
            <div className="card shadow-sm border-0 text-center p-4 p-md-5">
              <div className="mb-3">
                <AlertTriangle size={56} className="text-danger" />
              </div>
              <h3 className="fw-bold text-dark mb-2">No se pudo verificar el pago</h3>
              <p className="text-muted mb-4">{error || 'No fue posible obtener información de la transacción.'}</p>
              <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                <Link to="/Catalogo" className="btn-comprar text-decoration-none">
                  Ir al catálogo de productos
                </Link>
                <Link to="/carrito" className="btn-vaciar text-decoration-none">
                  Volver al carrito
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const estadoInfo = obtenerConfigEstado(transaccion.status)

  return (
    <div className="container py-5" style={{ minHeight: '75vh' }}>
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-7">
          <div className="card border-0 shadow-lg overflow-hidden">
            {/* Encabezado del comprobante */}
            <div
              className="text-center p-4 p-md-5 border-bottom"
              style={{ backgroundColor: estadoInfo.colorFondo }}
            >
              <div className="mb-3">{estadoInfo.icono}</div>
              <span className={estadoInfo.badgeClass}>{estadoInfo.badgeTexto}</span>
              <h2 className="fw-bold text-dark mt-3 mb-2">{estadoInfo.titulo}</h2>
              <p className="text-muted mb-0 mx-auto" style={{ maxWidth: '520px' }}>
                {estadoInfo.subtitulo}
              </p>
            </div>

            {/* Detalles de la transacción */}
            <div className="p-4 p-md-5">
              <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
                <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <ShieldCheck size={22} className="text-ember-red" />
                  Comprobante de Transacción
                </h5>
                <span className="badge bg-light text-muted border">Wompi Gateway</span>
              </div>

              <div className="row g-3">
                {/* Referencia */}
                <div className="col-sm-6">
                  <div className="p-3 rounded bg-light border">
                    <div className="text-muted small d-flex align-items-center gap-1 mb-1">
                      <Hash size={14} /> Número de Pedido / Referencia
                    </div>
                    <div className="fw-bold text-dark font-monospace text-break">
                      {transaccion.reference || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="col-sm-6">
                  <div className="p-3 rounded bg-light border">
                    <div className="text-muted small d-flex align-items-center gap-1 mb-1">
                      <DollarSign size={14} /> Monto Total
                    </div>
                    <div className="fw-bold text-dark fs-5 text-ember-red">
                      {formatearMonto(transaccion.amount_in_cents)}
                    </div>
                  </div>
                </div>

                {/* Método de pago */}
                <div className="col-sm-6">
                  <div className="p-3 rounded bg-light border">
                    <div className="text-muted small d-flex align-items-center gap-1 mb-1">
                      <CreditCard size={14} /> Método de Pago
                    </div>
                    <div className="fw-semibold text-dark text-uppercase">
                      {transaccion.payment_method_type || 'Wompi'}
                    </div>
                  </div>
                </div>

                {/* ID Wompi */}
                <div className="col-sm-6">
                  <div className="p-3 rounded bg-light border">
                    <div className="text-muted small d-flex align-items-center gap-1 mb-1">
                      <Hash size={14} /> ID Transacción Wompi
                    </div>
                    <div className="small font-monospace text-secondary text-break">
                      {transaccion.id}
                    </div>
                  </div>
                </div>

                {/* Correo */}
                {transaccion.customer_email && (
                  <div className="col-sm-6">
                    <div className="p-3 rounded bg-light border">
                      <div className="text-muted small d-flex align-items-center gap-1 mb-1">
                        <Mail size={14} /> Correo Registrado
                      </div>
                      <div className="fw-semibold text-dark text-break">
                        {transaccion.customer_email}
                      </div>
                    </div>
                  </div>
                )}

                {/* Fecha */}
                <div className="col-sm-6">
                  <div className="p-3 rounded bg-light border">
                    <div className="text-muted small d-flex align-items-center gap-1 mb-1">
                      <Calendar size={14} /> Fecha y Hora
                    </div>
                    <div className="fw-semibold text-dark">
                      {formatearFecha(transaccion.created_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="mt-4 pt-3 border-top d-flex flex-column flex-sm-row gap-3 justify-content-between align-items-center">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 w-100 w-sm-auto px-3 py-2"
                >
                  <Printer size={18} /> Imprimir Comprobante
                </button>

                <Link
                  to="/Catalogo"
                  className="btn-comprar text-decoration-none d-flex align-items-center justify-content-center gap-2 w-100 w-sm-auto px-4 py-2"
                >
                  <ShoppingBag size={18} /> Seguir Comprando <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
