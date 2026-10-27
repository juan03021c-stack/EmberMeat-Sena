import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { path: '/productos', label: 'Productos', icon: 'bi-box-seam' },
  { path: '/categorias', label: 'Categorias', icon: 'bi-box-seam' },
  { path: '/ordenes', label: 'Ordenes', icon: 'bi-receipt' },
  { path: '/usuarios', label: 'Usuarios', icon: 'bi-people' },
  { path: '/ventas', label: 'Ventas', icon: 'bi-cash-coin' },
  { path: '/reportes', label: 'Reportes', icon: 'bi-bar-chart' },
]

export default function Sidebar() {
  return (
    <div
      style={{
        width: 200,
        background: 'var(--ember-white)',
        minHeight: '100vh',
        borderRight: '1px solid var(--ember-border)'
      }}
      className='d-flex flex-column'
    >

      {/* Logo */}
      <div className='p-3 mb-2'>
        <strong className='text-ember-dark'>EMBER MEATS</strong>

        <div style={{ fontSize: 'var(--text-micro)', color: 'var(--ember-text-muted)' }}>
          ADMIN PANEL
        </div>
      </div>


      {/* Nav links */}
      <nav className='flex-grow-1'>

        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              'nav-link d-flex align-items-center gap-2 px-3 py-2 ' +
              (isActive
                ? 'text-white rounded mx-2'
                : 'text-secondary')
            }
            style={({ isActive }) =>
              isActive ? { background: 'var(--ember-red)' } : {}
            }
          >
            <i className={`bi ${item.icon}`}></i>

            <span style={{ fontSize: 'var(--text-body-sm)' }}>
              {item.label}
            </span>
          </NavLink>
        ))}

      </nav>


      {/* SALIR */}
      <div
        style={{
          padding: '15px 10px 35px 10px',
          borderTop: '1px solid var(--ember-border)'
        }}
      >
        <NavLink
          to='/'
          className='btn btn-ember text-decoration-none w-100'
        >
          ← Salir
        </NavLink>
      </div>

    </div>
  )
}