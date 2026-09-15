import { useEffect, useState } from "react";
import { obtenerClientes, obtenerProductos, obtenerUsuarios, obtenerVentas, crearVenta } from "../services/Api";

const PASOS = ["Cliente", "Productos", "Pago"];

// Convierte cualquier valor de precio a un número seguro (nunca NaN)
function precioSeguro(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

export default function Ventas() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [ventas, setVentas] = useState([]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [paso, setPaso] = useState(1); // 1, 2, 3, o "exito"
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const [nombreCliente, setNombreCliente] = useState("");
  const [vendedorId, setVendedorId] = useState("");
  const [canalVenta, setCanalVenta] = useState("Punto de venta");
  const [carrito, setCarrito] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [descuento, setDescuento] = useState(0);

  useEffect(() => {
    obtenerClientes().then(setClientes).catch(() => setClientes([]));
    obtenerProductos().then(setProductos).catch(() => setProductos([]));
    obtenerUsuarios().then(setVendedores).catch(() => setVendedores([]));
    cargarVentas();
  }, []);
  
  function cargarVentas() {
    obtenerVentas().then(setVentas).catch(() => setVentas([]));
  }

  function abrirModal() {
    setPaso(1);
    setError("");
    setNombreCliente("");
    setVendedorId("");
    setCanalVenta("Punto de venta");
    setCarrito([]);
    setBusquedaProducto("");
    setMetodoPago("Transferencia");
    setDescuento(0);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
  }

  function agregarProducto(producto) {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.id === producto.id);
      if (existe) {
        return prev.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      }
      return [...prev, { ...producto, precio: precioSeguro(producto.precio), cantidad: 1 }];
    });
  }

  function quitarProducto(id) {
    setCarrito((prev) => prev.filter((p) => p.id !== id));
  }

  function cambiarCantidad(id, cantidad) {
    const cantidadNum = Math.max(1, Number(cantidad) || 1);
    setCarrito((prev) =>
      prev.map((p) => (p.id === id ? { ...p, cantidad: cantidadNum } : p))
    );
  }

  const subtotal = carrito.reduce(
    (acc, p) => acc + precioSeguro(p.precio) * p.cantidad,
    0
  );
  const total = Math.max(0, subtotal - precioSeguro(descuento));

  function irSiguiente() {
    setError("");
    if (paso === 1) {
      if (!nombreCliente.trim()) {
        setError("Ingresa el nombre del cliente");
        return;
      }
    }
    if (paso === 2) {
      if (carrito.length === 0) {
        setError("Agrega al menos un producto");
        return;
      }
    }
    setPaso((p) => Math.min(3, p + 1));
  }

  function irAtras() {
    setError("");
    setPaso((p) => Math.max(1, p - 1));
  }

  async function confirmarVenta() {
    setError("");
    setEnviando(true);

    const venta = {
      cliente: nombreCliente,
      vendedor_id: vendedorId || null,
      canal: canalVenta,
      metodo_pago: metodoPago,
      descuento: precioSeguro(descuento),
      subtotal,
      total,
      productos: carrito.map((p) => ({
        producto_id: p.id,
        nombre: p.nombre,
        precio: precioSeguro(p.precio),
        cantidad: p.cantidad,
      })),
    };

    try {
      const resultado = await crearVenta(venta);
      if (resultado && resultado.success === false) {
        setError(resultado.message || "No se pudo registrar la venta");
        setEnviando(false);
        return;
      }
      // Éxito: mostramos la pantalla de confirmación en vez de cerrar de una
      setPaso("exito");
      cargarVentas();
    } catch (err) {
      setError("Error al conectar con el servidor");
    } finally {
      setEnviando(false);
    }
  }

  const productosFiltrados = productos.filter((p) =>
    p.nombre?.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">Ventas</h2>
          <small className="text-secondary">
            {clientes.length} clientes registrados
          </small>
        </div>
        <button className="btn btn-danger" onClick={abrirModal}>
          + Nueva venta
        </button>
      </div>

      <div className="card p-3 mb-4">
        <h5>Productos disponibles</h5>
        {productos.length === 0 ? (
          <p className="text-secondary">No hay productos cargados.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>${precioSeguro(p.precio).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card p-3">
        <h5>Historial de ventas</h5>
        {ventas.length === 0 ? (
          <p className="text-secondary">Aún no hay ventas registradas.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Canal</th>
                  <th>Método de pago</th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => (
                  <tr key={v.id}>
                    <td>{v.cliente}</td>
                    <td>{v.canal}</td>
                    <td>{v.metodo_pago}</td>
                    <td>{v.productos ? v.productos.length : 0} items</td>
                    <td className="fw-semibold text-danger">
                      ${precioSeguro(v.total).toLocaleString()}
                    </td>
                    <td className="text-secondary">
                      {v.created_at
                        ? new Date(v.created_at).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalAbierto && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => e.target === e.currentTarget && cerrarModal()}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-3">
              {paso === "exito" ? (
                <div className="text-center py-4">
                  <div
                    className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{ width: 64, height: 64, fontSize: 32 }}
                  >
                    ✓
                  </div>
                  <h5 className="mb-1">¡Venta registrada!</h5>
                  <p className="text-secondary mb-4">
                    La venta de {nombreCliente} por ${total.toLocaleString()} se guardó correctamente.
                  </p>
                  <button className="btn btn-success" onClick={cerrarModal}>
                    Listo
                  </button>
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="mb-0">Nueva venta</h5>
                      <small className="text-secondary">
                        Paso {paso} de 3 — {PASOS[paso - 1]}
                      </small>
                    </div>
                    <button
                      className="btn-close"
                      onClick={cerrarModal}
                      aria-label="Cerrar"
                    ></button>
                  </div>

                  <div className="d-flex align-items-center justify-content-between my-3">
                    {PASOS.map((p, i) => (
                      <div key={p} className="d-flex align-items-center flex-grow-1">
                        <div
                          className={
                            "rounded-circle d-flex align-items-center justify-content-center " +
                            (i + 1 < paso
                              ? "bg-success text-white"
                              : i + 1 === paso
                              ? "bg-danger text-white"
                              : "bg-secondary-subtle text-secondary")
                          }
                          style={{ width: 28, height: 28, fontSize: 13 }}
                        >
                          {i + 1 < paso ? "✓" : i + 1}
                        </div>
                        <span className="mx-2" style={{ fontSize: 13 }}>
                          {p}
                        </span>
                        {i < PASOS.length - 1 && (
                          <div className="flex-grow-1 border-top mx-2"></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {error && <div className="alert alert-danger py-2">{error}</div>}

                  {paso === 1 && (
                    <div>
                      <label className="form-label">Nombre del cliente *</label>
                      <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Ej. Juan Pérez"
                        value={nombreCliente}
                        onChange={(e) => setNombreCliente(e.target.value)}
                      />

                      <label className="form-label">Vendedor</label>
                      <select
                        className="form-select mb-3"
                        value={vendedorId}
                        onChange={(e) => setVendedorId(e.target.value)}
                      >
                        <option value="">Selecciona un vendedor</option>
                        {vendedores.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.nombre}
                          </option>
                        ))}
                      </select>

                      <label className="form-label">Canal de venta</label>
                      <div className="d-flex gap-2">
                        {["Punto de venta", "Domicilio"].map((canal) => (
                          <button
                            key={canal}
                            type="button"
                            className={
                              "btn flex-grow-1 " +
                              (canalVenta === canal
                                ? "btn-outline-danger border-2"
                                : "btn-outline-secondary")
                            }
                            onClick={() => setCanalVenta(canal)}
                          >
                            {canal}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {paso === 2 && (
                    <div>
                      <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Buscar producto..."
                        value={busquedaProducto}
                        onChange={(e) => setBusquedaProducto(e.target.value)}
                      />

                      <div className="row g-2 mb-3" style={{ maxHeight: 200, overflowY: "auto" }}>
                        {productosFiltrados.map((p) => (
                          <div key={p.id} className="col-6">
                            <div className="border rounded p-2 d-flex justify-content-between align-items-center">
                              <div>
                                <div style={{ fontSize: 13 }}>{p.nombre}</div>
                                <small className="text-danger">
                                  ${precioSeguro(p.precio).toLocaleString()}
                                </small>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => agregarProducto(p)}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {carrito.length > 0 && (
                        <div>
                          <h6>Carrito</h6>
                          {carrito.map((p) => (
                            <div
                              key={p.id}
                              className="d-flex justify-content-between align-items-center mb-2"
                            >
                              <span style={{ fontSize: 13 }}>{p.nombre}</span>
                              <div className="d-flex align-items-center gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  className="form-control form-control-sm"
                                  style={{ width: 60 }}
                                  value={p.cantidad}
                                  onChange={(e) =>
                                    cambiarCantidad(p.id, e.target.value)
                                  }
                                />
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => quitarProducto(p.id)}
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {paso === 3 && (
                    <div>
                      <label className="form-label">Método de pago</label>
                      <div className="row g-2 mb-3">
                        {["Efectivo", "Tarjeta", "Nequi", "Bancolombia"].map(
                          (metodo) => (
                            <div className="col-6" key={metodo}>
                              <button
                                type="button"
                                className={
                                  "btn w-100 text-start " +
                                  (metodoPago === metodo
                                    ? "btn-outline-success border-2"
                                    : "btn-outline-secondary")
                                }
                                onClick={() => setMetodoPago(metodo)}
                              >
                                {metodo}
                              </button>
                            </div>
                          )
                        )}
                      </div>

                      <label className="form-label">Descuento (opcional)</label>
                      <input
                        type="number"
                        className="form-control mb-3"
                        min="0"
                        value={descuento}
                        onChange={(e) => setDescuento(e.target.value)}
                      />

                      <div className="border rounded p-3 mb-3" style={{ background: "#f8f8f8" }}>
                        <strong style={{ fontSize: 12 }}>RESUMEN DEL PEDIDO</strong>
                        <div className="d-flex justify-content-between mt-2">
                          <span>Cliente</span>
                          <span>{nombreCliente}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Canal</span>
                          <span>{canalVenta}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Productos</span>
                          <span>{carrito.length} items</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Subtotal</span>
                          <span>${subtotal.toLocaleString()}</span>
                        </div>
                        <div className="d-flex justify-content-between fw-bold">
                          <span>Total</span>
                          <span className="text-danger">
                            ${total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="d-flex justify-content-between mt-3">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={paso === 1 ? cerrarModal : irAtras}
                      disabled={enviando}
                    >
                      {paso === 1 ? "Cancelar" : "Atrás"}
                    </button>

                    {paso < 3 ? (
                      <button className="btn btn-danger" onClick={irSiguiente}>
                        Siguiente →
                      </button>
                    ) : (
                      <button
                        className="btn btn-success"
                        onClick={confirmarVenta}
                        disabled={enviando}
                      >
                        {enviando ? "Guardando..." : "✓ Confirmar venta"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}