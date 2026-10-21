
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerEstadisticas } from '../services/Api';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { StatusBadge } from '../components/StatusBadge';

function StatCard({ icon, label, value, badge, alert }) {
    return (
        <div className='card h-100'>
            <div className='card-body'>
                <div className='d-flex justify-content-between align-items-start mb-2'>
                    <div
                        className='p-2 rounded'
                        style={{ background: 'rgba(123, 31, 31, 0.08)' }}
                    >
                        <i className={`bi ${icon} fs-5 text-ember-red`}></i>
                    </div>

                    {badge && (
                        <span className='text-success small'>
                            <i className='bi bi-arrow-up-right'></i> {badge}
                        </span>
                    )}

                    {alert && (
                        <span className='text-danger small'>
                            <i className='bi bi-exclamation-triangle'></i>{' '}
                            Se requieren acciones
                        </span>
                    )}
                </div>

                <h4 className='mb-0 fw-bold'>{value}</h4>
                <small className='text-muted'>{label}</small>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const [estadisticas, setEstadisticas] = useState({
        totalVentas: 0,
        pedidos: 0,
        productos: 0,
        usuarios: 0,
        pendientes: 0,
        enviados: 0,
        entregados: 0,
        stockBajo: 0
    });

    const [ventasPorDia, setVentasPorDia] = useState([]);
    const [pedidosRecientes, setPedidosRecientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelado = false;

        async function cargarEstadisticas() {
            try {
                setLoading(true);
                setError(null);

                const data = await obtenerEstadisticas();

                if (cancelado) return;

                if (!data || data.success !== true) {
                    throw new Error(
                        data?.mensaje ||
                        'La respuesta de la API no es válida.'
                    );
                }

                // Admite estadísticas anidadas o en el nivel principal.
                const stats = data.estadisticas ?? data;

                setEstadisticas({
                    totalVentas: Number(stats.totalVentas ?? 0),
                    pedidos: Number(stats.pedidos ?? 0),
                    productos: Number(stats.productos ?? 0),
                    usuarios: Number(stats.usuarios ?? 0),
                    pendientes: Number(stats.pendientes ?? 0),
                    enviados: Number(stats.enviados ?? 0),
                    entregados: Number(stats.entregados ?? 0),
                    stockBajo: Number(stats.stockBajo ?? 0)
                });

                setVentasPorDia(
                    Array.isArray(data.ventasPorDia)
                        ? data.ventasPorDia
                        : []
                );

                setPedidosRecientes(
                    Array.isArray(data.pedidosRecientes)
                        ? data.pedidosRecientes
                        : []
                );
            } catch (error) {
                if (!cancelado) {
                    setError(
                        error.message ||
                        'Error al cargar el Dashboard.'
                    );
                }
            } finally {
                if (!cancelado) {
                    setLoading(false);
                }
            }
        }

        cargarEstadisticas();

        return () => {
            cancelado = true;
        };
    }, []);

    // Estado de carga
    if (loading) {
        return (
            <div className='p-5 text-center text-muted'>
                <span className='spinner-border spinner-border-sm text-ember-red me-2' />
                Cargando estadísticas...
            </div>
        );
    }

    // Estado de error
    if (error) {
        return (
            <div className='p-4'>
                <div className='alert alert-danger' role='alert'>
                    <i className='bi bi-exclamation-circle me-2'></i>
                    {error}

                    <button
                        type='button'
                        className='btn btn-outline-danger btn-sm ms-3'
                        onClick={() => window.location.reload()}
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='p-4'>
            <h4 className='mb-4 fw-bold'>Dashboard</h4>

            {/* Stats Cards */}
            <div className='row g-3 mb-4'>
                <div className='col-md-3'>
                    <StatCard
                        icon='bi-graph-up'
                        label='Ingresos totales'
                        value={estadisticas.totalVentas.toLocaleString(
                            'es-CO',
                            {
                                style: 'currency',
                                currency: 'COP',
                                maximumFractionDigits: 0
                            }
                        )}
                    />
                </div>

                <div className='col-md-3'>
                    <StatCard
                        icon='bi-clipboard'
                        label='Ordenes totales'
                        value={estadisticas.pedidos}
                    />
                </div>

                <div className='col-md-3'>
                    <StatCard
                        icon='bi-people'
                        label='Usuarios registrados'
                        value={estadisticas.usuarios}
                    />
                </div>

                <div className='col-md-3'>
                    <StatCard
                        icon='bi-exclamation-triangle'
                        label='Alertas de stock bajo'
                        value={estadisticas.stockBajo}
                        alert
                    />
                </div>
            </div>

            {/* Chart */}
            <div className='card p-3 mb-4'>
                <h6 className='mb-3 fw-bold'>
                    Ventas — Últimos 30 Días
                </h6>

                {ventasPorDia.length > 0 ? (
                    <ResponsiveContainer width='100%' height={300}>
                        <LineChart data={ventasPorDia}>
                            <CartesianGrid
                                strokeDasharray='3 3'
                                stroke='var(--ember-border)'
                            />

                            <XAxis
                                dataKey='date'
                                tick={{
                                    fontSize: 12,
                                    fill: 'var(--ember-text-secondary)'
                                }}
                            />

                            <YAxis
                                tick={{
                                    fontSize: 12,
                                    fill: 'var(--ember-text-secondary)'
                                }}
                            />

                            <Tooltip
                                formatter={(value) => [
                                    Number(value).toLocaleString('es-CO', {
                                        style: 'currency',
                                        currency: 'COP',
                                        maximumFractionDigits: 0
                                    }),
                                    'Ventas'
                                ]}
                            />

                            <Line
                                type='monotone'
                                dataKey='sales'
                                stroke='#7B1F1F'
                                strokeWidth={2}
                                dot={{
                                    r: 4,
                                    fill: '#7B1F1F'
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className='text-center text-muted py-5'>
                        No hay datos de ventas para mostrar.
                    </div>
                )}
            </div>

            {/* Recent Orders */}
            <div className='card p-3'>
                <div className='d-flex justify-content-between mb-3 align-items-center'>
                    <h6 className='mb-0 fw-bold'>
                        Ordenes recientes
                    </h6>

                    <Link
                        to='/ordenes'
                        className='text-ember-red text-decoration-none small fw-medium'
                    >
                        Ver todas
                    </Link>
                </div>

                <div className='table-responsive'>
                    <table className='table table-hover align-middle'>
                        <thead>
                            <tr>
                                <th>Ordenes#</th>
                                <th>Cliente</th>
                                <th>Fecha</th>
                                <th>Total</th>
                                <th>Estado</th>
                            </tr>
                        </thead>

                        <tbody>
                            {pedidosRecientes.length > 0 ? (
                                pedidosRecientes.slice(0, 5).map((o) => (
                                    <tr key={o.id}>
                                        <td className='text-ember-red fw-semibold'>
                                            {o.id}
                                        </td>

                                        <td>{o.customer}</td>

                                        <td className='text-muted small'>
                                            {o.date}
                                        </td>

                                        <td className='fw-medium'>
                                            {Number(o.total).toLocaleString(
                                                'es-CO',
                                                {
                                                    style: 'currency',
                                                    currency: 'COP',
                                                    maximumFractionDigits: 0
                                                }
                                            )}
                                        </td>

                                        <td>
                                            <StatusBadge status={o.status} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan='5'
                                        className='text-center text-muted py-4'
                                    >
                                        No hay pedidos recientes.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
