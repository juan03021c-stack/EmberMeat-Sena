import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CarritoProvider } from './components/CarritoContext'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Users from './pages/Users'
import Inicio from './pages/Inicio'
import ContentFooter from './components/footer/contentFooter'

import Login from './pages/Login'
import Carrito from './pages/Carrito'
import AdminLayout from './components/AdminLayout'
import AdminNavbarLayout from './components/home/AdminNavbarLayout'
import Catalogo from './pages/Catalogo'
import Ventas from './pages/Ventas'
import RespuestaPago from './pages/RespuestaPago'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'


export default function App() {
  return (
    <>
      <Router>
        <CarritoProvider>
          <ScrollToTop />

          <Routes>

            <Route element={<AdminNavbarLayout />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/Catalogo" element={<Catalogo />} />
            <Route path="/respuesta-pago" element={<RespuestaPago />} />
          </Route>
        
            
        


          <Route element={<ContentFooter />}>
            <Route path="/login" element={<Login />} />
          </Route>
          

          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/productos" element={<Products />} />
            <Route path="/ordenes" element={<Orders />} />
            <Route path="/usuarios" element={<Users />} />
            <Route path="/ventas" element={<Ventas />} />
          </Route>
        </Routes>

        <ScrollToTop />
      </CarritoProvider>
    </Router>
</>
  )
}