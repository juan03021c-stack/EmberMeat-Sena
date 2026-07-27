import { useState, useEffect } from 'react'
import ProductoModal from '../components/ProductoModal'
import {
  obtenerProductos,
  obtenerCategorias,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  URL_BASE
} from '../services/Api'

// Plantilla vacía para resetear el formulario
const estadoInicialFormulario = {
  nombre: '',
  precio: '',
  stock: '0',
  presentacion: '',
  descripcion: '',
  activo: '1',
  categoria_id: '',
  imagen: null
}

// Muestra badge de color según nivel de stock
function InsigniaStock({ stock }) {
  if (stock === 0) return <span className='badge bg-danger bg-opacity-10 text-danger'>Agotado</span>
  if (stock <= 5) return <span className='badge bg-warning bg-opacity-10 text-warning'>{stock} uds</span>
  return <span className='badge bg-success bg-opacity-10 text-success'>{stock} unidades</span>
}

// Muestra si el producto está disponible o no en la tienda
function InsigniaActivo({ activo }) {
  return Number(activo) === 1
    ? <span className='badge bg-success bg-opacity-10 text-success'>Activo</span>
    : <span className='badge bg-danger bg-opacity-10 text-danger'>Inactivo</span>
}

export default function Products() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [formulario, setFormulario] = useState(estadoInicialFormulario)
  const [productoEditando, setProductoEditando] = useState(null)
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mostrarModal, setMostrarModal] = useState(false)

  // Carga productos y categorías al abrir la página
  useEffect(() => {
    cargarDatos()
  }, [])

  // Obtiene datos del servidor en paralelo para mejor velocidad
  async function cargarDatos() {
    try {
      setLoading(true)
      setError(null)
      const [prods, cats] = await Promise.all([
        obtenerProductos(),
        obtenerCategorias()
      ])
      setProductos(prods)
      setCategorias(cats)
    } catch (err) {
      console.error('Error cargando datos:', err)
      setError('No se pudieron cargar los productos.')
    } finally {
      setLoading(false)
    }
  }

  // Actualiza el formulario cuando el usuario escribe en un input
  // Maneja tanto texto normal como archivos (imágenes)
  const cambiarCampo = (e) => {
    const { name, value, type, files } = e.target
    if (type === 'file') {
      setFormulario({ ...formulario, imagen: files[0] || null })
      return
    }
    setFormulario({ ...formulario, [name]: value })
  }

  // Carga los datos de un producto existente en el formulario para editarlo
  const iniciarEdicion = (producto) => {
    setProductoEditando(producto)
    setFormulario({
      nombre: producto.nombre || '',
      precio: producto.precio || '',
      stock: String(producto.stock ?? '0'),
      presentacion: producto.presentacion || '',
      descripcion: producto.descripcion || '',
      activo: String(producto.activo ?? '1'),
      categoria_id: String(producto.categoria_id || ''),
      imagen: null  // La imagen no se carga, solo si el usuario cambia
    })
    setMensaje(null)
    setError(null)
  }

  // Resetea todo para empezar un producto nuevo
  const limpiarFormulario = () => {
    setProductoEditando(null)
    setFormulario(estadoInicialFormulario)
    setMensaje(null)
    setError(null)
  }

  const abrirModalNuevo = () => {
    limpiarFormulario()
    setMostrarModal(true)
  }

  const abrirModalEdicion = (producto) => {
    iniciarEdicion(producto)
    setMostrarModal(true)
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setMensaje(null)
    setError(null)
  }

  // Valida, prepara los datos y decide si crear o actualizar
  const enviarFormulario = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMensaje(null)
    setError(null)

    if (!formulario.nombre.trim() || !formulario.precio || !formulario.categoria_id) {
      setError('Nombre, precio y categoría son obligatorios.')
      setLoading(false)
      return
    }

    // FormData permite enviar archivos (imagen) junto con texto
    const datos = new FormData()
    if (productoEditando) datos.append('id', productoEditando.id)
    datos.append('nombre', formulario.nombre)
    datos.append('precio', formulario.precio)
    datos.append('stock', formulario.stock)
    datos.append('presentacion', formulario.presentacion)
    datos.append('descripcion', formulario.descripcion)
    datos.append('activo', formulario.activo)
    datos.append('categoria_id', formulario.categoria_id)
    if (formulario.imagen) datos.append('imagen', formulario.imagen)

    try {
      // Si hay productoEditando → PUT (actualizar), si no → POST (crear)
      const resultado = productoEditando
        ? await actualizarProducto(datos)
        : await crearProducto(datos)

      if (resultado?.success) {
        setMensaje(resultado.message || 'Producto guardado correctamente.')
        limpiarFormulario()
        setMostrarModal(false)
        cargarDatos()  // Refresca la lista con los cambios
      } else {
        setError(resultado?.message || 'No se pudo guardar el producto.')
      }
    } catch (err) {
      console.error('Error guardando producto:', err)
      setError('Ocurrió un error en el servidor.')
    } finally {
      setLoading(false)
    }
  }

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return
    
    setLoading(true)
    setMensaje(null)
    setError(null)

    try {
      const resultado = await eliminarProducto(id)
      if (resultado?.success) {
        setMensaje(resultado.message || 'Producto eliminado correctamente.')
        cargarDatos()
      } else {
        setError(resultado?.message || 'No se pudo eliminar el producto.')
      }
    } catch (err) {
      console.error('Error eliminando producto:', err)
      setError('Ocurrió un error en el servidor.')
    } finally {
      setLoading(false)
    }
  }

  // Filtra productos por nombre o categoría mientras escribes
  const productosFiltrados = productos.filter((p) =>
    (p.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.categoria_nombre || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className='p-4'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <div>
          <h4 className='fw-bold mb-1'>Product</h4>
          <small className='text-muted'>{productos.length} Product</small>
        </div>
        <button className='btn btn-ember' onClick={abrirModalNuevo}>
          New product
        </button>
      </div>

      {/* Spinner de carga inicial */}
      {loading && !mostrarModal && (
        <div className='text-center py-4 text-muted'>
          <span className='spinner-border spinner-border-sm me-2' />
          Cargando productos...
        </div>
      )}

      {/* Modal: se muestra solo cuando mostrarModal es true */}
      <ProductoModal
        show={mostrarModal}
        onClose={cerrarModal}
        formulario={formulario}
        cambiarCampo={cambiarCampo}
        enviarFormulario={enviarFormulario}
        productoEditando={productoEditando}
        loading={loading}
        categorias={categorias}
        limpiarFormulario={limpiarFormulario}
        error={error}
        mensaje={mensaje}
      />

      <div className='mb-3'>
        <input
          className='form-control'
          placeholder='Buscar por nombre o categoría'
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className='card border-0 p-3'>
        <div className='table-responsive'>
          <table className='table table-hover align-middle'>
            <thead>
              <tr>
                <th>Productos</th>
                <th>Categoria</th>
                <th>Precio</th>
                <th>Existencia</th>
                <th>Estado</th>
                <th className='text-end'>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan='6' className='text-center text-muted py-4'>
                    {busqueda ? 'No se encontraron productos' : 'No hay productos'}
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((producto) => (
                  <tr key={producto.id}>
                    <td>
                      <div className='d-flex align-items-center gap-3'>
                        {producto.imagen_url ? (
                          <img
                            src={`${URL_BASE}/${producto.imagen_url}`}
                            alt={producto.nombre}
                            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }}
                          />
                        ) : (
                          <div style={{ width: 48, height: 48, background: '#eee', borderRadius: 8 }} />
                        )}
                        <div>
                          <div className='fw-semibold'>{producto.nombre}</div>
                          <div className='text-muted small'>{producto.presentacion || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td>{producto.categoria_nombre || '-'}</td>
                    <td>${Number(producto.precio || 0).toFixed(2)}</td>
                    <td><InsigniaStock stock={Number(producto.stock)} /></td>
                    <td><InsigniaActivo activo={producto.activo} /></td>
                    <td className='text-end'>
                      <button className='btn btn-sm btn-outline-secondary me-2' onClick={() => abrirModalEdicion(producto)}>
                        Editar
                      </button>
                      <button className='btn btn-sm btn-outline-danger' onClick={() => eliminar(producto.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}