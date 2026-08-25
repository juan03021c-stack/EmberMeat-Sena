import { Outlet } from "react-router"
import Footer from "../Footer"

export default function ContentFooter() {
    return (
        <div>
            <main style={{ minHeight: '100vh' }}>
                <Outlet />
            </main>
            <div style={{ marginTop: '100px' }}>
                <Footer />
            </div>
        </div>
    )
}   