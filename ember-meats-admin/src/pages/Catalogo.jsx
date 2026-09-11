import React, { useMemo, useState, useEffect } from "react";
import "../assets/EmberMeat.css";
import { obtenerProductos, obtenerCategorias, URL_BASE } from '../services/Api';
import { useCarrito } from '../components/CarritoContext';

const PRECIO_MAX_DEFAULT = 500000;

function formatoPrecio(valor) {
  return valor.toLocaleString("es-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

// -----------------------------------------------------------------------
// Card horizontal
// -----------------------------------------------------------------------
function ProductoCard({ producto }) {
  const { agregarAlCarrito } = useCarrito();
  const disponible = producto.activo == 1;
  const sinStock = producto.stock == 0;

  return (
    <div className="product-card">
      <div className="product-image" style={{ position: 'relative' }}>
        {producto.imagen_url ? (
          <img
            src={`${URL_BASE}/${producto.imagen_url}`}
            alt={producto.nombre}
            onError={(e) => {
              e.currentTarget.src = '/imagess/producto.jpg';
            }}
          />
        ) : (
          <img
            src="/imagess/producto.jpg"
            alt={producto.nombre}
          />
        )}
        {!disponible && (
          <div className="sin-stock-overlay d-flex align-items-center justify-content-center">
            <span>No disponible</span>
          </div>
        )}{sinStock && (
          <div className="sin-stock-overlay d-flex align-items-center justify-content-center">
            <span>Sin stock</span>
          </div>
        )}
      </div>

      <div className="product-info">
        <span>{producto.categoria_nombre}</span>
        <h2>{producto.nombre}</h2>
        <p>{producto.descripcion}</p>
        <small>Stock:{producto.stock}</small>
        <small>Presentacion:{producto.presentacion}</small>

        <div className="product-bottom">
          <strong>${Number(producto.precio).toLocaleString('es-US')}</strong>

          <button
            type="button"
            className="btn-agregar"
            disabled={!disponible}
            onClick={() => agregarAlCarrito(producto)}
          >
            {disponible ? "Agregar" : "Sin stock"}
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Catálogo principal
// -----------------------------------------------------------------------
export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [categoriasSel, setCategoriasSel] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState("todos");
  const [precioMax, setPrecioMax] = useState(PRECIO_MAX_DEFAULT);
  const [orden, setOrden] = useState("relevancia");

  // Cargar productos y categorías desde la API
  useEffect(() => {
    let cancelado = false;

    async function cargarDatos() {
      try {
        setLoading(true);
        setError(null);
        const [prodData, catData] = await Promise.all([
          obtenerProductos(),
          obtenerCategorias()
        ]);
        if (!cancelado) {
          setProductos(prodData || []);
          setCategorias(catData || []);
        }
      } catch (err) {
        if (!cancelado) {
          setError('Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.');
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    cargarDatos();
    return () => { cancelado = true; };
  }, []);

  const toggleCategoria = (cat) => {
    setCategoriasSel((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setCategoriasSel([]);
    setDisponibilidad("todos");
    setPrecioMax(PRECIO_MAX_DEFAULT);
  };

  const productosFiltrados = useMemo(() => {
    let lista = productos.filter((p) => {
      const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = categoriasSel.length === 0 || categoriasSel.includes(p.categoria_nombre);
      const coincideDisponibilidad = disponibilidad === "todos" || p.activo == 1 && p.stock >= 1;
      const coincidePrecio = p.precio <= precioMax;
      return coincideBusqueda && coincideCategoria && coincideDisponibilidad && coincidePrecio;
    });

    if (orden === "precio-asc") {
      lista = [...lista].sort((a, b) => a.precio - b.precio);
    } else if (orden === "precio-desc") {
      lista = [...lista].sort((a, b) => b.precio - a.precio);
    } else if (orden === "nombre") {
      lista = [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    return lista;
  }, [busqueda, categoriasSel, disponibilidad, precioMax, orden, productos]);

  return (
    <div className="catalogo-page">
      <div className="container py-4 py-lg-5">
        {/* Encabezado */}
        <header className="mb-4">
          <h1 className="catalogo-titulo">Catálogo</h1>
          <p className="catalogo-subtitulo">Descubre todos nuestros embutidos artesanales</p>
        </header>

        <div className="row g-4">
          {/* Sidebar filtros */}
          <aside className="col-12 col-lg-3">
            <div className="card filtros-card border-0 shadow-sm sticky-lg-top" style={{ top: '20px' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="filtros-titulo mb-0">Filtros</h2>
                  <button type="button" className="btn btn-link btn-sm p-0 limpiar-filtros" onClick={limpiarFiltros}>
                    Limpiar filtros
                  </button>
                </div>

                {/* Buscador */}
                <div className="mb-4">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">🔍</span>
                    <input
                      type="search"
                      className="form-control border-start-0 ps-0"
                      placeholder="Buscar..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                  </div>
                </div>

                {/* Categorías dinámicas */}
                <div className="mb-4">
                  <h3 className="filtro-subtitulo">Categorías</h3>
                  {categorias.length === 0 && loading ? (
                    <p className="text-muted small">Cargando...</p>
                  ) : (
                    categorias.map((cat) => {
                      const nombre = cat.nombre ?? cat;
                      const id = cat.id ?? cat;
                      return (
                        <div className="form-check" key={id}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`cat-${id}`}
                            checked={categoriasSel.includes(nombre)}
                            onChange={() => toggleCategoria(nombre)}
                          />
                          <label className="form-check-label" htmlFor={`cat-${id}`}>
                            {nombre}
                          </label>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Disponibilidad */}
                <div className="mb-4">
                  <h3 className="filtro-subtitulo">Disponibilidad</h3>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="disponibilidad"
                      id="disp-todos"
                      checked={disponibilidad === "todos"}
                      onChange={() => setDisponibilidad("todos")}
                    />
                    <label className="form-check-label" htmlFor="disp-todos">Todos</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="disponibilidad"
                      id="disp-solo"
                      checked={disponibilidad === "disponibles"}
                      onChange={() => setDisponibilidad("disponibles")}
                    />
                    <label className="form-check-label" htmlFor="disp-solo">Solo disponibles</label>
                  </div>
                </div>

                {/* Precio máximo */}
                <div>
                  <h3 className="filtro-subtitulo">Precio máximo</h3>
                  <input
                    type="range"
                    className="form-range precio-range"
                    min={0}
                    max={PRECIO_MAX_DEFAULT}
                    step={1000}
                    value={precioMax}
                    onChange={(e) => setPrecioMax(Number(e.target.value))}
                  />
                  <div className="d-flex justify-content-between small text-muted">
                    <span>$0</span>
                    <span>{formatoPrecio(precioMax)}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main - Resultados */}
          <main className="col-12 col-lg-9">
            {/* Barra superior */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <p className="mb-0 text-muted">
                {loading ? 'Cargando productos...' : `${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? 's' : ''} encontrado${productosFiltrados.length !== 1 ? 's' : ''}`}
              </p>
              <select
                className="form-select form-select-sm w-auto"
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
              >
                <option value="relevancia">Ordenar: Relevancia</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="nombre">Nombre: A-Z</option>
              </select>
            </div>

            {/* Error */}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {/* Grid de productos: 3 por fila */}
            {!error && (
              <div className="row g-4">
                {loading && productos.length === 0
                  ? Array(6).fill(0).map((_, i) => (
                    <div key={i} className="col-12 col-md-6 col-lg-4">
                      <div className="product-card">
                        <div className="product-image bg-secondary bg-opacity-25 placeholder-glow"></div>
                        <div className="product-info placeholder-glow">
                          <span className="placeholder col-4 d-block mb-2"></span>
                          <h3 className="placeholder col-8 d-block mb-3"></h3>
                          <div className="product-bottom mt-auto">
                            <strong className="placeholder col-4"></strong>
                            <span className="placeholder col-4 py-2" style={{ borderRadius: 'var(--ember-radius-sm)', background: '#ddd' }}></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                  : productosFiltrados.length === 0
                    ? (
                      <div className="col-12 text-center py-5 text-muted">
                        No encontramos productos con esos filtros.
                      </div>
                    )
                    : productosFiltrados.map((producto) => (
                      <div key={producto.id ?? producto.nombre} className="col-12 col-md-6 col-lg-4">
                        <ProductoCard producto={producto} />
                      </div>
                    ))
                }
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}