import { Outlet, Navigate, useLocation } from "react-router-dom";
import NavbarHome from "./NavbarHome";
import Footer from "../Footer";

export default function AdminNavbarLayout() {
    const location = useLocation();
    let rol = '';

    try {
        const sesion = localStorage.getItem('usuarioEmber');

        if (sesion) {
            const usuario = JSON.parse(sesion);
            rol = String(usuario?.rol_nombre || '').trim().toLowerCase();
        }
    } catch {
        rol = '';
    }

    // 1. El repartidor no tiene acceso a la tienda -> redirigir a sus pedidos
    if (rol === 'repartidor') {
        return <Navigate to="/MisPedidos" replace />;
    }

    // 2. El vendedor solo puede ver Catálogo y Carrito en las páginas públicas
    if (rol === 'vendedor') {
        const rutaActual = location.pathname.toLowerCase();
        const rutasPermitidas = ['/catalogo', '/carrito'];

        if (!rutasPermitidas.includes(rutaActual)) {
            return <Navigate to="/Catalogo" replace />;
        }
    }

    return (
        <div className="tienda-layout d-flex flex-column" style={{ minHeight: '100vh', width: '100%' }}>
            <NavbarHome />

            <main className="flex-grow-1" style={{ paddingTop: 'var(--navbar-height)', width: '100%' }}>
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}
