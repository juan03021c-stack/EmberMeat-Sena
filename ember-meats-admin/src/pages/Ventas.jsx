import { useEffect, useState } from "react";
import { obtenerClientes, obtenerVentas } from "../services/Api";

// funcion del avatar
function Avatar({ cliente }) {
    const initials = (cliente || 'v')
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()

    return (
        <div
            className='rounded-circle d-flex align-items-center justify-content-center text-white fw-medium'
            style={{ width: 36, height: 36, background: 'var(--ember-red)', fontSize: 'var(--text-body-sm)' }}
        >
            {initials}
        </div>
    )
}

// Convierte cualquier valor de precio a un número seguro (nunca NaN)
function precioSeguro(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

export default function Ventas() {
  const [clientes, setClientes] = useState([]);
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    obtenerClientes()
      .then(setClientes)
      .catch(() => setClientes([]));

    obtenerVentas()
      .then(setVentas)
      .catch(() => setVentas([]));
  }, []);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0 fw-bold">Ventas</h2>
          <small className="text-secondary">
            {clientes.length} clientes registrados
          </small>
        </div>
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
                    <td>
                        <div className='d-flex align-items-center gap-2'>
                          <Avatar cliente={v.cliente} />
                          <span>{v.cliente}</span>
                        </div>
                      </td>
                    <td>{v.canal}</td>
                    <td>{v.metodo_pago}</td>
                    <td>{v.productos ? v.productos.length : 0} Productos</td>
                    <td className="fw-semibold text-ember-red">
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
    </div>
  );
}
