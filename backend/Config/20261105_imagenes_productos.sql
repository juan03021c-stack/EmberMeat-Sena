-- Reemplaza las rutas de ejemplo por fotos que sí existen en uploads/.
-- Solo toca productos con ruta falsa; las imágenes reales no cambian.
UPDATE productos
SET imagen_url = 'uploads/6aa95e9851553d54c024a9ac4ab5d.jpeg'
WHERE nombre LIKE 'Chorizo%'
  AND (imagen_url LIKE '/img/%' OR imagen_url LIKE 'https://ejemplo.com/%');

UPDATE productos
SET imagen_url = 'uploads/6ada2529f29835bb049541292e23f.jpeg'
WHERE imagen_url LIKE '/img/%' OR imagen_url LIKE 'https://ejemplo.com/%';
