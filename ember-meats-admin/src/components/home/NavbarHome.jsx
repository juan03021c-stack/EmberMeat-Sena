import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCarrito } from '../CarritoContext'

const links = [
    { href: '#inicio', label: 'Inicio', icon: 'bi-house', type: 'internal' },
    { href: '#productos', label: 'Productos', icon: 'bi-box-seam', type: 'internal' },
    { href: '#nosotros', label: 'Nosotros', icon: 'bi-info-circle', type: 'internal' },
    { to: '/catalogo', label: 'Catálogo', icon: 'bi-grid', type: 'external' },
    { to: '/login', label: 'Iniciar sesión', icon: 'bi-box-arrow-in-right', type: 'external' },
    { to: '/carrito', label: 'Carrito', icon: 'bi-cart3', type: 'external' },
]

export default function NavbarHome() {
    const location = useLocation()
    const navigate = useNavigate()
    const { cantidadTotal } = useCarrito()

    const isHome = location.pathname === '/' || location.pathname === ''

    // Un solo estado: solo tiene valor cuando estamos en la home
    const [activeHash, setActiveHash] = useState(
        isHome ? (location.hash || '#inicio') : ''
    )

    // Sincroniza el estado cuando cambia la URL (navegación, botones del navegador, etc.)
    useEffect(() => {
        if (isHome && location.hash) {
            setActiveHash(location.hash)
            const element = document.querySelector(location.hash)
            if (element) element.scrollIntoView({ behavior: 'smooth' })
        } else if (isHome) {
            setActiveHash('#inicio')
        } else {
            // No estamos en la home → ningún link interno activo
            setActiveHash('')
        }
    }, [location, isHome])

    // Click en link interno: si estamos en otra página, navegamos a la home primero
    const handleScroll = (e, href) => {
        e.preventDefault()
        setActiveHash(href)

        if (!isHome) {
            navigate('/' + href)          // ← va a /#inicio, /#productos, etc.
        } else {
            const element = document.querySelector(href)
            if (element) element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const getClassName = (isActive) =>
        `nav-link d-flex align-items-center gap-2 px-3 py-2 ${
            isActive ? 'text-white rounded' : 'text-secondary'
        }`

    const activeStyle = { background: '#7B1F1F' }

    return (
        <nav className="home-navbar">

            <div className="home-logo">
                <span>EmberMeat</span>
            </div>

            <div className="home-menu">
                {links.map((item) => {
                    const isInternal = item.type === 'internal'
                    const isCarrito = item.to === '/carrito'

                    /* ── Link interno ── */
                    if (isInternal) {
                        const isActive = activeHash === item.href   // solo activo si activeHash coincide
                        return (
                            <a
                                key={item.href}
                                href={item.href}
                                onClick={(e) => handleScroll(e, item.href)}
                                className={getClassName(isActive)}
                                style={isActive ? activeStyle : {}}
                            >
                                <i className={`bi ${item.icon}`} />
                                <span>{item.label}</span>
                            </a>
                        )
                    }

                    /* ── Link externo ── */
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => getClassName(isActive)}
                            style={({ isActive }) => (isActive ? activeStyle : {})}
                        >
                            <i className={`bi ${item.icon}`} />
                            <span>{item.label}</span>
                            {isCarrito && cantidadTotal > 0 && (
                                <span
                                    className="badge bg-danger rounded-pill ms-1"
                                    style={{ fontSize: '0.75rem', padding: '0.25em 0.6em' }}
                                >
                                    {cantidadTotal}
                                </span>
                            )}
                        </NavLink>
                    )
                })}
            </div>

        </nav>
    )
}



/* flujo visual 
Estás en /catalogo
  → location.pathname = "/catalogo"
  → isHome = false
  → useEffect → setActiveHash('')     ← ningún link interno activo
  → NavLink "/catalogo" isActive=true  ← solo "Catálogo" resaltado ✓

Clickeas "Inicio"
  → handleScroll(e, '#inicio')
  → e.preventDefault()
  → setActiveHash('#inicio')           ← "Inicio" se resalta de inmediato
  → !isHome → navigate('/#inicio')     ← navega a la home con hash
  → URL cambia a /#inicio
  → isHome = true
  → useEffect → setActiveHash('#inicio') + scroll suave
  → NavLink "/catalogo" isActive=false ← "Catálogo" ya no resaltado ✓
  → Solo "Inicio" resaltado ✓
*/