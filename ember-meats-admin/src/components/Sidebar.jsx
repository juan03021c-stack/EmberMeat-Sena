import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { path: '/productos', label: 'Productos', icon: 'bi-box-seam' },
  { path: '/ordenes', label: 'Ordenes', icon: 'bi-receipt' },
  { path: '/usuarios', label: 'Usuarios', icon: 'bi-people' },
  { path: '/reportes', label: 'Reportes', icon: 'bi-bar-chart' },
]

export default function Sidebar() {
  return (
    <div
      style={{
        width: 200,
        background: '#FFFFFF',
        minHeight: '100vh'
      }}
      className='d-flex flex-column'
    >

      {/* Logo */}
      <div className='p-3 mb-2'>
        <strong className='text-ember-dark'>EMBER MEATS</strong>

        <div style={{ fontSize: 10, color: '#888' }}>
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
              isActive ? { background: '#7B1F1F' } : {}
            }
          >
            <i className={`bi ${item.icon}`}></i>

            <span style={{ fontSize: 14 }}>
              {item.label}
            </span>
          </NavLink>
        ))}

      </nav>


      {/* SALIR */}
      <div
        style={{
          padding: '15px 10px 35px 10px',
          borderTop: '1px solid #AAAAAA'
        }}
      >
        <NavLink
          to='/home'
          className='primary-button text-decoration-none'
        >
          ← Salir
        </NavLink>
      </div>

    </div>
  )
}