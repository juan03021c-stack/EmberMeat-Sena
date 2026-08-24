import { Outlet } from "react-router-dom";
import NavbarHome from "./NavbarHome";
import Footer from "../Footer";

export default function AdminNavbarLayout() {
    return (
        <div className="admin-layout" style={{ minHeight: '100vh' }}>
            <NavbarHome />
           <main style={{ paddingTop: 'var(--navbar-height)' }}>
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}
