
import '../assets/EmberMeat.css'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCarrito } from '../components/CarritoContext'
import { ShoppingCart, Trash2, MinusCircle, PlusCircle } from 'lucide-react'
import { URL_BASE } from '../services/Api'
import RegisterForm from '../components/RegisterForm'
import { consultarEstadoPedido, consultarTransaccionPorReferencia, consultarTransaccionWompi, crearPedido } from '../services/Api'

export default function Carrito() {
  const navigate = useNavigate()
  const [mostrarModal, setMostrarModal] = useState(false)

  /*--------------------almacena los datos del formulario, para despues hacer el envio al backend--------------------*/
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    cedula: '',
    metodoEnvio: ''
  })

  /*--------------------Estado de las variables--------------------*/
  const [acepta, setAcepta] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [mensajeExito, setMensajeExito] = useState('')
  const esperaPagoRef = useRef(null)
  const ventanaWompiRef = useRef(null)

  /*--------------------Obtiene los datos del carrito--------------------*/
  const {
    carrito,
    aumentarCantidad,
    disminuirCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    cantidadTotal,
    totalPrecio,
  } = useCarrito()
  /*--------------------funcion para limpiar el formulario--------------------*/
  const limpiarFormulario = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      direccion: '',
      cedula: '',
      metodoEnvio: ''
    })
    setAcepta(false)
    setError(null)
    setMensajeExito('')
  }
  /*--------------------funcion para mostrar el modal--------------------*/
  const mostrarModalNueva = () => {
    setMostrarModal(true)
    limpiarFormulario()
  }

  /*--------------------funcion para abrir pasarela de pagos Wompi--------------------*/
  useEffect(() => {
    const recibirResultadoWompi = async (event) => {
      if (event.origin !== window.location.origin || event.data?.tipo !== 'wompi-payment-result') {
        return
      }

      if (event.data.transactionId) {
        await consultarTransaccionWompi(event.data.transactionId)
      }

      ventanaWompiRef.current?.close()
      navigate(`/respuesta-pago?id=${encodeURIComponent(event.data.transactionId || '')}&ref=${encodeURIComponent(event.data.reference || '')}`)
    }

    window.addEventListener('message', recibirResultadoWompi)
    return () => {
      window.removeEventListener('message', recibirResultadoWompi)
      if (esperaPagoRef.current) {
        clearInterval(esperaPagoRef.current)
      }
    }
  }, [navigate])

  const esperarConfirmacionPago = (numeroPedido) => {
    if (esperaPagoRef.current) {
      clearInterval(esperaPagoRef.current)
    }

    esperaPagoRef.current = setInterval(async () => {
      const respuestaWompi = await consultarTransaccionPorReferencia(numeroPedido)
      const transaccionWompi = respuestaWompi.success ? respuestaWompi.data : null
      const pagoFinalizado = ['APPROVED', 'DECLINED', 'VOIDED', 'ERROR'].includes(transaccionWompi?.status)

      if (pagoFinalizado) {
        clearInterval(esperaPagoRef.current)
        esperaPagoRef.current = null
        ventanaWompiRef.current?.close()
        navigate(`/respuesta-pago?id=${encodeURIComponent(transaccionWompi.id)}&ref=${encodeURIComponent(numeroPedido)}`)
        return
      }

      const estado = await consultarEstadoPedido(numeroPedido)
      if (estado.success && estado.finalizado) {
        clearInterval(esperaPagoRef.current)
        esperaPagoRef.current = null
        ventanaWompiRef.current?.close()
        navigate(`/respuesta-pago?ref=${encodeURIComponent(numeroPedido)}`)
      }
    }, 3000)
  }

  const abrirPasarelaWompi = (wompiConfig, ventanaWompi) => {
    try {
      setCargando(true)
      setError(null)
      const urlPublica = import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin

      // Sanitizar teléfono a solo dígitos
      const telefonoLimpio = String(wompiConfig.customerData?.phoneNumber || formData.telefono || '').replace(/\D/g, '')
      const firmaIntegridad = typeof wompiConfig.signature === 'object' ? wompiConfig.signature.integrity : wompiConfig.signature

      // Construir URL oficial de Web Checkout directo de Wompi (100% compatible)
      const params = new URLSearchParams()
      params.set('public-key', wompiConfig.publicKey)
      params.set('currency', wompiConfig.currency || 'COP')
      params.set('amount-in-cents', String(wompiConfig.amountInCents))
      params.set('reference', String(wompiConfig.reference))
      params.set('signature:integrity', firmaIntegridad)

      // CloudFront WAF de Wompi bloquea cualquier URL con 'http://' en los parámetros GET.
      // Solo enviamos redirect-url en el query param si el sitio está bajo HTTPS (producción o ngrok).
      if (urlPublica.startsWith('https://')) {
        params.set('redirect-url', `${urlPublica}/respuesta-pago?ref=${encodeURIComponent(wompiConfig.reference)}`)
      }

      const emailCliente = wompiConfig.customerData?.email || formData.email
      const nombreCliente = wompiConfig.customerData?.fullName || formData.nombre

      if (emailCliente) {
        params.set('customer-data:email', emailCliente)
      }
      if (nombreCliente) {
        params.set('customer-data:full-name', nombreCliente)
      }
      if (telefonoLimpio.length >= 7) {
        params.set('customer-data:phone-number', telefonoLimpio)
        params.set('customer-data:phone-number-prefix', '+57')
      }

      const wompiUrl = `https://checkout.wompi.co/p/?${params.toString()}`

      console.log('Redirigiendo a pasarela Wompi:', wompiUrl)

      // Vaciar carrito y cerrar modal antes de redirigir
      vaciarCarrito()
      setMostrarModal(false)
      limpiarFormulario()

      if (ventanaWompi) {
        ventanaWompi.location.href = wompiUrl
        esperarConfirmacionPago(wompiConfig.reference)
      }

    } catch (errWompi) {
      console.error('Error al iniciar Wompi:', errWompi)
      setError('Error al iniciar la pasarela de pagos: ' + errWompi.message)
      setCargando(false)
    }
  }

  /*--------------------funcion para enviar la informacion al backend--------------------*/

  const enviarRegistro = async (e) => {
    e.preventDefault()

    if (!acepta) {
      setError('Debes aceptar los términos y condiciones')
      return
    }

    if (carrito.length === 0) {
      setError('El carrito está vacío')
      return
    }

    setCargando(true)
    setError(null)

    // Abrirla durante el clic del usuario evita que el navegador bloquee la ventana.
    const ventanaWompi = window.open('', '_blank', 'width=520,height=760,resizable=yes,scrollbars=yes')
    if (!ventanaWompi) {
      setCargando(false)
      setError('El navegador bloqueó la ventana de pago. Permite las ventanas emergentes e inténtalo de nuevo.')
      return
    }
    ventanaWompiRef.current = ventanaWompi
    ventanaWompi.document.write('<p style="font-family: sans-serif; padding: 24px">Preparando la pasarela de pago...</p>')
    /*--------------------Convierte los datos del carrito a JSON--------------------*/
    const productosPedido = carrito.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      cantidad: p.cantidad,
      precio_unitario: Number(p.precio),
      subtotal: Number(p.precio) * p.cantidad
    }))

    try {
      const response = await crearPedido(formData, productosPedido)

      if (response.success) {
        setMensajeExito(response.message || '¡Pedido realizado con éxito!')

        // Si el backend entrega los datos de Wompi, abrimos el widget
        if (response.wompi) {
          abrirPasarelaWompi(response.wompi, ventanaWompi)
        } else {
          ventanaWompi.close()
          vaciarCarrito()
          setTimeout(() => {
            setMostrarModal(false)
            limpiarFormulario()
          }, 2500)
        }
      } else {
        ventanaWompi.close()
        setError(response.message || 'Error al procesar el pedido')
      }
    } catch (err) {
      ventanaWompi.close()
      setError(err.message || 'Error al procesar el pedido')
    } finally {
      setCargando(false)
    }
  }

  /*--------------------funcion para comprar--------------------*/
  const handleComprar = () => {
    if (carrito.length === 0) {
      return alert('Tu carrito está vacío')
    } else {
      mostrarModalNueva()
    }
  }
  /*--------------------funcion para formatear el precio de los productos y que se muestre en formato de moneda--------------------*/
  const formatearPrecio = (precio) => {
    const num = typeof precio === 'number' ? precio : Number(precio)
    if (isNaN(num)) return '0'
    return num.toLocaleString('es-US')
  }

  const obtenerImagenUrl = (url) => {
    if (!url) return '/imagess/producto.jpg'
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (url.startsWith('/')) return `${URL_BASE}${url}`
    return `${URL_BASE}/${url}`
  }

  return (
    <div className="carrito-page">
      <div className="carrito-header">
        <h1><ShoppingCart size={32} strokeWidth={1.5} /> Mi carrito</h1>
        <Link to="/Catalogo" className="volver-link">
          ← Seguir comprando
        </Link>
      </div>

      {carrito.length === 0 ? (
        <div className="carrito-vacio">
          <div className="carrito-vacio-icon"><ShoppingCart size={150} strokeWidth={1} /></div>
          <h2>Tu carrito está vacío</h2>
          <p>Agrega algunos productos artesanales para comenzar tu compra.</p>
          <Link to="/Catalogo" className="volver-tienda">
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="carrito-contenido">
          <div className="carrito-productos">
            {carrito.map((producto) => (
              <div className="carrito-producto" key={producto.id}>
                <div className="carrito-producto-imagen">
                  <img
                    src={obtenerImagenUrl(producto.imagen_url)}
                    alt={producto.nombre}
                    onError={(e) => {
                      e.currentTarget.src = '/imagess/producto.jpg'
                    }}
                  />
                </div>

                <div className="carrito-producto-info">
                  <h3>{producto.nombre}</h3>
                  <p className="precio-unitario">
                    ${formatearPrecio(producto.precio)}
                  </p>

                  <div className="cantidad-control">
                    <button onClick={() => disminuirCantidad(producto.id)}>
                      <MinusCircle size={20} strokeWidth={1.5} />
                    </button>
                    <span>{producto.cantidad}</span>
                    <button onClick={() => aumentarCantidad(producto.id)}>
                      <PlusCircle size={20} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                <div className="carrito-producto-total">
                  <strong>
                    ${formatearPrecio(Number(producto.precio) * producto.cantidad)}
                  </strong>
                  <button
                    className="eliminar-producto"
                    onClick={() => eliminarDelCarrito(producto.id)}
                  >
                    <Trash2 size={20} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="carrito-resumen">
            <h2>Resumen de compra</h2>

            <div className="resumen-linea">
              <span>Productos</span>
              <span>{cantidadTotal}</span>
            </div>

            <div className="resumen-linea">
              <span>Subtotal</span>
              <span>${formatearPrecio(totalPrecio)}</span>
            </div>

            <div className="resumen-linea">
              <span>Envío</span>
              <span className="envio-texto">Por calcular</span>
            </div>

            <hr />

            <div className="resumen-total">
              <span>Total</span>
              <strong>${formatearPrecio(totalPrecio)}</strong>
            </div>

            <button className="btn-comprar" onClick={handleComprar}>
              Continuar con la compra
            </button>

            <button className="btn-vaciar" onClick={vaciarCarrito}>
              Vaciar carrito
            </button>
          </div>


        </div>
      )}

      {/* RegisterForm es un componente que se encarga de mostrar el formulario de registro
        
      */}
      <RegisterForm
        show={mostrarModal}
        onClose={() => setMostrarModal(false)}
        enviarFormulario={enviarRegistro}
        loading={cargando}
        error={error}
        mensaje={mensajeExito}
        form={formData}
        setForm={setFormData}
        aceptaTerminos={acepta}
        setAceptaTerminos={setAcepta}
      />
    </div>
  )
}