import { BrowserRouter as Router, Routes, Route } from 'react-router-dom' 
import Sidebar from './components/Sidebar' 
import Dashboard from './pages/Dashboard' 
import Products  from './pages/Products' 
import Orders    from './pages/Orders' 
import Users     from './pages/Users' 
 
export default function App() { 
  return ( 
    <Router> 
      <div className='d-flex'> 
        <Sidebar /> 
        <div className='flex-grow-1' style={{ background: '#F5F3EE', minHeight: '100vh' }}> 
          <Routes> 
            <Route path='/'         element={<Dashboard />} /> 
            <Route path='/products' element={<Products />} /> 
            <Route path='/orders'   element={<Orders />} /> 
            <Route path='/users'    element={<Users />} /> 
          </Routes> 
        </div> 
      </div> 
    </Router> 
  ) }
