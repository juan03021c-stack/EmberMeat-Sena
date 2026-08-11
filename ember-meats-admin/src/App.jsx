import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Users from './pages/Users'
import Login from './pages/Login'
import Home from './pages/Home'

function AdminLayout({ children }) {
  return (
    <div className="d-flex">
      <Sidebar />

      <div
        className="flex-grow-1"
        style={{
          background: '#F5F3EE',
          minHeight: '100vh'
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>

        <Route path="/home" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          }
        />

        <Route
          path="/products"
          element={
            <AdminLayout>
              <Products />
            </AdminLayout>
          }
        />

        <Route
          path="/orders"
          element={
            <AdminLayout>
              <Orders />
            </AdminLayout>
          }
        />

        <Route
          path="/users"
          element={
            <AdminLayout>
              <Users />
            </AdminLayout>
          }
        />

      </Routes>
    </Router>
  )
}

