import '../assets/EmberMeat.css'
import { Link } from 'react-router-dom'
import { useCarrito } from '../components/CarritoContext'
import { ShoppingCart } from 'lucide-react'

export default function Carrito() {
  const {
    carrito,
    aumentarCantidad,
    disminuirCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    cantidadTotal,
    totalPrecio,
  } = useCarrito()

  // esta funcion convierte el precio de string a number pesos colombianos
  // const convertirPrecio = (precio) => {
  //   if (typeof precio === 'number') return precio
  //   return Number(
  //     precio.replace('$', '').replace(/\./g, '').replace(',', '.')
  //   )
  // }

  const handleComprar = () => {
    if (carrito.length === 0) return
    alert(
      `¡Gracias por tu compra en EmberMeat! 🛒\n\nTotal: $${totalPrecio.toLocaleString(
        'es-CO'
      )}\n\n, aquí iría el checkout con Wompi.`
    )
    vaciarCarrito()
  }

  return (
    <div className="carrito-page">
      <div className="carrito-header">
        <h1><ShoppingCart size={32} strokeWidth={1.5} /> Mi carrito</h1>
        <Link to="/" className="volver-link">
          ← Seguir comprando
        </Link>
      </div>

      {carrito.length === 0 ? (
        <div className="carrito-vacio">
          <div className="carrito-vacio-icon"><ShoppingCart size={150} strokeWidth={1} /></div>
          <h2>Tu carrito está vacío</h2>
          <p>Agrega algunos productos artesanales para comenzar tu compra.</p>
          <Link to="/" className="volver-tienda">
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="carrito-contenido">
          <div className="carrito-productos">
            {carrito.map((producto) => (
              <div className="carrito-producto" key={producto.id}>
                <div className="carrito-producto-imagen">
                  <img src={producto.imagen} alt={producto.nombre} />
                </div>

                <div className="carrito-producto-info">
                  <h3>{producto.nombre}</h3>
                  <p className="precio-unitario">
                    ${Number((producto.precio)).toLocaleString('es-US')}{' '}
                    {/* convertirPrecio */}
                  </p>

                  <div className="cantidad-control">
                    <button onClick={() => disminuirCantidad(producto.id)}>
                      −
                    </button>
                    <span>{producto.cantidad}</span>
                    <button onClick={() => aumentarCantidad(producto.id)}>
                      +
                    </button>
                  </div>
                </div>

                <div className="carrito-producto-total">
                  <strong>
                    $
                    {(
                      (producto.precio) * producto.cantidad
                    ).toLocaleString('es-Us')}
                    {/* convertirPrecio */}
                  </strong>
                  <button
                    className="eliminar-producto"
                    onClick={() => eliminarDelCarrito(producto.id)}
                  >
                    🗑️ Eliminar
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
              <span>${(totalPrecio.toLocaleString('es-US'))}</span>
            </div>

            <div className="resumen-linea">
              <span>Envío</span>
              <span className="envio-texto">Por calcular</span>
            </div>

            <hr />

            <div className="resumen-total">
              <span>Total</span>
              <strong>
                ${totalPrecio.toLocaleString('es-US')}
              </strong>
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
    </div>
  )
}