import { useState, useEffect, useCallback } from 'react'
import { obtenerPedidos } from '../services/Api'
import OrdenModal from '../components/OrdenModal'

const estadoInicialFormulario = {
    cliente: '',
    fecha: '',
    total: '',
    estado: 'pendiente',
    modalidad_entrega: 'domicilio'
}

export default function Orders() {
    const [pedidos, setPedidos] = useState([])
    const [formulario, setFormulario] = useState(estadoInicialFormulario)
    const [mensaje, setMensaje] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [mostrarModal, setMostrarModal] = useState(false)
    const [ordenEditando, setpedidosditando] = useState(null)
    const [busqueda, setBusqueda] = useState('')
    const [filtroModalidad, setFiltroModalidad] = useState('todas') // 'todas', 'recogida_punto', 'domicilio'

    const cargarDatos = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const pedidosData = await obtenerPedidos()
            setPedidos(Array.isArray(pedidosData) ? pedidosData : [])
        } catch (err) {
            console.error('Error al cargar datos:', err)
            setError('Error al cargar datos')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        cargarDatos()
    }, [cargarDatos])

    function cambiarCampo(e) {
        const { name, value } = e.target
        setFormulario(prev => ({ ...prev, [name]: value }))
    }

    const abrirModalNuevo = () => {
        setpedidosditando(null)
        setFormulario(estadoInicialFormulario)
        setMensaje(null)
        setError(null)
        setMostrarModal(true)
    }

    const abrirModalEdicion = (pedidosData) => {
        setpedidosditando(pedidosData)
        setFormulario({
            cliente: pedidosData.cliente || pedidosData.cliente_id || '',
            fecha: pedidosData.created_at ? pedidosData.created_at.split(' ')[0] : '',
            total: pedidosData.total || pedidosData.monto_total || '',
            estado: pedidosData.estado || 'pendiente',
            modalidad_entrega: pedidosData.modalidad_entrega || 'domicilio'
        })
        setMensaje(null)
        setError(null)
        setMostrarModal(true)
    }

    const limpiarFormulario = () => {
        setpedidosditando(null)
        setFormulario(estadoInicialFormulario)
        setMensaje(null)
        setError(null)
    }

    const cerrarModal = () => {
        setMostrarModal(false)
        setpedidosditando(null)
        setMensaje(null)
        setError(null)
    }

    const enviarFormulario = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMensaje(null)
        if (!formulario.cliente || !formulario.total) {
            setError('Todos los campos son obligatorios')
            setLoading(false)
            return
        }

        try {
            if (ordenEditando) {
                setPedidos(prev => prev.map(o =>
                    o.id === ordenEditando.id
                        ? {
                            ...o,
                            cliente: formulario.cliente,
                            modalidad_entrega: formulario.modalidad_entrega,
                            total: formulario.total,
                            estado: formulario.estado
                        }
                        : o
                ))
                setMensaje('Orden actualizada')
            } else {
                const nextId = pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id || 0)) + 1 : 1
                setPedidos(prev => [
                    {
                        id: nextId,
                        numero_pedido: `PED-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-MANUAL`,
                        cliente: formulario.cliente,
                        modalidad_entrega: formulario.modalidad_entrega,
                        repartidor: formulario.modalidad_entrega === 'recogida_punto' ? null : 'Sin asignar',
                        total: formulario.total,
                        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
                        estado: formulario.estado
                    },
                    ...prev
                ])
                setMensaje('Orden creada')
            }
            limpiarFormulario()
            cerrarModal()
        } catch (saveError) {
            console.error(saveError)
            setError('Error al guardar la orden')
        } finally {
            setLoading(false)
        }
    }

    const eliminar = (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar esta orden?')) return
        setLoading(true)
        setError(null)
        setMensaje(null)
        try {
            setPedidos(prev => prev.filter(o => o.id !== id))
            setMensaje('Orden eliminada')
        } catch (deleteError) {
            console.error(deleteError)
            setError('Error al eliminar orden')
        } finally {
            setLoading(false)
        }
    }

    // Contadores de modalidad
    const totalRecogidas = pedidos.filter(p => p.modalidad_entrega === 'recogida_punto').length
    const totalDomicilios = pedidos.filter(p => p.modalidad_entrega === 'domicilio').length

    const pedidosFiltrados = pedidos.filter(o => {
        // Filtro por modalidad
        if (filtroModalidad === 'recogida_punto' && o.modalidad_entrega !== 'recogida_punto') return false
        if (filtroModalidad === 'domicilio' && o.modalidad_entrega !== 'domicilio') return false

        // Filtro por término de búsqueda
        const termino = busqueda.toLowerCase().trim()
        if (!termino) return true

        const modalidadTexto = o.modalidad_entrega === 'recogida_punto' ? 'recogida en punto tienda' : (o.modalidad_entrega ?? '')
        return (
            String(o.numero_pedido ?? '').toLowerCase().includes(termino) ||
            String(o.cliente ?? '').toLowerCase().includes(termino) ||
            String(o.repartidor ?? '').toLowerCase().includes(termino) ||
            String(o.modalidad_entrega ?? '').toLowerCase().includes(termino) ||
            String(modalidadTexto).toLowerCase().includes(termino) ||
            String(o.total ?? '').toLowerCase().includes(termino) ||
            String(o.created_at ?? '').toLowerCase().includes(termino) ||
            String(o.estado ?? '').toLowerCase().includes(termino)
        )
    })

    return (
        <div className='p-4'>
            <div className='d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2'>
                <div>
                    <h3 className='fw-bold mb-1'>Gestión de pedidos</h3>
                    <small className='text-muted'>
                        {pedidos.length} pedidos totales ({totalRecogidas} en punto / {totalDomicilios} a domicilio)
                    </small>
                </div>
                <div className='d-flex gap-2'>
                    <button className='btn btn-outline-secondary' type='button' onClick={cargarDatos} disabled={loading} title='Recargar pedidos'>
                        <i className={`bi bi-arrow-clockwise me-1 ${loading ? 'spinner-border spinner-border-sm' : ''}`}></i>
                        Actualizar
                    </button>
                    <button className='btn btn-ember' type='button' onClick={abrirModalNuevo}>
                        <i className='bi bi-plus-lg me-1'></i>
                        Crear pedido
                    </button>
                </div>
            </div>

            {/* Spinner de carga inicial */}
            {loading && !mostrarModal && (
                <div className='text-center py-3 text-muted'>
                    <span className='spinner-border spinner-border-sm me-2' />
                    Cargando pedidos...
                </div>
            )}

            <OrdenModal
                show={mostrarModal}
                onClose={cerrarModal}
                formulario={formulario}
                cambiarCampo={cambiarCampo}
                enviarFormulario={enviarFormulario}
                limpiarFormulario={limpiarFormulario}
                ordenEditando={ordenEditando}
                loading={loading}
                error={error}
                mensaje={mensaje}
            />

            <div className='card border-0 p-3 shadow-sm'>
                {/* Filtros de pestañas por Modalidad y Barra de búsqueda */}
                <div className='row g-2 mb-3 align-items-center'>
                    <div className='col-md-7 d-flex gap-2 flex-wrap'>
                        <button
                            type='button'
                            className={`btn btn-sm ${filtroModalidad === 'todas' ? 'btn-dark' : 'btn-outline-secondary'}`}
                            onClick={() => setFiltroModalidad('todas')}
                        >
                            Todas {pedidos.length}
                        </button>
                        <button
                            type='button'
                            className={`btn btn-sm ${filtroModalidad === 'recogida_punto' ? 'btn-info text-dark fw-bold' : 'btn-outline-info text-dark'}`}
                            onClick={() => setFiltroModalidad('recogida_punto')}
                        >
                            Recogida en punto {totalRecogidas}
                        </button>
                        <button
                            type='button'
                            className={`btn btn-sm ${filtroModalidad === 'domicilio' ? 'btn-secondary text-white' : 'btn-outline-secondary'}`}
                            onClick={() => setFiltroModalidad('domicilio')}
                        >
                             Domicilio {totalDomicilios}
                        </button>
                    </div>

                    <div className='col-md-5'>
                        <input
                            className='form-control form-control-sm'
                            placeholder='Buscar por número de pedido, cliente, estado...'
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>

                <div className='table-responsive'>
                    <table className='table table-hover align-middle'>
                        <thead className='table-light'>
                            <tr>
                                <th>#Pedido</th>
                                <th>Cliente</th>
                                <th>Repartidor</th>
                                <th>Modalidad</th>
                                <th>Total</th>
                                <th>Fecha</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan='8' className='text-center py-4 text-muted'>
                                        No se encontraron pedidos con los filtros aplicados
                                    </td>
                                </tr>
                            ) : (
                                pedidosFiltrados.map((p) => (
                                    <tr key={p.id}>
                                        <td className='text-danger fw-semibold'>{p.numero_pedido}</td>
                                        <td>{p.cliente || <span className='text-muted'>Sin cliente</span>}</td>
                                        <td>
                                            {p.modalidad_entrega === 'recogida_punto' ? (
                                                <span className='text-muted small fst-italic'>No aplica</span>
                                            ) : (
                                                p.repartidor || <span className='text-muted small'>Sin asignar</span>
                                            )}
                                        </td>
                                        <td>
                                            {p.modalidad_entrega === 'recogida_punto' ? (
                                                <span >
                                                     Recogida en punto
                                                </span>
                                            ) : (
                                                <span >
                                                     Domicilio
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            ${Number(p.total || 0).toLocaleString('es-CO')}
                                        </td>
                                        <td className='small text-muted'>{p.created_at}</td>
                                        <td>
                                            <span>
                                                {p.estado}
                                            </span>
                                        </td>
                                        <td>
                                            <button className='btn btn-sm btn-outline-secondary me-2' type='button' onClick={() => abrirModalEdicion(p)}>
                                                Editar
                                            </button>
                                            <button className='btn btn-sm btn-outline-danger' type='button' onClick={() => eliminar(p.id)}>
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
