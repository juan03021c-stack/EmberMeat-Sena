import { useState, useEffect } from 'react'
import {
    obtenerUsuarios,
    obtenerRoles,
    crearUsuarios,
    actualizarUsuarios,
    eliminarUsuarios
} from '../services/Api'
import UsuarioModal from '../components/UsuarioModal'

function Avatar({ nombre }) {
    const initials = (nombre || 'U')
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()

    return (
        <div
            className='rounded-circle d-flex align-items-center justify-content-center text-white fw-medium'
            style={{ width: 36, height: 36, background: '#7B1F1F', fontSize: 13 }}
        >
            {initials}
        </div>
    )
}

function RoleBadge({ rol }) {
    const role = (rol || '').toLowerCase()

    switch (role) {
        case 'administrador':
        case 'admin':
            return <span className='badge' style={{ background: '#6f42c1', color: 'white' }}>Admin</span>
        case 'cliente':
            return <span className='badge bg-primary bg-opacity-10 text-primary'>Cliente</span>
        case 'repartidor':
            return <span className='badge bg-dark bg-opacity-10 text-secondary'>Repartidor</span>
        case 'vendedor':
            return <span className='badge bg-warning bg-opacity-10 text-warning'>Vendedor</span>
        default:
            return <span className='badge bg-light text-dark'>{rol || 'Sin rol'}</span>
    }
}

function Active({ estado }) {
    switch (estado) {
        case 1:
        case '1':
            return <span className='badge bg-success'>Activo</span>
        case 2:
        case '2':
            return <span className='badge bg-danger'>Inactivo</span>
        default:
            return <span className='badge bg-warning text-dark'>Pendiente</span>
    }
}

const estadoInicialFormulario = {
    nombre: '',
    correo: '',
    telefono: '',
    rol_id: '',
    activo: '1',
    contrasena: ''
}

