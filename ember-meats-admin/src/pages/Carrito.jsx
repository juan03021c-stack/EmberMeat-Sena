import '../assets/EmberMeat.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCarrito } from '../components/CarritoContext'
import { ShoppingCart, Trash2, MinusCircle, PlusCircle } from 'lucide-react'
import { URL_BASE } from '../services/Api'
import RegisterForm from '../components/RegisterForm'
import { crearPedido } from '../services/Api'


export default function Carrito() {
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
    /*--------------------Convierte los datos del carrito a JSON--------------------*/
    const productosPedido = carrito.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      cantidad: p.cantidad,
      precio_unitario: Number(p.precio),
      subtotal: Number(p.precio) * p.cantidad
    }))
    /*--------------------envia los datos al backend--------------------  
   
      aqui es donde se llama la funcion crearPedido y  los datos
      que teniamos almacenados en la variable formData y en la variable productosPedido
      se le pasa como parametro a la funcion crearPedido
      
    */
    try {
      const response = await crearPedido(formData, productosPedido)

      if (response.success) {
        setMensajeExito(response.message || '¡Pedido realizado con éxito!')
        vaciarCarrito()
        setTimeout(() => {
          setMostrarModal(false)
          limpiarFormulario()
        }, 2500)
      } else {
        setError(response.message || 'Error al procesar el pedido')
      }
    } catch (err) {
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
                  {producto.imagen_url ? (
                    <img
                      src={`${URL_BASE}/${producto.imagen_url}`}
                      alt={producto.nombre}
                      onError={(e) => {
                        e.currentTarget.src = '/imagess/producto.jpg'
                      }}
                    />
                  ) : (
                    <img
                      src="/imagess/producto.jpg"
                      alt={producto.nombre}
                    />
                  )}
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