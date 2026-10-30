import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2', roles: ['administrador'] },
  { path: '/productos', label: 'Productos', icon: 'bi-box-seam', roles: ['administrador'] },
  { path: '/categorias', label: 'Categorías', icon: 'bi-tag', roles: ['administrador'] },
  { path: '/ordenes', label: 'Órdenes', icon: 'bi-receipt', roles: ['administrador', 'repartidor'] },
  { path: '/usuarios', label: 'Usuarios', icon: 'bi-people', roles: ['administrador'] },
  { path: '/ventas', label: 'Ventas', icon: 'bi-cash-coin', roles: ['administrador', 'vendedor'] },
  { path: '/MisPedidos', label: 'Mis Pedidos', icon: 'bi-receipt', roles: ['administrador','repartidor'] },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    try {
      const sesion = localStorage.getItem('usuarioEmber')
      if (sesion) {
        setUsuario(JSON.parse(sesion))
      }
    } catch {
      setUsuario(null)
    }
  }, [])

  const rolUsuario = String(usuario?.rol_nombre || '').toLowerCase()

  // Filtrar links según el rol del usuario autenticado
  const linksVisibles = navItems.filter(item =>
    !item.roles || item.roles.includes(rolUsuario)
  )

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuarioEmber')
    navigate('/login', { replace: true })
  }

  return (
    <div
      style={{
        width: 210,
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
        {linksVisibles.map(item => (
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

      {/* Información del usuario y botón de cerrar sesión */}
      <div
        style={{
          padding: '15px 12px 25px 12px',
          borderTop: '1px solid var(--ember-border)'
        }}
      >
        {usuario && (
          <div className='mb-3 px-1'>
            <div className='fw-semibold text-truncate' style={{ fontSize: 'var(--text-body-sm)' }}>
              {usuario.nombre}
            </div>
            <span
              className='badge bg-danger bg-opacity-10 text-danger text-capitalize mt-1'
              style={{ fontSize: 'var(--text-micro)' }}
            >
              {usuario.rol_nombre}
            </span>
          </div>
        )}

        <NavLink
          to='/'
          className='btn btn-outline-secondary btn-sm w-100 mb-2 d-flex align-items-center justify-content-center gap-1'
          style={{ fontSize: 'var(--text-body-sm)' }}
        >
          <i className='bi bi-shop'></i>
          <span>Ver tienda</span>
        </NavLink>

        <button
          type='button'
          onClick={handleCerrarSesion}
          className='btn btn-ember btn-sm w-100 d-flex align-items-center justify-content-center gap-1'
          style={{ fontSize: 'var(--text-body-sm)' }}
        >
          <i className='bi bi-box-arrow-right'></i>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}