import { useState, useEffect } from 'react'
import CategoriaModal from '../components/CategoriaModal'

import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from '../services/Api'

// Plantilla vacía para resetear el formulario
const estadoInicialFormulario = {
  nombre: '',
  descripcion: '',
  activo: '1'
}

// Muestra el estado de la categoría
function InsigniActivo({ estado }) {
     if (Number(estado) == 1) {
        return <span className='badge bg-success'>Activo</span>
    }
    if (Number(estado) == 0) {
        return <span className='badge bg-danger'>Inactivo</span>
    }
}
export default function Categorias() {
  const [categorias, setCategorias] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [formulario, setFormulario] = useState(estadoInicialFormulario)
  const [categoriaEditando, setCategoriaEditando] = useState(null)
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mostrarModal, setMostrarModal] = useState(false)

  // Cargar categorías al abrir la página
  useEffect(() => {
    cargarDatos()
  }, [])

  // Obtener categorías desde la API
  async function cargarDatos() {
    try {
      setLoading(true)
      setError(null)

      const cats = await obtenerCategorias()

      // Admite una respuesta directa o un objeto con success y data
      const lista = Array.isArray(cats)
        ? cats
        : Array.isArray(cats?.data)
          ? cats.data
          : null

      if (lista === null) {
        throw new Error(
          cats?.message || 'La respuesta de categorías no es válida.'
        )
      }

      setCategorias(lista)
    } catch (err) {
      console.error('Error cargando categorías:', err)
      setError('No se pudieron cargar las categorías.')
    } finally {
      setLoading(false)
    }
  }

  // Actualizar los campos del formulario
  const cambiarCampo = (e) => {
    const { name, value } = e.target

    setFormulario((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Cargar una categoría para editar
  const iniciarEdicion = (categoria) => {
    setCategoriaEditando(categoria)

    setFormulario({
      nombre: categoria.nombre || '',
      descripcion: categoria.descripcion || '',
      activo: String(categoria.activa ?? categoria.activo ?? categoria.estado ?? '1')
    })

    setMensaje(null)
    setError(null)
  }

  // Limpiar el formulario
  const limpiarFormulario = () => {
    setCategoriaEditando(null)
    setFormulario({ ...estadoInicialFormulario })
    setMensaje(null)
    setError(null)
  }

  // Abrir modal para crear
  const abrirModalNuevo = () => {
    limpiarFormulario()
    setMostrarModal(true)
  }

  // Abrir modal para editar
  const abrirModalEdicion = (categoria) => {
    iniciarEdicion(categoria)
    setMostrarModal(true)
  }

  // Cerrar modal
  const cerrarModal = () => {
    if (loading) return

    setMostrarModal(false)
    limpiarFormulario()
  }

  // Crear o actualizar categoría
  const enviarFormulario = async (e) => {
    e.preventDefault()

    if (loading) return

    setMensaje(null)
    setError(null)

    if (!formulario.nombre.trim()) {
      setError('El nombre es obligatorio.')
      return
    }

    const datos = new FormData()

    if (categoriaEditando) {
      datos.append('id', categoriaEditando.id)
    }

    datos.append('nombre', formulario.nombre.trim())
    datos.append('descripcion', formulario.descripcion.trim())
    datos.append('activa', formulario.activo ?? '1')
    datos.append('activo', formulario.activo ?? '1')

    try {
      setLoading(true)

      const resultado = categoriaEditando
        ? await actualizarCategoria(categoriaEditando.id, datos)
        : await crearCategoria(datos)

      if (resultado?.success) {
        setMensaje(
          resultado.message || 'Categoría guardada correctamente.'
        )

        setMostrarModal(false)
        limpiarFormulario()

        await cargarDatos()
      } else {
        setError(
          resultado?.message || 'No se pudo guardar la categoría.'
        )
      }
    } catch (err) {
      console.error('Error guardando categoría:', err)
      setError('Ocurrió un error al guardar la categoría.')
    } finally {
      setLoading(false)
    }
  }

  // Eliminar categoría
  const eliminar = async (id) => {
    if (loading) return

    const confirmar = window.confirm(
      '¿Estás seguro de que deseas eliminar esta categoría?'
    )

    if (!confirmar) return

    setMensaje(null)
    setError(null)

    try {
      setLoading(true)

      const resultado = await eliminarCategoria(id)

      if (resultado?.success) {
        setMensaje(
          resultado.message || 'Categoría eliminada correctamente.'
        )

        await cargarDatos()
      } else {
        setError(
          resultado?.message || 'No se pudo eliminar la categoría.'
        )
      }
    } catch (err) {
      console.error('Error eliminando categoría:', err)
      setError('Ocurrió un error al eliminar la categoría.')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar por nombre o descripción
  const categoriasFiltradas = categorias.filter((categoria) => {
    const termino = busqueda.toLowerCase().trim()

    return (
      (categoria.nombre || '').toLowerCase().includes(termino) ||
      (categoria.descripcion || '').toLowerCase().includes(termino)
    )
  })

  return (
    <div className='p-4'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <div>
          <h4 className='fw-bold mb-1'>Categorías</h4>
          <small className='text-muted'>
            {categorias.length} categorías
          </small>
        </div>

        <button
          className='btn btn-ember'
          onClick={abrirModalNuevo}
          disabled={loading}
        >
          <i className='bi bi-plus-lg me-1'></i>
          Nueva categoría
        </button>
      </div>

      {/* Mensajes de operación */}
      {mensaje && (
        <div className='alert alert-success' role='alert'>
          {mensaje}
        </div>
      )}

      {error && !mostrarModal && (
        <div className='alert alert-danger' role='alert'>
          {error}
          <button
            type='button'
            className='btn btn-sm btn-outline-danger ms-3'
            onClick={cargarDatos}
            disabled={loading}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Cargando categorías */}
      {loading && !mostrarModal && (
        <div className='text-center py-4 text-muted'>
          <span
            className='spinner-border spinner-border-sm text-ember-red me-2'
            role='status'
            aria-hidden='true'
          />
          Cargando categorías...
        </div>
      )}

      {/* Modal para crear y editar */}
      <CategoriaModal
        show={mostrarModal}
        onClose={cerrarModal}
        formulario={formulario}
        cambiarCampo={cambiarCampo}
        enviarFormulario={enviarFormulario}
        categoriaEditando={categoriaEditando}
        loading={loading}
        limpiarFormulario={limpiarFormulario}
        error={error}
        mensaje={mensaje}
      />

      {/* Tabla de categorías */}
      <div className='card p-3'>
        <div className='mb-3'>
          <input
            type='text'
            className='form-control'
            placeholder='Buscar por nombre o descripción'
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className='table-responsive'>
          <table className='table table-hover align-middle'>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th className='text-end'>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {categoriasFiltradas.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className='text-center text-muted py-4'
                  >
                    {loading
                      ? 'Cargando categorías...'
                      : busqueda
                        ? 'No se encontraron categorías.'
                        : 'No hay categorías registradas.'}
                  </td>
                </tr>
              ) : (
                categoriasFiltradas.map((categoria) => (
                  <tr key={categoria.id}>
                    <td>
                      <span className='fw-semibold'>
                        {categoria.nombre}
                      </span>
                    </td>

                    <td>
                      {categoria.descripcion || '-'}
                    </td>

                    <td>
                      <InsigniActivo estado={categoria.activa} />
                    </td>

                    <td className='text-end'>
                      <button
                        type='button'
                        className='btn btn-sm ember-btn-terciario me-2'
                        onClick={() => abrirModalEdicion(categoria)}
                        disabled={loading}
                      >
                        Editar
                      </button>

                      <button
                        type='button'
                        className='btn btn-sm ember-btn-terciario'
                        onClick={() => eliminar(categoria.id)}
                        disabled={loading}
                      >
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