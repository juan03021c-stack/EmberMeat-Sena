
export default function OrdenModal({
    show,
    onClose,
    formulario,
    cambiarCampo,
    enviarFormulario,
    loading,
    error,
    mensaje,
    clientes = []
}) {
    if (!show) return null;

    return (
        <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{
                backgroundColor: "var(--ember-overlay-mid)"
            }}
        >
            <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                <div className="modal-content card border-0 shadow-lg">

                    <div className="modal-header">
                        <h5 className="modal-title fw-bold text-ember-dark">
                            Editar orden
                        </h5>

                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Cerrar"
                        />
                    </div>

                    <div className="modal-body">

                        {error && (
                            <div className="alert alert-danger">
                                {error}
                            </div>
                        )}

                        {mensaje && (
                            <div className="alert alert-success">
                                {mensaje}
                            </div>
                        )}

                        <form id="orden-form" onSubmit={enviarFormulario}>
                            <div className="row g-3">

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Cliente
                                    </label>

                                    <select
                                        name="cliente"
                                        value={formulario.cliente ?? ""}
                                        onChange={cambiarCampo}
                                        className="form-select"
                                        required
                                    >
                                        <option value="">Seleccione un cliente</option>
                                        {clientes.map((cliente) => (
                                            <option key={cliente.id} value={cliente.id}>
                                                {cliente.nombre} ({cliente.correo})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Fecha
                                    </label>

                                    <input
                                        name="fecha"
                                        type="date"
                                        value={formulario.fecha ?? ""}
                                        onChange={cambiarCampo}
                                        className="form-control"
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Total
                                    </label>

                                    <input
                                        name="total"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formulario.total ?? ""}
                                        onChange={cambiarCampo}
                                        className="form-control"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Dirección de entrega
                                    </label>

                                    <input
                                        name="direccion_entrega"
                                        value={formulario.direccion_entrega ?? ""}
                                        onChange={cambiarCampo}
                                        className="form-control"
                                        placeholder="Dirección del pedido"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Modalidad de entrega
                                    </label>

                                    <select
                                        name="modalidad_entrega"
                                        value={formulario.modalidad_entrega ?? "domicilio"}
                                        onChange={cambiarCampo}
                                        className="form-select"
                                        required
                                    >
                                        <option value="domicilio">
                                            🏠 Domicilio
                                        </option>

                                        <option value="recogida_punto">
                                            🏬 Recogida en punto
                                        </option>
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Estado
                                    </label>

                                    <select
                                        name="estado"
                                        value={formulario.estado ?? "pendiente"}
                                        onChange={cambiarCampo}
                                        className="form-select"
                                        required
                                    >
                                        <option value="pendiente">
                                            Pendiente
                                        </option>

                                        <option value="en_preparacion">
                                            En preparación
                                        </option>

                                        <option value="listo_para_entrega">
                                            Listo para entrega
                                        </option>

                                        <option value="intento_fallido">
                                            Intento fallido
                                        </option>

                                        <option value="en_camino">
                                            En camino
                                        </option>

                                        <option value="entregado">
                                            Entregado
                                        </option>

                                        <option value="cancelado">
                                            Cancelado
                                        </option>
                                    </select>
                                </div>

                            </div>

                            <div className="mt-4 d-flex justify-content-end">

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary me-2"
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-ember"
                                    disabled={loading}
                                >
                                    {loading ? "Guardando..." : "Actualizar orden"}
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
