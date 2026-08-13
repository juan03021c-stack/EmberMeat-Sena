import { Outlet } from "react-router";
import NavbarHome from "./NavbarHome";

export default function AdminNavbarLayout() {
    return (
        <div className="admin-layout" style={{ minHeight: '100vh' }}>
            <NavbarHome />
            <main style={{ paddingTop: '70px' }}>
                <Outlet />
            </main>
        </div>
    )
}