export default function Users() {
    const [items, setItems] = useState([])
    const [roles, setRoles] = useState([])
    const [mostrarModal, setMostrarModal] = useState(false)
    const [usuarioEditando, setUsuarioEditando] = useState(null)
    const [formulario, setFormulario] = useState(estadoInicialFormulario)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [mensaje, setMensaje] = useState(null)

    useEffect(() => {
        async function cargarDatos() {
            try {
                const [usuarios, rolesData] = await Promise.all([
                    obtenerUsuarios(),
                    obtenerRoles()
                ])
                setItems(Array.isArray(usuarios) ? usuarios : [])
                setRoles(Array.isArray(rolesData) ? rolesData : [])
            } catch (err) {
                console.error('Error al cargar datos:', err)
                setError('No se pudieron cargar los usuarios.')
            }
        }

        cargarDatos()
    }, [])

    const cambiarCampo = (e) => {
        const { name, value } = e.target
        setFormulario((prev) => ({ ...prev, [name]: value }))
    }

    const limpiarEstado = () => {
        setError(null)
        setMensaje(null)
    }

    const abrirModalNuevo = () => {
        setUsuarioEditando(null)
        setFormulario(estadoInicialFormulario)
        limpiarEstado()
        setMostrarModal(true)
    }

    const abrirModalEdicion = (usuario) => {
        setUsuarioEditando(usuario)
        setFormulario({
            nombre: usuario.nombre || '',
            correo: usuario.correo || '',
            telefono: usuario.telefono || '',
            rol_id: usuario.rol_id || '',
            activo: String(usuario.activo ?? '1'),
            contrasena: ''
        })
        limpiarEstado()
        setMostrarModal(true)
    }

    const cerrarModal = () => {
        setMostrarModal(false)
        setUsuarioEditando(null)
        setFormulario(estadoInicialFormulario)
        limpiarEstado()
    }

    const recargarUsuarios = async () => {
        try {
            const usuarios = await obtenerUsuarios()
            setItems(Array.isArray(usuarios) ? usuarios : [])
        } catch (err) {
            console.error('Error al recargar usuarios:', err)
            setError('No se pudieron recargar los usuarios.')
        }
    }

    const enviarFormulario = async (e) => {
        e.preventDefault()
        setLoading(true)
        limpiarEstado()

        if (!formulario.nombre.trim() || !formulario.correo.trim()) {
            setError('Por favor, complete los campos obligatorios.')
            setLoading(false)
            return
        }

        try {
            const datos = new FormData()
            datos.append('nombre', formulario.nombre)
            datos.append('correo', formulario.correo)
            datos.append('telefono', formulario.telefono)
            datos.append('rol_id', formulario.rol_id)
            datos.append('activo', formulario.activo)
            if (formulario.contrasena) {
                datos.append('contrasena', formulario.contrasena)
            }

            const resultado = usuarioEditando
                ? await actualizarUsuarios(usuarioEditando.id, datos)
                : await crearUsuarios(datos)

            if (resultado?.success) {
                setMensaje(resultado.message || 'Usuario guardado correctamente.')
                await recargarUsuarios()
                cerrarModal()
            } else {
                setError(resultado?.message || 'No se pudo guardar el usuario.')
            }
        } catch (err) {
            console.error('Error al guardar usuario:', err)
            setError('Ocurrió un error al guardar el usuario.')
        } finally {
            setLoading(false)
        }
    }

    const eliminarUsuario = async (usuario) => {
        if (!window.confirm(`¿Está seguro de eliminar al usuario ${usuario.nombre}?`)) {
            return
        }

        try {
            const resultado = await eliminarUsuarios(usuario.id)
            if (resultado?.success) {
                setMensaje(resultado.message || 'Usuario eliminado correctamente.')
                await recargarUsuarios()
            } else {
                setError(resultado?.message || 'No se pudo eliminar el usuario.')
            }
        } catch (err) {
            console.error('Error al eliminar usuario:', err)
            setError('Error al eliminar el usuario.')
        }
    }

    const limpiarFormulario = () => {
        setFormulario(estadoInicialFormulario)
        limpiarEstado()
    }

    return (
        <div className='p-4'>
            <div className='d-flex justify-content-between align-items-center mb-4'>
                <h4 className='mb-0'>Usuarios</h4>
                <button className='btn btn-ember' onClick={abrirModalNuevo}>
                    + Nuevo usuario
                </button>
            </div>

            {mensaje && (
                <div className='alert alert-success alert-dismissible fade show' role='alert'>
                    {mensaje}
                    <button type='button' className='btn-close' onClick={() => setMensaje(null)}></button>
                </div>
            )}

            {error && !mostrarModal && (
                <div className='alert alert-danger alert-dismissible fade show' role='alert'>
                    {error}
                    <button type='button' className='btn-close' onClick={() => setError(null)}></button>
                </div>
            )}

            <UsuarioModal
                show={mostrarModal}
                onClose={cerrarModal}
                formulario={formulario}
                cambiarCampo={cambiarCampo}
                enviarFormulario={enviarFormulario}
                usuarioEditando={usuarioEditando}
                loading={loading}
                limpiarFormulario={limpiarFormulario}
                error={error}
                mensaje={mensaje}
                roles={roles}
            />

            <div className='card border-0 p-3'>
                <table className='table'>
                    <thead className='table-header-custom'>
                        <tr>
                            <th>Usuario</th>
                            <th>Email</th>
                            <th>Correo</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan='6' className='text-center text-muted py-4'>
                                    No hay usuarios registrados
                                </td>
                            </tr>
                        ) : (
                            items.map((u) => (
                                <tr key={u.id}>
                                    <td>
                                        <div className='d-flex align-items-center gap-2'>
                                            <Avatar nombre={u.nombre} />
                                            <span>{u.nombre}</span>
                                        </div>
                                    </td>
                                    <td className='text-muted'>{u.correo}</td>
                                    <td>{u.telefono || '-'}</td>
                                    <td>
                                        <RoleBadge rol={u.rol_nombre || u.rol || 'cliente'} />
                                    </td>
                                    <td><Active estado={u.activo} /></td>
                                    <td>
                                        <button
                                           className='btn btn-sm btn-outline-secondary me-2' type='button'
                                            onClick={() => abrirModalEdicion(u)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                           className='btn btn-sm btn-outline-danger' type='button'
                                            onClick={() => eliminarUsuario(u)}
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
    )
}