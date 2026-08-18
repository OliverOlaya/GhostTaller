USE ghost_motors;

ALTER TABLE site_settings
    ADD COLUMN phone VARCHAR(50) NOT NULL DEFAULT '3143655046',
    ADD COLUMN whatsapp_url VARCHAR(255) NOT NULL DEFAULT 'https://wa.me/573143655046',
    ADD COLUMN address VARCHAR(255) NOT NULL DEFAULT 'Calle 2 10-57',
    ADD COLUMN city VARCHAR(150) NOT NULL DEFAULT 'Neiva, Huila, Colombia',
    ADD COLUMN weekday_hours VARCHAR(150) NOT NULL DEFAULT 'Lunes - Viernes: 8:00 AM - 6:00 PM',
    ADD COLUMN saturday_hours VARCHAR(150) NOT NULL DEFAULT 'Sábados: 8:00 AM - 2:00 PM',
    ADD COLUMN sunday_hours VARCHAR(150) NOT NULL DEFAULT 'Domingos: Cerrado',
    ADD COLUMN email VARCHAR(150) NOT NULL DEFAULT 'contacto@ghostmotors.com',
    ADD COLUMN facebook_url VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN instagram_url VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN tiktok_url VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN description TEXT NULL,
    ADD COLUMN visitor_count BIGINT UNSIGNED NOT NULL DEFAULT 0;

UPDATE site_settings
SET description = 'Pasión, potencia y servicio para quienes viven sobre dos ruedas.'
WHERE description IS NULL OR description = '';

ALTER TABLE site_settings
    MODIFY COLUMN description TEXT NOT NULL;

UPDATE site_settings
SET phone = '3143655046',
    whatsapp_url = 'https://wa.me/573143655046',
    address = 'Calle 2 10-57';

DELETE FROM admin_users WHERE username = 'admin';
UPDATE admin_users SET password_hash = SHA2('marketing123', 256), full_name = 'Adriana', role = 'editor' WHERE username = 'adriana';
UPDATE admin_users SET password_hash = SHA2('admin2828', 256), full_name = 'Julian', role = 'editor' WHERE username = 'julian';
UPDATE admin_users SET password_hash = SHA2('Ol28281202', 256), full_name = 'Oliver', role = 'editor' WHERE username = 'oliver';

INSERT INTO admin_users (username, password_hash, full_name, role)
VALUES ('camila', SHA2('Cr140804', 256), 'Camila', 'editor')
ON DUPLICATE KEY UPDATE
    password_hash = VALUES(password_hash),
    full_name = VALUES(full_name),
    role = VALUES(role),
    is_active = 1;
