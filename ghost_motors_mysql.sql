CREATE DATABASE IF NOT EXISTS ghost_motors CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ghost_motors;

CREATE TABLE site_settings (
    id INT NOT NULL AUTO_INCREMENT,
    site_name VARCHAR(100) NOT NULL DEFAULT 'Ghost Motors',
    hero_image LONGTEXT NOT NULL,
    primary_color VARCHAR(7) NOT NULL DEFAULT '#ff5a00',
    phone VARCHAR(50) NOT NULL DEFAULT '+57 300 123 4567',
    whatsapp_url VARCHAR(255) NOT NULL DEFAULT 'https://wa.me/573001234567',
    address VARCHAR(255) NOT NULL DEFAULT 'Calle 10 # 20-30',
    city VARCHAR(150) NOT NULL DEFAULT 'Neiva, Huila, Colombia',
    weekday_hours VARCHAR(150) NOT NULL DEFAULT 'Lunes - Viernes: 8:00 AM - 6:00 PM',
    saturday_hours VARCHAR(150) NOT NULL DEFAULT 'Sábados: 8:00 AM - 2:00 PM',
    sunday_hours VARCHAR(150) NOT NULL DEFAULT 'Domingos: Cerrado',
    email VARCHAR(150) NOT NULL DEFAULT 'contacto@ghostmotors.com',
    facebook_url VARCHAR(255) NOT NULL DEFAULT '',
    instagram_url VARCHAR(255) NOT NULL DEFAULT '',
    tiktok_url VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT NOT NULL,
    visitor_count BIGINT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE gallery_images (
    id INT NOT NULL AUTO_INCREMENT,
    image_url LONGTEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE motos (
    id INT NOT NULL AUTO_INCREMENT,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL,
    km VARCHAR(50) NOT NULL,
    price VARCHAR(100) NOT NULL,
    image_url LONGTEXT NOT NULL,
    whatsapp_url VARCHAR(255) DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE parts (
    id INT NOT NULL AUTO_INCREMENT,
    category VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    compatibility VARCHAR(255) DEFAULT NULL,
    price VARCHAR(100) NOT NULL,
    image_url LONGTEXT NOT NULL,
    whatsapp_url VARCHAR(255) DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE team_members (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(150) NOT NULL,
    image_url LONGTEXT DEFAULT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE news_items (
    id INT NOT NULL AUTO_INCREMENT,
    date_label VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_published TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE admin_users (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

INSERT INTO site_settings (site_name, hero_image, primary_color, description)
VALUES (
    'Ghost Motors',
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85',
    '#ff5a00',
    'Pasión, potencia y servicio para quienes viven sobre dos ruedas.'
);

INSERT INTO gallery_images (image_url, sort_order) VALUES
('https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80', 1),
('https://images.unsplash.com/photo-1525160354320-d8e92641c563?auto=format&fit=crop&w=900&q=80', 2),
('https://images.unsplash.com/photo-1502744688674-c619d1586c9e?auto=format&fit=crop&w=900&q=80', 3),
('https://images.unsplash.com/photo-1558980394-0c94b0b0e8b8?auto=format&fit=crop&w=900&q=80', 4),
('https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=900&q=80', 5);

INSERT INTO motos (brand, model, year, km, price, image_url, whatsapp_url, sort_order) VALUES
('Yamaha', 'MT-03', '2022', '18.500', '$22.900.000', 'https://images.unsplash.com/photo-1558980664-10e7170c70f1?auto=format&fit=crop&w=1000&q=80', 'https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20estoy%20interesado%20en%20la%20Yamaha%20MT-03%202022.', 1),
('Bajaj', 'Pulsar NS200', '2021', '24.300', '$11.800.000', 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=1000&q=80', 'https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20estoy%20interesado%20en%20la%20Bajaj%20Pulsar%20NS200%202021.', 2),
('Honda', 'CB190R', '2023', '10.900', '$14.900.000', 'https://images.unsplash.com/photo-1517846693594-ea5c7cfb0d3b?auto=format&fit=crop&w=1000&q=80', 'https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20estoy%20interesado%20en%20la%20Honda%20CB190R%202023.', 3),
('TVS', 'Raider 125', '2024', '7.800', '$9.700.000', 'https://images.unsplash.com/photo-1558980663-368d1a2d8a29?auto=format&fit=crop&w=1000&q=80', 'https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20estoy%20interesado%20en%20la%20TVS%20Raider%20125%202024.', 4),
('Yamaha', 'XTZ 250', '2022', '16.200', '$18.500.000', 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1000&q=80', 'https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20estoy%20interesado%20en%20la%20Yamaha%20XTZ%20250%202022.', 5),
('Bajaj', 'Dominar 400', '2020', '35.600', '$16.900.000', 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=1000&q=80', 'https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20estoy%20interesado%20en%20la%20Bajaj%20Dominar%20400%202020.', 6);

INSERT INTO parts (category, name, compatibility, price, image_url, whatsapp_url, sort_order) VALUES
('frenos', 'Pastillas de freno', 'Compatibilidad: NS200 / RS200 / Dominar', '$68.000', 'https://images.unsplash.com/photo-1619771914272-e3c3d8e39f38?auto=format&fit=crop&w=900&q=80', 'https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20quiero%20consultar%20por%20pastillas%20de%20freno.', 1),
('lubricantes', 'Aceite 4T 10W-40', 'Referencia: 1 Litro', '$52.000', 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=900&q=80', 'https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20quiero%20consultar%20por%20aceite%204T%2010W-40.', 2),
('motor', 'Filtro de aceite', 'Compatible con múltiples referencias', '$24.000', 'https://images.unsplash.com/photo-1599819177626-8f49e4ba6b39?auto=format&fit=crop&w=900&q=80', 'https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20quiero%20consultar%20por%20filtro%20de%20aceite.', 3),
('transmision', 'Kit de arrastre', 'Referencia: Cadena + piñón + corona', '$185.000', 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80', 'https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20quiero%20consultar%20por%20kit%20de%20arrastre.', 4),
('electrico', 'Batería 12V', 'Referencia: 7Ah - Libre mantenimiento', '$210.000', 'https://images.unsplash.com/photo-1609607847926-da4702f01fef?auto=format&fit=crop&w=900&q=80', 'https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20quiero%20consultar%20por%20bateria%2012V.', 5),
('frenos', 'Disco de freno', 'Compatibilidad según modelo', '$135.000', 'https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=900&q=80', 'https://wa.me/573001234567?text=Hola%20Ghost%20Motors,%20quiero%20consultar%20por%20disco%20de%20freno.', 6);

INSERT INTO team_members (name, role, image_url, sort_order) VALUES
('Juan Pérez', 'Director / Mecánico', 'https://i.pravatar.cc/600?img=12', 1),
('Carlos Gómez', 'Mecánico especializado', 'https://i.pravatar.cc/600?img=11', 2),
('Laura Martínez', 'Administración y ventas', 'https://i.pravatar.cc/600?img=47', 3),
('Julian', 'Mecánico', 'https://i.pravatar.cc/600?img=33', 4),
('Adriana', 'Mecánica', 'https://i.pravatar.cc/600?img=48', 5),
('Oliver', 'Aprendiz', 'https://i.pravatar.cc/600?img=15', 6);

INSERT INTO news_items (date_label, title, description, sort_order) VALUES
('15 Jun', 'Renovación de servicios premium', 'Hemos reforzado nuestro taller con nuevas herramientas para mantenimiento, diagnóstico y ajuste fino en motos de alto rendimiento.', 1),
('02 Jul', 'Promoción de revisión general', 'Este mes incluye revisión completa, ajuste de frenos, inspección de cadena y revisión de chasis con diagnóstico personalizado.', 2),
('18 Jul', 'Encuentro de motociclistas', 'Organizamos una reunión abierta para compartir experiencias, recomendar rutas y conectar con otros apasionados por las dos ruedas.', 3);

INSERT INTO admin_users (username, password_hash, full_name, role) VALUES
('julian', SHA2('admin2828', 256), 'Julian', 'editor'),
('adriana', SHA2('marketing123', 256), 'Adriana', 'editor'),
('oliver', SHA2('Ol28281202', 256), 'Oliver', 'editor'),
('camila', SHA2('Cr140804', 256), 'Camila', 'editor');

-- Consultas útiles
SELECT * FROM site_settings;
SELECT * FROM gallery_images ORDER BY sort_order;
SELECT * FROM motos ORDER BY sort_order;
SELECT * FROM parts ORDER BY sort_order;
SELECT * FROM team_members ORDER BY sort_order;
SELECT * FROM news_items ORDER BY sort_order;
SELECT * FROM admin_users;
