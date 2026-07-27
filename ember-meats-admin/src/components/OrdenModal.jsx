export default function OrdenModal({
     show,
     onClose,
     formulario,
     cambiarCampo,
     enviarFormulario,
     ordenEditando,
     loading,
     limpiarFormulario,
     error,
     mensaje
    }){
        if (!show) return null
         // show es una prop que indica si el modal debe mostrarse o no. Si es false, no se renderiza nada.
        return (
            <div className='modal fade show d-block' tabIndex='-1' role='dialog' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className='modal-dialog modal-lg modal-dialog-centered' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>{ordenEditando ? 'Editar orden' : 'Nueva orden'}</h5>
                            <button type='button' className='btn-close' onClick={onClose} aria-label='Cerrar' />
                        </div>

                        <div className='modal-body'>
                            {error && <div className='alert alert-danger'>{error}</div>}
                            {mensaje && <div className='alert alert-success'>{mensaje}</div>}

                            <form id='orden-form' onSubmit={enviarFormulario}>
                                <div className='row g-3'>
                                    <div className='col-md-6'>
                                        <label className='form-label'>Cliente</label>
                                        <input
                                            name='cliente'
                                            value={formulario.cliente}
                                            onChange={cambiarCampo}
                                            className='form-control'
                                            placeholder='Nombre del cliente'
                                        />
                                    </div>

                                    <div className='col-md-6'>
                                        <label className='form-label'>Fecha</label>
                                        <input
                                            name='fecha'
                                            type='date'
                                            value={formulario.fecha}
                                            onChange={cambiarCampo}
                                            className='form-control'
                                        />
                                    </div>

                                    <div className='col-md-6'>
                                        <label className='form-label'>Total</label>
                                        <input
                                            name='total'
                                            type='number'
                                            step='0.01'
                                            value={formulario.total}
                                            onChange={cambiarCampo}
                                            className='form-control'
                                            placeholder='0.00'
                                        />
                                    </div>

                                    <div className='col-md-6'>
                                        <label className='form-label'>Estado</label>
                                        <select
                                            name='estado'
                                            value={formulario.estado}
                                            onChange={cambiarCampo}
                                            className='form-select'
                                        >
                                            {['Pending', 'Processing', 'Shipped', 'Delivered'].map(s =>
                                                <option key={s}>{s}</option>
                                            )}
                                        </select>
                                    </div>
                                </div>

                                <div className='mt-4 d-flex justify-content-end'>
                                    <button type='button' className='btn btn-secondary me-2' onClick={limpiarFormulario}>
                                        Limpiar</button>
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