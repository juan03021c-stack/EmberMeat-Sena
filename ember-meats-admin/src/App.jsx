import { BrowserRouter as Router, Routes, Route } from 'react-router-dom' 
import Dashboard from './pages/Dashboard' 
import Products  from './pages/Products' 
import Orders    from './pages/Orders' 
import Users     from './pages/Users' 
import Login     from './pages/Login'  

import AdminLayout from './components/AdminLayout'  
 
export default function App() { 
  return ( 
    <Router> 
      
          <Routes> 

            <Route path='/'    element={<Login />} />

            <Route element={<AdminLayout />}>

              <Route path='/dashboard'   element={<Dashboard />} /> 
              <Route path='/productos' element={<Products />} /> 
              <Route path='/ordenes'   element={<Orders />} /> 
              <Route path='/usuarios'    element={<Users />} />
                
              
            </Route>
           
          </Routes> 
    </Router> 
  ) }
