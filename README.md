# Ghost Motors

Sitio web y panel administrativo para Ghost Motors, con persistencia local y API Node.js conectada a MySQL.

## 1. Requisitos

- Node.js 18 o superior
- MySQL 8 o superior

## 2. Crear la base de datos

1. Abre MySQL Workbench o la consola de MySQL.
2. Ejecuta todo el archivo `ghost_motors_mysql.sql`.
3. El script crea la base `ghost_motors`, sus tablas y los datos iniciales.

Las imágenes se almacenan como texto largo para soportar las imágenes cargadas desde el panel.

Si ya habías creado la base con una versión anterior del proyecto, ejecuta `ghost_motors_mysql_upgrade.sql` en lugar de repetir el script inicial.

## 3. Configurar el servidor

Copia `.env.example` con el nombre `.env` y actualiza la contraseña de MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=ghost_motors
PORT=3000
```

## 4. Instalar y ejecutar

Desde esta carpeta ejecuta:

```bash
npm install
npm start
```

Abre:

- Sitio: http://localhost:3000
- Panel: http://localhost:3000/admin.html
- Estado de la API: http://localhost:3000/health

## Usuarios iniciales

Usuarios iniciales:

- `adriana` / `marketing123`
- `julian` / `admin2828`
- `oliver` / `Ol28281202`
- `camila` / `Cr140804`

El panel guarda hero, galería, motos, repuestos, equipo y noticias en MySQL. Si la API no está disponible, el navegador usa localStorage como respaldo temporal.
