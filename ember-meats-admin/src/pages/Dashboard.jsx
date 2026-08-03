import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { StatusBadge } from '../components/StatusBadge'
import { salesData, initialOrders } from '../data/mockData'

function StatCard({ icon, label, value, badge, alert }) {
    return (
        <div className='card border-0 h-100' style={{ borderRadius: 12 }}>
            <div className='card-body'>
                <div className='d-flex justify-content-between align-items-start mb-2'>
                    <div className='p-2 rounded' style={{ background: '#FDF0ED' }}>
                        <i className={`bi ${icon} fs-5`} style={{ color: '#7B1F1F' }}></i>
                    </div>
                    {badge && (
                        <span className='text-success small'>
                            <i className='bi bi-arrow-up-right'></i> {badge}
                        </span>
                    )}
                    {alert && (
                        <span className='text-warning small'>
                            <i className='bi bi-exclamation-triangle'></i> se requiere acciones 
                        </span>
                    )}
                </div>
                <h4 className='mb-0 fw-bold'>{value}</h4>
                <small className='text-muted'>{label}</small>
            </div>
        </div>
    )
}

export default function Dashboard() {
    const [orders] = useState(initialOrders)

    return (
        <div className='p-4'>
            <h4 className='mb-4'>Dashboard</h4>

            {/* Stats Cards */}
            <div className='row g-3 mb-4'>
                <div className='col-md-3'>
                    <StatCard icon='bi-graph-up' label='Total Revenue'
                        value='$3,420 CAD' badge='+12%' />
                </div>
                <div className='col-md-3'>
                    <StatCard icon='bi-clipboard' label='Total Orders'
                        value='128' badge='+8%' />
                </div>
                <div className='col-md-3'>
                    
                    <StatCard icon='bi-people' label='Registered Users'
                        value='84' badge='+5%' />
                </div>
                <div className='col-md-3'>
                    <StatCard icon='bi-exclamation-triangle' label='Low Stock Alerts'
                        value='0 products' alert />
                </div>
            </div>

            {/* Chart */}
            <div className='card border-0 p-3 mb-4'>
                <h6 className='mb-3'>Sales — Last 30 Days</h6>
                <ResponsiveContainer width='100%' height={300}>
                    <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#eee' />
                        <XAxis dataKey='date' tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line
                            type='monotone'
                            dataKey='sales'
                            stroke='#7B1F1F'
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#7777' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Recent Orders */}
            <div className='card border-0 p-3'>
                <div className='d-flex justify-content-between mb-3'>
                    <h6 className='mb-0'>Recent Orders</h6>
                    <a href='/orders' className='text-danger small'>View All</a>
                </div>
                <table className='table table-hover'>
                    <thead style={{
                        background: '#F5F3EE', fontSize: 11,
                        textTransform: 'uppercase', letterSpacing: '.05em'
                    }}>
                        <tr>
                            <th>Order #</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.slice(0, 5).map(o => (
                            <tr key={o.id}>
                                <td className='text-danger fw-medium'>{o.id}</td>
                                <td>{o.customer}</td>
                                <td>{o.date}</td>
                                <td>{o.total}</td>
                                <td><StatusBadge status={o.status} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

