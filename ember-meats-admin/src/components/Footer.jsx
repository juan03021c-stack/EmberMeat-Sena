// Solo importa los de lucide que SÍ funcionan
import { MapPin, Phone, Mail, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className='footer-container' style={{ backgroundColor: '#1A1A18', color: '#9ca3af' }}>
            <div className="container py-5">
                <div className="row g-5">
                    {/* Brand */}
                    <div className="col-12 col-md-4">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <span className="footer-logo " >
                                EmberMeat
                            </span>
                        </div>
                        <p className="fs-6 lh-base">
                            Embutidos artesanales de Antioquia, elaborados con recetas tradicionales y materias primas de la más alta calidad.
                        </p>
                        <div className="d-flex gap-3 mt-4">
                            {/* Instagram SVG */}
                            <a href="#" className="footer-link" aria-label="Instagram">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                            </a>
                            {/* Facebook SVG */}
                            <a href="#" className="footer-link" aria-label="Facebook">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="col-12 col-md-4">
                        <h4 className="text-white mb-4 fs-6 fw-medium">Links rápidos</h4>
                        <ul className="list-unstyled fs-6">
                            <li className="mb-2">
                                <Link to="/" className="footer-link">Inicio</Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/catalogo" className="footer-link">Catálogo</Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/registro" className="footer-link">Crear cuenta</Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/login" className="footer-link">Iniciar sesión</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="col-12 col-md-4">
                        <h4 className="text-white mb-4 fs-6 fw-medium">Contacto</h4>
                        <ul className="list-unstyled fs-6">
                            <li className="d-flex align-items-center gap-2 mb-3">
                                <MapPin size={16} />
                                <span>Antioquia, Colombia</span>
                            </li>
                            <li className="d-flex align-items-center gap-2 mb-3">
                                <Phone size={16} />
                                <span>+57 300 000 0000</span>
                            </li>
                            <li className="d-flex align-items-center gap-2 mb-3">
                                <Mail size={16} />
                                <span>hola@embermeat.co</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="border-top footer-bottom px-4 py-3 text-center">
                <span style={{ fontSize: '0.75rem' }}>
                    © 2025 EmberMeat · Embert Meat S.A.S · Todos los derechos reservados
                </span>
            </div>
        </footer>
    );
}