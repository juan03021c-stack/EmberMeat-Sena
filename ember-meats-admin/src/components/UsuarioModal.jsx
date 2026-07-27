export default function UsuarioModal({
    show,
    onClose,
    formulario,
    cambiarCampo,
    enviarFormulario,
    usuarioEditando,
    loading,
    limpiarFormulario,
    error,
    mensaje,
    roles = []
}) {
    if (!show) return null

    return (
        <div className='modal fade show d-block' tabIndex='-1' role='dialog' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className='modal-dialog modal-lg modal-dialog-centered' role='document'>
                <div className='modal-content'>

                    {/* HEADER */}
                    <div className='modal-header'>
                        <h5 className='modal-title'>
                            {usuarioEditando ? 'Editar usuario' : 'Nuevo usuario'}
                        </h5>
                        <button type='button' className='btn-close' onClick={onClose} aria-label='Cerrar' />
                    </div>

                    {/* BODY */}
                    <div className='modal-body'>
                        {error && <div className='alert alert-danger'>{error}</div>}
                        {mensaje && <div className='alert alert-success'>{mensaje}</div>}

                        <form id='usuario-form' onSubmit={enviarFormulario}>
                            <div className='row g-3'>

                                {/* NOMBRE */}
                                <div className='col-md-6'>
                                    <label className='form-label'>Nombre</label>
                                    <input
                                        name='nombre'
                                        value={formulario.nombre || ''}
                                        onChange={cambiarCampo}
                                        className='form-control'
                                        placeholder='Nombre del usuario'
                                    />
                                </div>

                                {/* CORREO */}
                                <div className='col-md-6'>
                                    <label className='form-label'>Correo</label>
                                    <input
                                        name='correo'
                                        type='email'
                                        value={formulario.correo || ''}
                                        onChange={cambiarCampo}
                                        className='form-control'
                                        placeholder='Correo electrónico'
                                    />
                                </div>

                                {/* TELÉFONO */}
                                <div className='col-md-6'>
                                    <label className='form-label'>Teléfono</label>
                                    <input
                                        name='telefono'
                                        type='tel'
                                        value={formulario.telefono || ''}
                                        onChange={cambiarCampo}
                                        className='form-control'
                                        placeholder='Número de teléfono'
                                    />
                                </div>

                                {/* ROL */}
                                <div className='col-md-6'>
                                    <label className='form-label'>Rol</label>
                                    <select
                                        name='rol_id'
                                        value={formulario.rol_id || ''}
                                        onChange={cambiarCampo}
                                        className='form-select'
                                    >
                                        <option value=''>Seleccione un rol</option>
                                        {roles.map((rol) => (
                                            <option key={rol.id} value={rol.id}>
                                                {rol.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* CONTRASEÑA */}
                                <div className='col-md-6'>
                                    <label className='form-label'>Contraseña {usuarioEditando ? '(opcional para cambiar)' : ''}</label>
                                    <input
                                        name='contrasena'
                                        type='password'
                                        value={formulario.contrasena || ''}
                                        onChange={cambiarCampo}
                                        className='form-control'
                                        placeholder={usuarioEditando ? 'Nueva contraseña' : 'Contraseña'}
                                    />
                                </div>

                                {/* ESTADO */}
                                <div className='col-md-6'>
                                    <label className='form-label'>Estado</label>
                                    <select
                                        name='activo'
                                        value={formulario.activo || '1'}
                                        onChange={cambiarCampo}
                                        className='form-select'
                                    >
                                        <option value='1'>Activo</option>
                                        <option value='0'>Inactivo</option>
                                    </select>
                                </div>
                            </div>

                            <div className='mt-4 d-flex justify-content-end'>
                                <button type='button' className='btn btn-secondary me-2' onClick={limpiarFormulario}>
                                    Limpiar
                                </button>
                                <button type='submit' className='btn btn-primary' disabled={loading}>
                                    {loading ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}