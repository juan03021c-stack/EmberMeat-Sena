
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ rolesPermitidos = [] }) {
    const location = useLocation();
    let usuario;

    try {
        const sesion = localStorage.getItem('usuarioEmber');

        if (!sesion) {
            return (
                <Navigate
                    to="/login"
                    replace
                    state={{ from: location }}
                />
            );
        }

        usuario = JSON.parse(sesion);

    } catch {
        localStorage.removeItem('usuarioEmber');

        return <Navigate to="/login" replace />;
    }

    // Verificar que la sesión tenga la estructura esperada
    if (
        !usuario ||
        typeof usuario !== 'object' ||
        !usuario.rol_nombre
    ) {
        localStorage.removeItem('usuarioEmber');
        return <Navigate to="/login" replace />;
    }

    // Normalizar el rol
    const rol = String(usuario.rol_nombre)
        .trim()
        .toLowerCase();

    // Verificar permisos
    const roles = rolesPermitidos.map(r =>
        String(r).trim().toLowerCase()
    );

    if (roles.length > 0 && !roles.includes(rol)) {
        const rutaRedireccion =
            rol === 'repartidor'
                ? '/MisPedidos'
                : rol === 'vendedor'
                ? '/ventas'
                : rol === 'administrador'
                ? '/dashboard'
                : '/login';
        return <Navigate to={rutaRedireccion} replace />;
    }

    // Usuario autorizado
    return <Outlet />;
}
