import '../assets/EmberMeat.css'
import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { obtenerProductos, URL_BASE } from '../services/Api'
import {
  Truck,
  ShieldCheck,
  Plus,
  ChevronRight,
  Check,
  ShoppingCart,
  Flame
} from 'lucide-react'


export default function Home() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelado = false

    async function cargarDatosProductos() {
      try {
        setLoading(true)
        setError(null)

        const data = await obtenerProductos()
        if (!cancelado) {
          setProductos(data)
        }
      } catch (err) {
        if (!cancelado) {
          setError('Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.')
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
              <a href="#productos" className="primary-button">
                Explorar catálogo
              </a>
              <a href="#nosotros" className="secondary-button">
                Ver más
              </a>
            </div>
          </div>
          {productos.length > 0 && (
            <div className="hero-image-container">

              <img
                src={`${URL_BASE}/${productos[0].imagen_url}`}
                alt={productos[0].nombre}
                onError={(e) => {
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

        {!loading && !error && productos.length === 0 && (
          <p className="empty-message">No hay productos disponibles.</p>
        )}

        {!loading && !error && productos.length > 0 && (
          <div className="products-grid">
            {productos.slice(0, 4).map((producto) => (
              <div className="product-card" key={producto.id ?? producto.nombre}>
                <div className="product-image">
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

                <div className="product-info">
                  <h3>{producto.nombre}</h3>

                  <div className="product-bottom">
                    <strong>
                      ${Number(producto.precio).toLocaleString('es-CO')}
                    </strong>

                    <button
                      className="btn-agregar"
                      onClick={() => console.log('Agregar:', producto.id)}
                    >
                      <Plus size={16} strokeWidth={2} />
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="catalog-button-container">
          <a href="#productos" className="catalog-button">
            Ver catálogo completo
            <ChevronRight size={18} strokeWidth={2} />
          </a>
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
        <p>
          Únete a nuestra familia y recibe los mejores
          embutidos directo en la puerta de tu casa.
        </p>
        <NavLink to="/login" className="cta-button">
          Crear cuenta ahora
        </NavLink>
      </section>
    </div>
  )
}