// Productos
export const products = [
    { id: 1, Nombre: 'Smoked Duck Salami', Categoria: 'Salami', Precio: 18.99, stock: 24 },
    { id: 2, Nombre: 'Québec Chorizo Rouge', Categoria : 'Chorizo', Precio: 16.50, stock: 18 },
    { id: 3, Nombre: 'Artisan Prosciutto', Categoria: 'Prosciutto', Precio: 26.99, stock: 10 },
    { id: 4, Nombre: 'Smoked Toulouse Sausage', Categoria : 'Smoked Sausages', Precio: 14.25, stock: 0 },
    { id: 5, Nombre: 'Wild Boar Salami', Categoria: 'Salami', Precio: 32.00, stock: 8 },
    { id: 6, Nombre: 'Smoked Lamb Merguez', Categoria: 'Smoked Sausages', Precio: 19.75, stock: 15 },
    { id: 7, Nombre: 'Dried Beef Bresaola', Categoria: 'Other', Precio: 22.50, stock: 12 },
    { id: 8, Nombre: 'Fennel Finocchiona', Categoria: 'Salami', Precio: 20.00, stock: 20 },
]

// Órdenes
export const initialOrders = [
    { id: '#OR001', Cliente: 'Jean Dupont', Dato: '2026-06-14', Productos: 3, total: '$856.50', Estado: 'Entreago' },
    { id: '#OR002', Cliente: 'Marie Bernard', Dato: '2026-06-13', Productos: 2, total: '$89.99', Estado: 'Enviado' },
    { id: '#OR003', Cliente: 'Pierre Martin', Dato: '2026-06-12', Productos: 5, total: '$234.75', Estado: 'Procesando' },
    { id: '#OR004', Cliente: 'Sophie Leclerc', Dato: '2026-06-11', Producto: 1, total: '$45.25', Estado: 'Pendiente' },
    { id: '#OR005', Cliente: 'Claude Rousseau', Dato: '2026-06-10', Productos: 4, total: '$198.00', Estado: 'Entregado' },
    { id: '#OR006', Cliente: 'Luc Moreau', Dato: '2026-06-09', Productos: 2, total: '$92.50', Estado: 'Enviado' },
    { id: '#OR007', Cliente: 'Anne Thierry', Dato: '2026-06-08', Productos: 3, total: '$167.25', Estado: 'Entregado' },
    { id: '#OR008', Cliente: 'Marc Valentin', Dato: '2026-06-07', Productos: 6, total: '$312.80', Estado: 'Procesando' },
]

// Usuarios
export const users = [
    { id: 1, Nombre: 'Jean Dupont', email: 'jean@example.com', Registrado: '2025-12-01', role: 'Admin', Estado: 'Activo' },
    { id: 2, Nombre: 'Marie Bernard', email: 'marie@example.com', Registrado: '2025-11-15', role: 'Customer', Estado: 'Activo' },
    { id: 3, Nombre: 'Pierre Martin', email: 'pierre@example.com', Registrado: '2025-10-20', role: 'Customer', Estado: 'Activo' },
    { id: 4, Nombre: 'Sophie Leclerc', email: 'sophie@example.com', Registrado: '2025-09-10', role: 'Customer', Estado: 'Inactivo' },
    { id: 5, Nombre: 'Claude Rousseau', email: 'claude@example.com', Registrado: '2025-08-05', role: 'Customer', Estado: 'Activo' },
    { id: 6, Nombre: 'Luc Moreau', email: 'luc@example.com', Registrado: '2025-07-12', role: 'Customer', Estado: 'Activo' },
    { id: 7, Nombre: 'Anne Thierry', email: 'anne@example.com', Registrado: '2025-06-22', role: 'Customer', Estado: 'Activo' },
    { id: 8, Nombre: 'Marc Valentin', email: 'marc@example.com', Registrado: '2025-05-30', role: 'Customer', Estado: 'Inactivo' },
]

// Datos de ventas
export const salesData = [
    { date: 'Jun 1', sales: 800 },
    { date: 'Jun 5', sales: 750 },
    { date: 'Jun 10', sales: 620 },
    { date: 'Jun 15', sales: 950 },
    { date: 'Jun 20', sales: 780 },
    { date: 'Jun 25', sales: 1050 },
    { date: 'Jun 30', sales: 1280 },
]
