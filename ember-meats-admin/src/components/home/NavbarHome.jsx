
import { NavLink, useLocation } from 'react-router-dom'
import { useState,useEffect } from 'react'

const internalLinks = [
    { href: '#inicio', label: 'Inicio', icon: 'bi-house' },
    { href: '#productos', label: 'Productos', icon: 'bi-box-seam' },
    { href: '#nosotros', label: 'Nosotros', icon: 'bi-info-circle' },
]

const externalLinks = [
    { to: '/catalogo', label: 'Catálogo', icon: 'bi-grid' },
    { to: '/login', label: 'Iniciar sesión', icon: 'bi-box-arrow-in-right' },
    { to: '/Registrarse', label: 'Registrarse', icon: 'bi-person-plus' },
]

export default function NavbarHome() {
    const location = useLocation()
    const [activeHash, setActiveHash] = useState(location.hash || '#inicio')

    // Hace scroll suave cuando la URL tiene un hash (#nosotros, #productos)
    useEffect(() => {
        if (location.hash) {
            const element = document.querySelector(location.hash)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
            }
        }
    }, [location.hash])

    const handleScroll = (e, href) => {
        e.preventDefault()
        setActiveHash(href)
        const element = document.querySelector(href)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
            
        }
    }

    return (
        <nav className="home-navbar">

            {/* LOGO */}
            <div className="home-logo">
                <span>EmberMeat</span>
            </div>

            {/* MENU CENTRAL — Links internos (scroll) */}
            <div className="home-menu">
                {internalLinks.map((item) => {
                    const isActive = activeHash === item.href
                    return (    
                    <a
                        key={item.href}
                        href={item.href}
                        onClick={(e) => handleScroll(e, item.href)}
                       className={`nav-link d-flex align-items-center gap-2 px-3 py-2 ${
                                isActive ? 'text-white rounded' : 'text-secondary'
                            }`}
                            style={isActive ? { background: '#7B1F1F' } : {}}
                        >
                            <i className={`bi ${item.icon}`}></i>
                            <span>{item.label}</span>
                        </a>
                )
            })}
            </div>

            {/* LINKS EXTERNOS — NavLink (cambio de página) */}
            <div className="home-register">
                {externalLinks.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                       className={({ isActive }) =>
                            `nav-link d-flex align-items-center gap-2 px-3 py-2 ${
                                isActive
                                    ? 'text-white rounded'
                                    : 'text-secondary'
                            }`
                        }
                        style={({ isActive }) =>
                            isActive
                                ? { background: '#7B1F1F' }
                                : {}
                        }
                    >
                        <i className={`bi ${item.icon}`}></i>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>

        </nav>
    )
}

