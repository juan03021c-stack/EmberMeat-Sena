
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CarritoProvider } from './components/CarritoContext'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Users from './pages/Users'
import Inicio from './pages/Inicio'
import ContentFooter from './components/footer/contentFooter'

import RegisterForm from './pages/Registrase'
import Login from './pages/Login'
import Carrito from './pages/Carrito'
import AdminLayout from './components/AdminLayout'
import AdminNavbarLayout from './components/home/AdminNavbarLayout'
import Catalogo from './pages/Catalogo'


export default function App() {
  return (
    <CarritoProvider>    <Router>
      <Routes>

        <Route element={<AdminNavbarLayout />}>
          <Route path="/" element={<Inicio />} />
           <Route path="/carrito" element={<Carrito />} />
           <Route path="/Catalogo" element={<Catalogo />} />
        </Route>
           
      


        <Route element={<ContentFooter />}>
          <Route path="/Registrarse" element={<RegisterForm />} />
          <Route path="/login" element={<Login />} />
        </Route>
        

        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/productos" element={<Products />} />
          <Route path="/ordenes" element={<Orders />} />
          <Route path="/usuarios" element={<Users />} />
        </Route>
      </Routes>

    </Router>
  </CarritoProvider>

  )
}
