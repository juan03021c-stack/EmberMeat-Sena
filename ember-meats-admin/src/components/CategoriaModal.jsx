
export default function CategoriaModal({
  show,
  onClose,
  formulario,
  cambiarCampo,
  enviarFormulario,
  categoriaEditando,
  loading,
  limpiarFormulario,
  error,
  mensaje
}) {
  if (!show) return null

  return (
    <div
      className='modal fade show d-block'
      tabIndex='-1'
      role='dialog'
      style={{
        backgroundColor: 'var(--ember-overlay-mid)'
      }}
    >
      <div
        className='modal-dialog modal-lg modal-dialog-centered'
        role='document'
      >
        <div className='modal-content card border-0 shadow-lg'>
          <div className='modal-header'>
            <h5 className='modal-title fw-bold text-ember-dark'>
              {categoriaEditando
                ? 'Editar categoría'
                : 'Nueva categoría'}
            </h5>

            <button
              type='button'
              className='btn-close'
              onClick={onClose}
              aria-label='Cerrar'
              disabled={loading}
            />
          </div>

          <div className='modal-body'>
            {error && (
              <div className='alert alert-danger' role='alert'>
                {error}
              </div>
            )}

            {mensaje && (
              <div className='alert alert-success' role='alert'>
                {mensaje}
              </div>
            )}

            <form
              id='categoria-form'
              onSubmit={enviarFormulario}
            >
              <div className='row g-3'>
                <div className='col-md-4'>
                  <label className='form-label'>
                    Nombre
                  </label>

                  <input
                    type='text'
                    name='nombre'
                    value={formulario.nombre ?? ''}
                    onChange={cambiarCampo}
                    className='form-control'
                    placeholder='Nombre de la categoría'
                    required
                    disabled={loading}
                  />
                </div>

                <div className='col-md-4'>
                  <label className='form-label'>
                    Descripción
                  </label>

                  <input
                    type='text'
                    name='descripcion'
                    value={formulario.descripcion ?? ''}
                    onChange={cambiarCampo}
                    className='form-control'
                    placeholder='Descripción de la categoría'
                    disabled={loading}
                  />
                </div>

                <div className='col-md-4'>
                  <label className='form-label'>
                    Estado
                  </label>

                  <select
                    name='activo'
                    value={String(
                      formulario.activo ??
                      formulario.estado ??
                      '1'
                    )}
                    onChange={cambiarCampo}
                    className='form-select'
                    required
                    disabled={loading}
                  >
                    <option value='1'>Activo</option>
                    <option value='0'>Inactivo</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          <div className='modal-footer'>
            <button
              className='btn btn-outline-secondary'
              type='button'
              onClick={limpiarFormulario}
              disabled={loading}
            >
              Limpiar
            </button>

            <button
              className='btn btn-ember'
              type='submit'
              form='categoria-form'
              disabled={loading}
            >
              {loading
                ? 'Guardando...'
                : categoriaEditando
                  ? 'Actualizar'
                  : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
