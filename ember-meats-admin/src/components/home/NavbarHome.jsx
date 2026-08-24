import { NavLink} from 'react-router-dom'

const navItems = [
    { path: '/', label: 'Inicio', icon: 'bi-house' },
    { path: '/login', label: 'Iniciar sesión', icon: 'bi-box-arrow-in-right' },
]

export default function NavbarHome() {
    return (
        <nav className="home-navbar">

            {/* LOGO */}
            <div className="home-logo">
                <span>EmberMeat</span>
            </div>

            {/* MENU CENTRAL */}
            <div className="home-menu">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/home'}
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

            {/* REGISTRARSE */}
            <div className="home-register">
                <NavLink
                    to="/Registrarse"
                    className="link-navbar d-flex align-items-center gap-2 px-3 py-2"
                >
                    <i className="bi bi-person-plus"></i>
                    <span>Registrarse</span>
                </NavLink>

                <NavLink
                    to="/login"
                    className="link-navbar d-flex align-items-center gap-2 px-3 py-2"
                >
                    <i className="bi bi-person-plus"></i>
                    <span>Iniciar Sesión</span>
                </NavLink>
            </div>

        </nav>
    )
}