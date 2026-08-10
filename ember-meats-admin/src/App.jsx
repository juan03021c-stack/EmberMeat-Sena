import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar' 
import Dashboard from './pages/Dashboard' 
import Products  from './pages/Products' 
import Orders    from './pages/Orders' 
import Users     from './pages/Users' 
import Login from "./pages/Login";
import Home from './pages/Home'
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

function AppContent() {
  const location = useLocation()

  const isLogin = location.pathname === '/login'

  return (
    <div className="d-flex">

      {!isLogin && <Sidebar />}

      <div
        className={isLogin ? 'w-100' : 'flex-grow-1'}
        style={{
          background: '#F5F3EE',
          minHeight: '100vh'
        }}
      >

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/users" element={<Users />} />
          <Route path="/home" element={<Home />} />
        </Routes>

      </div>

    </div>
  )
}