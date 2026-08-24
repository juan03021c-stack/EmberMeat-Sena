
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Users from './pages/Users'
import Inicio from './pages/Inicio'

import RegisterForm from './pages/Registrase'
import Login from './pages/Login'
import AdminLayout from './components/AdminLayout'
import AdminNavbarLayout from './components/home/AdminNavbarLayout'

export default function App() {
  return (
    <Router>
      <Routes>

        <Route element={<AdminNavbarLayout />}>
          <Route path="/" element={<Inicio />} />
          {/* <Route path="/Nosotros" element={<Nosotros/>} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/Registrarse" element={<RegisterForm />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/productos" element={<Products />} />
          <Route path="/ordenes" element={<Orders />} />
          <Route path="/usuarios" element={<Users />} />
        </Route>
      </Routes>

    </Router>
  )
}
