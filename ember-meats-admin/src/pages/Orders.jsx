import Swal from 'sweetalert2'
import { useState, useEffect, useCallback } from 'react'
import {
    actualizarPedido,
    obtenerClientesPedido,
    obtenerPedidos
} from '../services/Api'
import OrdenModal from '../components/OrdenModal'

const estadoInicialFormulario = {
    cliente: '',
    fecha: '',
    total: '',
    estado: 'pendiente',
    modalidad_entrega: 'domicilio',
    direccion_entrega: ''
}

export default function Orders() {
    const [pedidos, setPedidos] = useState([])
    const [clientes, setClientes] = useState([])
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
            const [pedidosData, clientesData] = await Promise.all([
                obtenerPedidos(),
                obtenerClientesPedido()
            ])
            setPedidos(pedidosData)
            setClientes(clientesData)
        } catch (err) {
            console.error('Error al cargar datos:', err)
            setError(err.message || 'Error al cargar datos')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void Promise.resolve().then(cargarDatos)
    }, [cargarDatos])

    function cambiarCampo(e) {
        const { name, value } = e.target
        setFormulario(prev => ({ ...prev, [name]: value }))
    }

    const abrirModalEdicion = (pedidosData) => {
        setpedidosditando(pedidosData)
        setFormulario({
            cliente: String(pedidosData.cliente_id || ''),
            fecha: pedidosData.created_at ? pedidosData.created_at.split(' ')[0] : '',
            total: pedidosData.total || pedidosData.monto_total || '',
            estado: pedidosData.estado || 'pendiente',
            modalidad_entrega: pedidosData.modalidad_entrega || 'domicilio',
            direccion_entrega: pedidosData.direccion_entrega || ''
        })
        setMensaje(null)
        setError(null)
        setMostrarModal(true)
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
        if (!formulario.cliente || formulario.total === '') {
            setError('Todos los campos son obligatorios')
            setLoading(false)
            return
        }

        try {
            const datosPedido = {
                cliente_id: Number(formulario.cliente),
                fecha: formulario.fecha,
                total: Number(formulario.total),
                estado: formulario.estado,
                modalidad_entrega: formulario.modalidad_entrega,
                direccion_entrega: formulario.direccion_entrega.trim()
            }

            await actualizarPedido({ ...datosPedido, id: ordenEditando.id })

            await cargarDatos()
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Orden actualizada', showConfirmButton: false, timer: 2500 })
            cerrarModal()
        } catch (saveError) {
            console.error(saveError)
            setError(saveError.message || 'Error al guardar la orden')
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
                    <h3 className='fw-bold mb-1'>Gestión de ordenes</h3>
                    <small className='text-muted'>
                        {pedidos.length} ordenes totales ({totalRecogidas} en punto / {totalDomicilios} a domicilio)
                    </small>
                </div>
                <div className='d-flex gap-2'>
                    <button className='btn ember-btn-terciario' type='button' onClick={cargarDatos} disabled={loading} title='Recargar pedidos'>
                        <i className={`bi bi-arrow-clockwise me-1 ${loading ? 'spinner-border spinner-border-sm' : ''}`}></i>
                        Actualizar
                    </button>
                </div>
            </div>

            {/* Spinner de carga inicial */}
            {loading && !mostrarModal && (
                <div className='text-center py-3 text-muted'>
                    <span className='spinner-border spinner-border-sm text-ember-red me-2' />
                    Cargando ordenes...
                </div>
            )}

            <OrdenModal
                show={mostrarModal}
                onClose={cerrarModal}
                formulario={formulario}
                cambiarCampo={cambiarCampo}
                enviarFormulario={enviarFormulario}
                loading={loading}
                error={error}
                mensaje={mensaje}
                clientes={clientes}
            />

            {error && !mostrarModal && (
                <div className='alert alert-danger' role='alert'>
                    {error}
                </div>
            )}

            <div className='card p-3'>
                {/* Filtros de pestañas por Modalidad y Barra de búsqueda */}
                <div className='row g-2 mb-3 align-items-center'>
                    <div className='col-md-7 d-flex gap-2 flex-wrap'>
                        <button
                            type='button'
                            className={`btn btn-sm ${filtroModalidad === 'todas' ? 'ember-btn-terciario' : 'ember-btn text-white'}`}
                            onClick={() => setFiltroModalidad('todas')}
                        >
                            Todas {pedidos.length}
                        </button>
                        <button
                            type='button'
                            className={`btn btn-sm ${filtroModalidad === 'recogida_punto' ? 'ember-btn-terciario' : 'ember-btn text-white'}`}
                            onClick={() => setFiltroModalidad('recogida_punto')}
                        >
                            Recogida en punto {totalRecogidas}
                        </button>
                        <button
                            type='button'
                            className={`btn btn-sm ${filtroModalidad === 'domicilio' ? 'ember-btn-terciario' : 'ember-btn text-white'}`}
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
                        <thead>
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
                                        No se encontraron ordenes con los filtros aplicados
                                    </td>
                                </tr>
                            ) : (
                                pedidosFiltrados.map((p) => (
                                    <tr key={p.id}>
                                        <td className='text-ember-red fw-semibold'>{p.numero_pedido}</td>
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
                                            <button className='btn btn-sm ember-btn-terciario me-2' type='button' onClick={() => abrirModalEdicion(p)}>
                                                Editar
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
