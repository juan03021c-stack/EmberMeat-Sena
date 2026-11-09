# Despliegue en Hostinger

Todo va en `public_html` del dominio:

```
public_html/
├── index.html, assets/, imagess/, .htaccess   ← contenido de ember-meats-admin/dist
└── backend/                                   ← carpeta backend completa
```

## 1. Base de datos
1. En hPanel → **Bases de datos MySQL**, crear una base, un usuario y su contraseña.
2. En XAMPP → phpMyAdmin → `embermeat3` → **Exportar** (SQL).
3. En hPanel → **phpMyAdmin** de la base nueva → **Importar** ese archivo.

## 2. Backend
1. Subir la carpeta `backend` completa a `public_html/backend`.
2. Editar `backend/Config/Database.php` en el servidor con `DB_NAME`, `DB_USER` y `DB_PASS` de Hostinger (`DB_HOST` suele quedar `localhost`).
3. Crear `backend/Config/Correo.php` en el servidor (copiando `Correo.example.php`) con el Gmail y su contraseña de aplicación.

## 3. Frontend
1. En `ember-meats-admin`, copiar `.env.example` como `.env.production` y cambiar `TU-DOMINIO.com` por el dominio real.
2. Compilar:
   ```
   npm run build
   ```
3. Subir **el contenido** de `ember-meats-admin/dist` (no la carpeta) a `public_html`. Debe quedar el archivo `.htaccess`.

## 4. Wompi
En el panel de Wompi (modo pruebas) → **URL de eventos**:
`https://TU-DOMINIO.com/backend/Config/configWompi/webhook_wompi.php`

## 5. Probar
- Abrir el dominio, entrar a `/catalogo` y recargar la página (no debe salir 404).
- Iniciar sesión como administrador y revisar Productos (imágenes) y Ventas.
- Hacer una compra de prueba pagando en el punto y otra con tarjeta de prueba de Wompi.
- Recuperar contraseña para confirmar que llegan los correos.
