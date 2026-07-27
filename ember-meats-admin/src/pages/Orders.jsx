import { useState } from 'react'
import { initialOrders } from '../data/mockData' // Importa los datos de ejemplo de orders
import OrdenModal from '../components/OrdenModal'
// faltan las funciones de API para obtener, crear, actualizar y eliminar órdenes, ya que en este ejemplo se está utilizando un estado local para manejar las órdenes.

const estadoInicialFormulario = {
    cliente: '',
    fecha: '',
    total: '',
    estado: 'Pendiente'
}
// para filtrar con los estados 
const STATUSES = ['Todos los estados', 'Pendiente', 'Procesando', 'Enviado', 'Entregado']

const ORDER_STATUS_OPTIONS = ['Pendiente', 'Procesando', 'Enviado', 'Entregado']
function Insignia({ status }) {
    if (status === 'Pendiente') return <span className='badge bg-warning text-dark'>Pendiente</span>
    if (status === 'Procesando') return <span className='badge bg-primary'>Procesando</span>
    if (status === 'Enviado') return <span className='badge bg-info text-dark'>Enviado</span>
    if (status === 'Entregado') return <span className='badge bg-success'>Entregado</span>
    return null
}


export default function Orders() {
    const [filter, setFilter] = useState('Todos los estados')
    const [orders, setOrders] = useState(initialOrders)
    const [formulario, setFormulario] = useState(estadoInicialFormulario)
    const [mensaje, setMensaje] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [mostrarModal, setMostrarModal] = useState(false)
    const [ordenEditando, setOrdenEditando] = useState(null)

    const filtered = orders.filter(o =>
        filter === 'Todos los estados' ? true : o.status === filter
    )

    const updateStatus = (id, newStatus) => {
        setOrders(prev => prev.map(o =>
            o.id === id ? { ...o, status: newStatus } : o
        ))
    }

    function cambiarCampo(e) {
        const { name, value } = e.target
        setFormulario(prev => ({ ...prev, [name]: value }))
    }

    const abrirModalNuevo = () => {
        setOrdenEditando(null)
        setFormulario(estadoInicialFormulario)
        setMensaje(null)
        setError(null)
        setMostrarModal(true)
    }

    const abrirModalEdicion = (order) => {
        setOrdenEditando(order)
        setFormulario({
            cliente: order.customer,
            fecha: order.date,
            total: order.total,
            estado: order.status
        })
        setMensaje(null)
        setError(null)
        setMostrarModal(true)
    }

    const limpiarFormulario = () => {
        setOrdenEditando(null)
        setFormulario(estadoInicialFormulario)
        setMensaje(null)
        setError(null)
    }

    const cerrarModal = () => {
        setMostrarModal(false)
        setOrdenEditando(null)
        setMensaje(null)
        setError(null)
    }
    const enviarFormulario = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMensaje(null)
        if (formulario.cliente.trim() === '' || formulario.fecha.trim() === '' || formulario.total.trim() === '' || formulario.estado.trim() === '') {
            setError('Todos los campos son obligatorios')
            setLoading(false)
            return
        }

        try {
            if (ordenEditando) {
                setOrders(prev => prev.map(o =>
                    o.id === ordenEditando.id
                        ? {
                            ...o,
                            customer: formulario.cliente,
                            date: formulario.fecha,
                            total: formulario.total,
                            status: formulario.estado
                        }
                        : o
                ))
                setMensaje('Order updated successfully')
            } else {
                const nextId = `#OR${String(orders.length + 1).padStart(3, '0')}`
                setOrders(prev => [
                    ...prev,
                    {
                        id: nextId,
                        customer: formulario.cliente,
                        date: formulario.fecha,
                        items: 0,
                        total: formulario.total,
                        status: formulario.estado
                    }
                ])
                setMensaje('Order created successfully')
            }
            limpiarFormulario()
            cerrarModal()
        } catch (saveError) {
            console.error(saveError)
            setError('Error saving order')
        } finally {
            setLoading(false)
        }
    }
    const eliminar = (id) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return
        setLoading(true)
        setError(null)
        setMensaje(null)
        try {
            setOrders(prev => prev.filter(o => o.id !== id))
            setMensaje('Order deleted successfully')
        } catch (deleteError) {
            console.error(deleteError)
            setError('Error deleting order')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='p-4'>
            <div className='d-flex justify-content-between align-items-center mb-4'>
                <div>
                    <h4 className='fw-bold mb-1'>Ordenes</h4>
                    <small className='text-muted'>{orders.length} Ordenes</small>
                </div>
                <button className='btn btn-ember' type='button' onClick={abrirModalNuevo}>
                    Crear Orden
                </button>
            </div>
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
            <div className='card border-0 p-3'>
                {/* Filtro por estado */}
                <select className='form-select w-auto mb-3'
                    value={filter} onChange={e => setFilter(e.target.value)}>
                    {STATUSES.map(s => (
                        <option key={s}>{s === 'ALL' ? 'ALL Statuses' : s}</option>
                    ))}
                </select>

                <table className='table'>
                    <thead>
                        <tr>
                            <th>Ordenes#</th><th>Clientes</th><th>Fecha</th>
                            <th>Elementos</th><th>Total</th><th>Estado</th><th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(o => (
                            <tr key={o.id}>
                                <td className='text-danger'>{o.id}</td>
                                <td>{o.customer}</td>
                                <td>{o.date}</td>
                                <td>{o.items}</td>
                                <td>{o.total}</td>
                                <td>
                                    <select className='form-select form-select-sm w-auto'
                                        value={o.status}
                                        onChange={e => updateStatus(o.id, e.target.value)}>
                                        <Insignia status={o.status} />
                                        {ORDER_STATUS_OPTIONS.map(s =>
                                            <option key={s}>{s}</option>
                                        )}
                                    </select>
                                </td>
                                <td >
                                    <button className='btn btn-sm btn-outline-secondary me-2' type='button' onClick={() => abrirModalEdicion(o)}>
                                        Editar
                                    </button>
                                    <button className='btn btn-sm btn-outline-danger' type='button' onClick={() => eliminar(o.id)}>
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
