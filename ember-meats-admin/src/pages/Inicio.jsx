import '../assets/EmberMeat.css'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { obtenerProductosDestacados, URL_BASE } from '../services/Api'
import { useCarrito } from '../components/CarritoContext'
import {
  Truck,
  ShieldCheck,
  ChevronRight,
  Check,
  Flame
} from 'lucide-react'

export default function Home() {
  const { agregarAlCarrito, carrito } = useCarrito()
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelado = false

    async function cargarDatosProductos() {
      try {
        setLoading(true)
        setError(null)

        const data = await obtenerProductosDestacados()
        if (!cancelado) {
          setProductos(data || [])
        }
      } catch {
        if (!cancelado) {
          setError(
            'Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.'
          )
        }
      } finally {
        if (!cancelado) {
          setLoading(false)
        }
      }
    }

    cargarDatosProductos()
    return () => {
      cancelado = true
    }
  }, [])

  // Filtrar productos que tienen stock y están disponibles
  const disponibles = productos.filter(
    (p) =>
      Number(p.stock) > 0 &&
      Number(p.activo ?? p.disponible) === 1
  )

  return (
    <div className="home">
      {/* HERO */}
      <section
        id="inicio"
        className="hero"
        style={{
          backgroundImage: "url('/imagess/principal.jpeg')"
        }}
      >
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <div className="hero-text">
            <h1>
              Sabor que se siente
              desde el primer bocado
            </h1>

            <p>
              Embutidos artesanales elaborados con recetas
              tradicionales antioqueñas, ingredientes naturales
              y el cariño de generaciones.
            </p>

            <div className="hero-buttons">
              <NavLink to="/Catalogo" className="primary-button">
                Explorar catálogo
              </NavLink>
              <a href="#nosotros" className="secondary-button">
                Ver más
              </a>
            </div>
          </div>

          {productos.length > 0 && (
            <div className="hero-image-container">
              <img
                src={
                  productos[0].imagen_url
                    ? `${URL_BASE}/${productos[0].imagen_url}`
                    : '/imagess/producto.jpg'
                }
                alt={productos[0].nombre || 'Producto destacado'}
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/imagess/producto.jpg'
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="benefits">
        <div className="benefit">
          <div className="benefit-icon">
            <Truck size={32} strokeWidth={1.5} />
          </div>
          <h3>Envíos rápidos</h3>
          <p>
            Entregas en menos de 24 horas
            en todo el área metropolitana.
          </p>
        </div>

        <div className="benefit">
          <div className="benefit-icon">
            <ShieldCheck size={32} strokeWidth={1.5} />
          </div>
          <h3>Pago seguro con Wompi</h3>
          <p>
            Tus transacciones están protegidas
            con los estándares más altos.
          </p>
        </div>

        <div className="benefit">
          <div className="benefit-icon">
            <Flame size={32} strokeWidth={1.5} />
          </div>
          <h3>Producto artesanal</h3>
          <p>
            Elaborados con carne 100% seleccionada
            sin químicos nocivos.
          </p>
        </div>
      </section>

      {/* PRODUCTOS */}
      <section id="productos" className="products">
        <div className="section-header">
          <h2>Productos destacados</h2>
          <p>
            Los favoritos de nuestros clientes,
            listos para asar y compartir en familia.
          </p>
        </div>

        {loading && (
          <p className="loading-message">Cargando productos...</p>
        )}

        {error && (
          <p className="error-message">{error}</p>
        )}

        {!loading && !error && disponibles.length === 0 && (
          <p className="empty-message">No hay productos disponibles.</p>
        )}

        {!loading && !error && disponibles.length > 0 && (
          <div className="products-grid">
            {disponibles.slice(0, 4).map((p) => {
              const enCarrito =
                carrito.find((item) => String(item.id) === String(p.id))
                  ?.cantidad || 0

              const stockReal = Math.max(0, Number(p.stock))
              const stockRestante = Math.max(0, stockReal - enCarrito)
              const agotadoParaEsteUsuario = stockRestante === 0

              return (
                <div className="product-card" key={p.id}>
                  <div className="product-image">
                    <img
                      src={
                        p.imagen_url
                          ? `${URL_BASE}/${p.imagen_url}`
                          : '/imagess/producto.jpg'
                      }
                      alt={p.nombre || 'Producto EmberMeat'}
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = '/imagess/producto.jpg'
                      }}
                    />
                  </div>

                  <div className="product-info">
                    <span>{p.categoria_nombre}</span>
                    <h2>{p.nombre}</h2>
                    <p>{p.descripcion}</p>

                    <small>Stock: {stockRestante}</small>
                    <small>Presentación: {p.presentacion}</small>

                    <div className="product-bottom">
                      <strong>
                        ${(Number(p.precio) || 0).toLocaleString('es-CO')}
                      </strong>
                      <button
                        type="button"
                        className="btn-agregar"
                        disabled={agotadoParaEsteUsuario}
                        onClick={() => agregarAlCarrito(p)}
                      >
                        {agotadoParaEsteUsuario ? 'No disponible' : 'Agregar'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="catalog-button-container">
          <NavLink to="/Catalogo" className="catalog-button">
            Ver catálogo completo
            <ChevronRight size={18} strokeWidth={2} />
          </NavLink>
        </div>
      </section>

      {/* TRADICIÓN */}
      <section id="nosotros" className="tradition">
        <div className="tradition-image">
          <img
            src="/imagess/work.jpg"
            alt="Trabajador EmberMeat"
            onError={(e) => { e.currentTarget.src = '/imagess/producto.jpg' }}
          />
        </div>

        <div className="tradition-content">
          <h2>
            Tradición antioqueña
            en cada bocado
          </h2>

          <p>
            En EmberMeat honramos las costumbres de nuestros
            abuelos. Cada pieza pasa por un riguroso proceso
            de maduración y ahumado natural con maderas
            seleccionadas, garantizando una explosión de sabor
            único en tu mesa.
          </p>

          <ul>
            <li>
              <Check size={18} strokeWidth={2.5} />
              Carne 100% seleccionada de cerdo y res
            </li>
            <li>
              <Check size={18} strokeWidth={2.5} />
              Sin conservantes artificiales ni aditivos añadidos
            </li>
            <li>
              <Check size={18} strokeWidth={2.5} />
              Tradición que une a las familias colombianas
            </li>
            <li>
              <Check size={18} strokeWidth={2.5} />
              Envío seguro con cadena de frío garantizada
            </li>
          </ul>
        </div>
      </section>

      {/* LLAMADO A LA ACCIÓN */}
      <section className="cta">
        <h2>¿Listo para probar lo auténtico?</h2>
        <p className="fw-bold">
          ¿Estás preparado para una experiencia llena de sabor y calidad?
        </p>
        <NavLink to="/Catalogo" className="cta-button">
          Ver catálogo
        </NavLink>
      </section>
    </div>
  )
}