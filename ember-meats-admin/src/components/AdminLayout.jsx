import { useEffect } from "react";
import { Outlet } from "react-router";
import Swal from "sweetalert2";
import Sidebar from "./Sidebar";

function AdminLayout() {
    useEffect(() => {
        const usuario = JSON.parse(localStorage.getItem("usuarioEmber"));

        Swal.fire({
            icon: "success",
            title: "¡Bienvenido al panel!",
            text: `Hola${usuario?.nombre ? `, ${usuario.nombre}` : ""}. Ya puedes comenzar a trabajar.`,
            confirmButtonText: "Continuar",
            confirmButtonColor: "#7B1F1F",
        });
    }, []);

    return (
        <div className="admin-layout d-flex">
            <Sidebar />
            <div className="flex-grow-1" style={{ background: 'var(--ember-cream)', minHeight: '100vh', minWidth: 0 }}>
                <Outlet />
            </div>
        </div>
    );
}

export default AdminLayout;