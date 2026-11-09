import { useEffect, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { obtenerReporteMensual } from '../services/Api';

const pesos = (valor) =>
    Number(valor || 0).toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    });

const nombreEstado = (estado) =>
    String(estado || '').replace(/_/g, ' ').replace(/^\w/, (l) => l.toUpperCase());

/* Tabla simple: columnas = [{ titulo, valor: (fila) => contenido }] */
function Tabla({ titulo, columnas, filas, vacio }) {
    return (
        <section className='card p-3 mb-3 reporte-seccion'>
            <h6 className='fw-bold mb-3'>{titulo}</h6>
            {filas.length === 0 ? (
                <p className='text-muted mb-0'>{vacio}</p>
            ) : (
                <div className='table-responsive'>
                    <table className='table table-sm align-middle mb-0'>
                        <thead>
                            <tr>
                                {columnas.map((c) => <th key={c.titulo}>{c.titulo}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {filas.map((fila, i) => (
                                <tr key={i}>
                                    {columnas.map((c) => <td key={c.titulo}>{c.valor(fila)}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

export default function ReporteMensual() {
    const [params, setParams] = useSearchParams();
    const mes = params.get('mes') || new Date().toISOString().slice(0, 7);
    const [reporte, setReporte] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelado = false;
        obtenerReporteMensual(mes)
            .then((datos) => { if (!cancelado) { setReporte(datos); setError(null); } })
            .catch((err) => { if (!cancelado) setError(err.message); });
        return () => { cancelado = true; };
    }, [mes]);

    const tituloMes = new Date(`${mes}-01T12:00:00`).toLocaleString('es-CO', { month: 'long', year: 'numeric' });

    if (error) return <div className='p-4'><div className='alert alert-danger'>{error}</div></div>;
    if (!reporte) return <div className='p-4 text-muted'>Generando reporte...</div>;

    const pedidos = reporte.pedidosPorEstado;
    const totalPedidos = pedidos.reduce((s, p) => s + Number(p.cantidad), 0);
    const cantidadVentas = Number(reporte.ventas.cantidad);
    const ingresos = Number(reporte.ventas.total);

    return (
        <div className='p-4 reporte'>
            {/* Controles: no salen en el PDF */}
            <div className='d-flex flex-wrap gap-2 align-items-center mb-4 no-imprimir'>
                <NavLink to='/dashboard' className='btn ember-btn-terciario'>Volver</NavLink>
                <input
                    type='month'
                    className='form-control w-auto'
                    value={mes}
                    onChange={(e) => e.target.value && setParams({ mes: e.target.value })}
                    aria-label='Mes del reporte'
                />
                <button type='button' className='btn btn-ember' onClick={() => window.print()}>
                    <i className='bi bi-file-earmark-pdf me-1'></i>
                    Descargar PDF
                </button>
            </div>

            <header className='mb-4'>
                <h3 className='fw-bold mb-1'>EmberMeat · Reporte administrativo</h3>
                <p className='text-muted mb-0'>
                    <span className='text-capitalize'>{tituloMes}</span> · generado el {new Date().toLocaleString('es-CO')}
                </p>
            </header>

            <div className='row g-3 mb-3'>
                {[
                    ['Ingresos (ventas pagadas)', pesos(ingresos)],
                    ['Ventas registradas', cantidadVentas],
                    ['Ticket promedio', pesos(cantidadVentas ? ingresos / cantidadVentas : 0)],
                    ['Pedidos del mes', totalPedidos],
                ].map(([etiqueta, valor]) => (
                    <div className='col-6 col-md-3' key={etiqueta}>
                        <div className='card p-3 h-100 reporte-seccion'>
                            <small className='text-muted'>{etiqueta}</small>
                            <strong className='fs-5'>{valor}</strong>
                        </div>
                    </div>
                ))}
            </div>

            <Tabla
                titulo='Pedidos por estado'
                vacio='No hubo pedidos este mes.'
                filas={pedidos}
                columnas={[
                    { titulo: 'Estado', valor: (f) => nombreEstado(f.estado) },
                    { titulo: 'Pedidos', valor: (f) => f.cantidad },
                    { titulo: 'Valor', valor: (f) => pesos(f.total) },
                ]}
            />

            <Tabla
                titulo='Productos más vendidos'
                vacio='No hubo ventas este mes.'
                filas={reporte.productosTop}
                columnas={[
                    { titulo: 'Producto', valor: (f) => f.nombre },
                    { titulo: 'Unidades', valor: (f) => f.cantidad },
                    { titulo: 'Total', valor: (f) => pesos(f.total) },
                ]}
            />

            <Tabla
                titulo='Ventas por vendedor'
                vacio='No hubo ventas este mes.'
                filas={reporte.ventasPorVendedor}
                columnas={[
                    { titulo: 'Vendedor', valor: (f) => f.vendedor },
                    { titulo: 'Ventas', valor: (f) => f.cantidad },
                    { titulo: 'Total', valor: (f) => pesos(f.total) },
                ]}
            />

            <Tabla
                titulo='Repartidores'
                vacio='No hay repartidores registrados.'
                filas={reporte.entregas}
                columnas={[
                    { titulo: 'Repartidor', valor: (f) => f.repartidor + (Number(f.activo) === 1 ? '' : ' (inactivo)') },
                    { titulo: 'Entregas exitosas', valor: (f) => f.exitosas },
                    { titulo: 'Intentos fallidos', valor: (f) => f.fallidas },
                    { titulo: 'En camino ahora', valor: (f) => f.en_camino },
                ]}
            />

            <Tabla
                titulo='Usuarios por rol'
                vacio='No hay usuarios.'
                filas={reporte.usuariosPorRol}
                columnas={[
                    { titulo: 'Rol', valor: (f) => nombreEstado(f.rol) },
                    { titulo: 'Total', valor: (f) => f.total },
                    { titulo: 'Nuevos este mes', valor: (f) => Number(f.nuevos || 0) },
                    { titulo: 'Inactivos', valor: (f) => Number(f.inactivos || 0) },
                ]}
            />

            <Tabla
                titulo='Inventario por categoría (al día de hoy)'
                vacio='No hay productos.'
                filas={reporte.inventario}
                columnas={[
                    { titulo: 'Categoría', valor: (f) => f.categoria },
                    { titulo: 'Productos', valor: (f) => f.productos },
                    { titulo: 'Activos', valor: (f) => f.activos },
                    { titulo: 'Unidades', valor: (f) => f.unidades },
                    { titulo: 'Valor en inventario', valor: (f) => pesos(f.valor) },
                ]}
            />

            <Tabla
                titulo='Productos con stock bajo (5 o menos, al día de hoy)'
                vacio='Ningún producto tiene stock bajo.'
                filas={reporte.stockBajo}
                columnas={[
                    { titulo: 'Producto', valor: (f) => f.nombre },
                    { titulo: 'Unidades', valor: (f) => f.stock },
                ]}
            />
        </div>
    );
}
