import { Outlet } from "react-router"; 
import Sidebar from "./Sidebar";

function AdminLayout() {
    return (
        <div className="d-flex">
            <Sidebar />
            <div className="flex-grow-1" style={{ background: '#F5F3EE', minHeight: '100vh' }}>
                <Outlet />
            </div>
        </div>
    );
}

export default AdminLayout;