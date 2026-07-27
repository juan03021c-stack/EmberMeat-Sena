// Productos
export const products = [
    { id: 1, name: 'Smoked Duck Salami', category: 'Salami', price: 18.99, stock: 24 },
    { id: 2, name: 'Québec Chorizo Rouge', category: 'Chorizo', price: 16.50, stock: 18 },
    { id: 3, name: 'Artisan Prosciutto', category: 'Prosciutto', price: 26.99, stock: 10 },
    { id: 4, name: 'Smoked Toulouse Sausage', category: 'Smoked Sausages', price: 14.25, stock: 0 },
    { id: 5, name: 'Wild Boar Salami', category: 'Salami', price: 32.00, stock: 8 },
    { id: 6, name: 'Smoked Lamb Merguez', category: 'Smoked Sausages', price: 19.75, stock: 15 },
    { id: 7, name: 'Dried Beef Bresaola', category: 'Other', price: 22.50, stock: 12 },
    { id: 8, name: 'Fennel Finocchiona', category: 'Salami', price: 20.00, stock: 20 },
]

// Órdenes
export const initialOrders = [
    { id: '#OR001', customer: 'Jean Dupont', date: '2026-06-14', items: 3, total: '$856.50', status: 'Delivered' },
    { id: '#OR002', customer: 'Marie Bernard', date: '2026-06-13', items: 2, total: '$89.99', status: 'Shipped' },
    { id: '#OR003', customer: 'Pierre Martin', date: '2026-06-12', items: 5, total: '$234.75', status: 'Processing' },
    { id: '#OR004', customer: 'Sophie Leclerc', date: '2026-06-11', items: 1, total: '$45.25', status: 'Pending' },
    { id: '#OR005', customer: 'Claude Rousseau', date: '2026-06-10', items: 4, total: '$198.00', status: 'Delivered' },
    { id: '#OR006', customer: 'Luc Moreau', date: '2026-06-09', items: 2, total: '$92.50', status: 'Shipped' },
    { id: '#OR007', customer: 'Anne Thierry', date: '2026-06-08', items: 3, total: '$167.25', status: 'Delivered' },
    { id: '#OR008', customer: 'Marc Valentin', date: '2026-06-07', items: 6, total: '$312.80', status: 'Processing' },
]

// Usuarios
export const users = [
    { id: 1, name: 'Jean Dupont', email: 'jean@example.com', registered: '2025-12-01', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Marie Bernard', email: 'marie@example.com', registered: '2025-11-15', role: 'Customer', status: 'Active' },
    { id: 3, name: 'Pierre Martin', email: 'pierre@example.com', registered: '2025-10-20', role: 'Customer', status: 'Active' },
    { id: 4, name: 'Sophie Leclerc', email: 'sophie@example.com', registered: '2025-09-10', role: 'Customer', status: 'Inactive' },
    { id: 5, name: 'Claude Rousseau', email: 'claude@example.com', registered: '2025-08-05', role: 'Customer', status: 'Active' },
    { id: 6, name: 'Luc Moreau', email: 'luc@example.com', registered: '2025-07-12', role: 'Customer', status: 'Active' },
    { id: 7, name: 'Anne Thierry', email: 'anne@example.com', registered: '2025-06-22', role: 'Customer', status: 'Active' },
    { id: 8, name: 'Marc Valentin', email: 'marc@example.com', registered: '2025-05-30', role: 'Customer', status: 'Inactive' },
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
