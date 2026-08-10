import React from 'react'
import './Home.css'

const productos = [
  {
    id: 1,
    nombre: 'Chorizo Antioqueño Tradicional',
    precio: '$18.900',
    imagen: '/Imagess/producto.jpg'
  },
  {
    id: 2,
    nombre: 'Salchichón Casero Premium',
    precio: '$22.500',
    imagen: '/Imagess/producto.jpg'
  },
  {
    id: 3,
    nombre: 'Morcilla Artesanal Premium',
    precio: '$16.000',
    imagen: '/Imagess/producto.jpg'
  },
  {
    id: 4,
    nombre: 'Longaniza Ahumada Especial',
    precio: '$24.000',
    imagen: '/Imagess/producto.jpg'
  }
]

export default function Home() {

  return (
    <div className="home">

      {/* NAVBAR */}
      <nav className="home-navbar">

        <div className="home-logo">
        
         
        </div> {/*en ese div de este giion puede ir un titulo por si gustas*/}

        <div className="home-menu">
          <a href="#inicio">Inicio</a>
          <a href="#catalogo">Catálogo</a>
          <a href="#nosotros">Nosotros</a>
        </div>

        <div className="home-actions">
          <button></button> {/*aqui puede ir un botton de lo que se necesite para el proyecto*/} 
          <button>🛒</button>

          <a href="/login" className="login-button">
            Iniciar sesión
          </a>
        </div>

      </nav>


      {/* HERO */}
      <section
        id="inicio"
        className="hero"
        style={{
          backgroundImage: "url('/Imagess/fondo.jpg')"
        }}
      >

        <div className="hero-overlay"></div>

        <div className="hero-content">

          <div className="hero-text">

            <span className="hero-tag">
              ARTESANAL · ANTIOQUEÑO
            </span>

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

              <a href="#catalogo" className="primary-button">
                Explorar catálogo
              </a>

              <a href="#nosotros" className="secondary-button">
                Ver más
              </a>

            </div>

          </div>


          <div className="hero-image-container">

            <img
              src="/Imagess/producto.jpg"
              alt="Producto EmberMeat"
            />

          </div>

        </div>

      </section>


      {/* BENEFICIOS */}
      <section className="benefits">

        <div className="benefit">

          <div className="benefit-icon">
            🚗
          </div>

          <h3>Envíos rápidos</h3>

          <p>
            Entregas en menos de 24 horas
            en todo el área metropolitana.
          </p>

        </div>


        <div className="benefit">

          <div className="benefit-icon">
            💳
          </div>

          <h3>Pago seguro con Wompi</h3>

          <p>
            Tus transacciones están protegidas
            con los estándares más altos.
          </p>

        </div>


        <div className="benefit">

          <div className="benefit-icon">
            🐷
          </div>

          <h3>Producto artesanal</h3>

          <p>
            Elaborados con carne 100% seleccionada
            sin químicos nocivos.
          </p>

        </div>

      </section>


      {/* PRODUCTOS */}
      <section id="catalogo" className="products">

        <div className="section-header">

          <h2>Productos destacados</h2>

          <p>
            Los favoritos de nuestros clientes,
            listos para asar y compartir en familia.
          </p>

        </div>


        <div className="products-grid">

          {productos.map((producto) => (

            <div className="product-card" key={producto.id}>

              <div className="product-image">

                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                />

              </div>


              <div className="product-info">

                <span>
                  CÁRNICOS
                </span>

                <h3>
                  {producto.nombre}
                </h3>

                <div className="product-bottom">

                  <strong>
                    {producto.precio}
                  </strong>

                  <button>
                    + Agregar
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>


        <div className="catalog-button-container">

          <button className="catalog-button">
            Ver catálogo completo →
          </button>

        </div>

      </section>


      {/* TRADICIÓN */}
      <section id="nosotros" className="tradition">

        <div className="tradition-image">

          <img
            src="/Imagess/work.jpg"
            alt="Trabajador EmberMeat"
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
              ✓ Carne 100% seleccionada de cerdo y res
            </li>

            <li>
              ✓ Sin conservantes artificiales ni aditivos añadidos
            </li>

            <li>
              ✓ Tradición que une a las familias colombianas
            </li>

            <li>
              ✓ Envío seguro con cadena de frío garantizada
            </li>

          </ul>

        </div>

      </section>


      {/* LLAMADO A LA ACCIÓN */}
      <section className="cta">

        <h2>
          ¿Listo para probar lo auténtico?
        </h2>

        <p>
          Únete a nuestra familia y recibe los mejores
          embutidos directo en la puerta de tu casa.
        </p>

        <a href="/login">
          Crear cuenta ahora
        </a>

      </section>


      {/* FOOTER */}
      <footer className="footer">

        <div className="footer-logo">
           EmberMeat
        </div>

        <p>
          Embutidos artesanales de tradición antioqueña.
        </p>

        <span>
          © 2026 EmberMeat. Todos los derechos reservados.
        </span>

      </footer>

    </div>
  )
}