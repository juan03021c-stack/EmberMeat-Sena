import { Outlet, Navigate } from "react-router-dom";
import NavbarHome from "./NavbarHome";
import Footer from "../Footer";

export default function AdminNavbarLayout() {
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

    if (rol === 'repartidor') {
        return <Navigate to="/MisPedidos" replace />;
    }

    return (
        <div className="admin-layout" style={{ minHeight: '100vh' }}>
            <NavbarHome />
           <main style={{ paddingTop: 'var(--navbar-height)' }}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
