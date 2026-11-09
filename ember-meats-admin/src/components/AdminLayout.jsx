import { Outlet } from "react-router";
import Sidebar from "./Sidebar";

function AdminLayout() {
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