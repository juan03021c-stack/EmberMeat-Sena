
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CarritoProvider } from './components/CarritoContext'
import ProtectedRoute from './components/ProtectedRoute'

import Dashboard from './pages/Dashboard'
import Categorias from './pages/Categorias'
import Products from './pages/Products'
import Orders from './pages/Orders'
import MisPedidos from './pages/MisPedidos'
import Users from './pages/Users'
import Inicio from './pages/Inicio'
import ContentFooter from './components/footer/contentFooter'

import Login from './pages/Login'
import Carrito from './pages/Carrito'
import AdminLayout from './components/AdminLayout'
import AdminNavbarLayout from './components/home/AdminNavbarLayout'
import Catalogo from './pages/Catalogo'
import Ventas from './pages/Ventas'
import RespuestaPago from './pages/RespuestaPago'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'

export default function App() {
    return (
        <Router>
            <CarritoProvider>
                <ScrollToTop />

                <Routes>
                    {/* Páginas públicas de la tienda */}
                    <Route element={<AdminNavbarLayout />}>
                        <Route path="/" element={<Inicio />} />
                        <Route path="/carrito" element={<Carrito />} />
                        <Route path="/Catalogo" element={<Catalogo />} />
                        <Route
                            path="/respuesta-pago"
                            element={<RespuestaPago />}
                        />
                    </Route>

                    {/* Inicio de sesión */}
                    <Route element={<ContentFooter />}>
                        <Route path="/login" element={<Login />} />
                    </Route>

                    {/* Rutas administrativas protegidas */}
                    <Route element={<ProtectedRoute
                        rolesPermitidos={['administrador', 'vendedor', 'repartidor']}
                    />}>
                        <Route element={<AdminLayout />}>
                            {/* Solo administrador */}
                            <Route element={<ProtectedRoute
                                rolesPermitidos={['administrador']}
                            />}>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/categorias" element={<Categorias />} />
                                <Route path="/productos" element={<Products />} />
                                <Route path="/usuarios" element={<Users />} />
                            </Route>

                            {/* Administrador y vendedor */}
                            <Route element={<ProtectedRoute
                                rolesPermitidos={['administrador', 'vendedor']}
                            />}>
                                <Route path="/ventas" element={<Ventas />} />
                            </Route>

                            {/* Administrador y repartidor */}
                            <Route element={<ProtectedRoute
                                rolesPermitidos={['administrador', 'repartidor']}
                            />}>
                                <Route path="/ordenes" element={<Orders />} />
                                <Route path="/MisPedidos" element={<MisPedidos />} />
                            </Route>
                        </Route>
                    </Route>
                </Routes>
            </CarritoProvider>
        </Router>
    )
}
