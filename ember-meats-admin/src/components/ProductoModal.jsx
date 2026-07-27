export default function ProductoModal({
    show,
    onClose,
    formulario,
    cambiarCampo,
    enviarFormulario,
    productoEditando,
    loading,
    categorias,
    limpiarFormulario,
    error,
    mensaje
}) {
    if (!show) return null

    return (
        <div className='modal fade show d-block' tabIndex='-1' role='dialog' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className='modal-dialog modal-lg modal-dialog-centered' role='document'>
                <div className='modal-content'>
                    <div className='modal-header'>
                        <h5 className='modal-title'>{productoEditando ? 'Editar producto' : 'Nuevo producto'}</h5>
                        <button type='button' className='btn-close' onClick={onClose} aria-label='Cerrar' />
                    </div>

                    <div className='modal-body'>
                        {error && <div className='alert alert-danger'>{error}</div>}
                        {mensaje && <div className='alert alert-success'>{mensaje}</div>}

                        <form id='producto-form' onSubmit={enviarFormulario}>
                            <div className='row g-3'>
                                <div className='col-md-4'>
                                    <label className='form-label'>Nombre</label>
                                    <input
                                        name='nombre'
                                        value={formulario.nombre}
                                        onChange={cambiarCampo}
                                        className='form-control'
                                        placeholder='Nombre del producto'
                                    />
                                </div>

                                <div className='col-md-4'>
                                    <label className='form-label'>Precio</label>
                                    <input
                                        name='precio'
                                        type='number'
                                        step='0.01'
                                        value={formulario.precio}
                                        onChange={cambiarCampo}
                                        className='form-control'
                                        placeholder='0.00'
                                    />
                                </div>

                                <div className='col-md-4'>
                                    <label className='form-label'>Stock</label>
                                    <input
                                        name='stock'
                                        type='number'
                                        min='0'
                                        value={formulario.stock}
                                        onChange={cambiarCampo}
                                        className='form-control'
                                        placeholder='0'
                                    />
                                </div>

                                <div className='col-md-4'>
                                    <label className='form-label'>Categoría</label>
                                    <select
                                        name='categoria_id'
                                        value={formulario.categoria_id}
                                        onChange={cambiarCampo}
                                        className='form-select'
                                    >
                                        <option value=''>Seleccione una categoría</option>
                                        {categorias.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className='col-md-4'>
                                    <label className='form-label'>Estado</label>
                                    <select
                                        name='activo'
                                        value={formulario.activo}
                                        onChange={cambiarCampo}
                                        className='form-select'
                                    >
                                        <option value='1'>Activo</option>
                                        <option value='0'>Inactivo</option>
                                    </select>
                                </div>

                                <div className='col-md-4'>
                                    <label className='form-label'>Imagen</label>
                                    <input name='imagen' type='file' accept='image/*' onChange={cambiarCampo} className='form-control' />
                                </div>

                                <div className='col-md-12'>
                                    <label className='form-label'>Presentación</label>
                                    <input
                                        name='presentacion'
                                        value={formulario.presentacion}
                                        onChange={cambiarCampo}
                                        className='form-control'
                                        placeholder='Ej. Kg, bandeja, paquete'
                                    />
                                </div>

                                <div className='col-md-12'>
                                    <label className='form-label'>Descripción</label>
                                    <textarea
                                        name='descripcion'
                                        value={formulario.descripcion}
                                        onChange={cambiarCampo}
                                        className='form-control'
                                        rows='2'
                                        placeholder='Descripción'
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className='modal-footer'>
                        <button className='btn btn-outline-secondary' type='button' onClick={limpiarFormulario} disabled={loading}>
                            Limpiar
                        </button>
                        <button className='btn btn-ember' type='submit' form='producto-form' disabled={loading}>
                            {productoEditando ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}