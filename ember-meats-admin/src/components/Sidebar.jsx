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
    <div style={{ width: 200, background: '#000000', minHeight: '100vh' }}
      //'#1A0A0A' rojo oscuro
      className='d-flex flex-column'>
      {/* Logo */}
      <div className='p-3 mb-2'>
        <strong className='text-white'>EMBER MEATS</strong>
        <div style={{ fontSize: 10, color: '#888' }}>ADMIN PANEL</div>
      </div>

      {/* Nav links */}
      <nav className='flex-grow-1'>
        {navItems.map(item => (
          <NavLink key={item.path}
            // clave unique para cada enlace de navegación
            to={item.path}
            // a donde se dirige el enlace
            end={item.path === '/'}
            // si el enlace está activo
            className={({ isActive }) =>
              'nav-link d-flex align-items-center gap-2 px-3 py-2 ' +
              (isActive
                ? 'text-white rounded mx-2'
                : 'text-secondary')
            }
            style={({ isActive }) =>
              isActive ? { background: '#7B1F1F' } : {}
            }>
            <i className={`bi ${item.icon}`}></i>
            <span style={{ fontSize: 14 }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className='p-3 border-top' style={{ borderColor: '#333 !important' }}>
        <NavLink to='/' className='nav-link text-secondary small'>
          ← Volver a la Tiendoa
        </NavLink>
        <button className='btn btn-link nav-link text-secondary small p-0 mt-1'>
          Salir
        </button>
      </div>
    </div>
  )
}
