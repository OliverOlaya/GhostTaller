const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ghost_motors',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

async function getSiteData() {
  const [settingsRows] = await pool.query('SELECT * FROM site_settings ORDER BY id DESC LIMIT 1');
  const [galleryRows] = await pool.query('SELECT image_url FROM gallery_images ORDER BY sort_order, id');
  const [motoRows] = await pool.query('SELECT brand, model, year, km, price, image_url AS image, whatsapp_url AS url FROM motos WHERE is_active = 1 ORDER BY sort_order, id');
  const [partRows] = await pool.query('SELECT category, name, compatibility, price, image_url AS image, whatsapp_url AS url FROM parts WHERE is_active = 1 ORDER BY sort_order, id');
  const [teamRows] = await pool.query('SELECT name, role, image_url AS image FROM team_members ORDER BY sort_order, id');
  const [newsRows] = await pool.query('SELECT date_label AS date, title, description FROM news_items WHERE is_published = 1 ORDER BY sort_order, id');

  const settings = settingsRows[0] || {};

  return {
    heroImage: settings.hero_image || '',
    siteSettings: {
      workshopName: settings.site_name || 'Ghost Motors',
      phone: settings.phone || '',
      whatsappUrl: settings.whatsapp_url || '',
      address: settings.address || '',
      city: settings.city || '',
      weekdayHours: settings.weekday_hours || '',
      saturdayHours: settings.saturday_hours || '',
      sundayHours: settings.sunday_hours || '',
      email: settings.email || '',
      facebook: settings.facebook_url || '',
      instagram: settings.instagram_url || '',
      tiktok: settings.tiktok_url || '',
      description: settings.description || ''
    },
    visitorCount: Number(settings.visitor_count || 0),
    galleryImages: galleryRows.map((row) => row.image_url),
    motos: motoRows,
    parts: partRows,
    team: teamRows,
    news: newsRows
  };
}

async function saveSiteData(payload) {
  const data = payload || {};
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [settingsRows] = await connection.query('SELECT COUNT(*) AS total FROM site_settings');

    if ((settingsRows[0] && Number(settingsRows[0].total)) === 0) {
      await connection.query(
        'INSERT INTO site_settings (site_name, hero_image, primary_color, phone, whatsapp_url, address, city, weekday_hours, saturday_hours, sunday_hours, email, facebook_url, instagram_url, tiktok_url, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['Ghost Motors', data.heroImage || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85', '#ff5a00', data.siteSettings?.phone || '', data.siteSettings?.whatsappUrl || '', data.siteSettings?.address || '', data.siteSettings?.city || '', data.siteSettings?.weekdayHours || '', data.siteSettings?.saturdayHours || '', data.siteSettings?.sundayHours || '', data.siteSettings?.email || '', data.siteSettings?.facebook || '', data.siteSettings?.instagram || '', data.siteSettings?.tiktok || '', data.siteSettings?.description || '']
      );
    } else {
      await connection.query(
        'UPDATE site_settings SET hero_image = ?, site_name = ?, phone = ?, whatsapp_url = ?, address = ?, city = ?, weekday_hours = ?, saturday_hours = ?, sunday_hours = ?, email = ?, facebook_url = ?, instagram_url = ?, tiktok_url = ?, description = ?, updated_at = NOW() WHERE id = (SELECT id FROM (SELECT id FROM site_settings ORDER BY id DESC LIMIT 1) AS latest)',
        [data.heroImage || '', data.siteSettings?.workshopName || 'Ghost Motors', data.siteSettings?.phone || '', data.siteSettings?.whatsappUrl || '', data.siteSettings?.address || '', data.siteSettings?.city || '', data.siteSettings?.weekdayHours || '', data.siteSettings?.saturdayHours || '', data.siteSettings?.sundayHours || '', data.siteSettings?.email || '', data.siteSettings?.facebook || '', data.siteSettings?.instagram || '', data.siteSettings?.tiktok || '', data.siteSettings?.description || '']
      );
    }

    await connection.query('DELETE FROM gallery_images');
    if (Array.isArray(data.galleryImages) && data.galleryImages.length) {
      const galleryValues = data.galleryImages.map((imageUrl, index) => [imageUrl, index + 1]);
      await connection.query('INSERT INTO gallery_images (image_url, sort_order) VALUES ?', [galleryValues]);
    }

    await connection.query('DELETE FROM motos');
    if (Array.isArray(data.motos) && data.motos.length) {
      const motoValues = data.motos.map((moto, index) => [
        moto.brand || '',
        moto.model || '',
        moto.year || '',
        moto.km || '',
        moto.price || '',
        moto.image || '',
        moto.url || '',
        index + 1
      ]);
      await connection.query(
        'INSERT INTO motos (brand, model, year, km, price, image_url, whatsapp_url, sort_order, is_active) VALUES ?',
        [motoValues]
      );
    }

    await connection.query('DELETE FROM parts');
    if (Array.isArray(data.parts) && data.parts.length) {
      const partValues = data.parts.map((part, index) => [
        part.category || 'motor',
        part.name || '',
        part.compatibility || '',
        part.price || '',
        part.image || '',
        part.url || '',
        index + 1
      ]);
      await connection.query(
        'INSERT INTO parts (category, name, compatibility, price, image_url, whatsapp_url, sort_order, is_active) VALUES ?',
        [partValues]
      );
    }

    await connection.query('DELETE FROM team_members');
    if (Array.isArray(data.team) && data.team.length) {
      const teamValues = data.team.map((member, index) => [
        member.name || '',
        member.role || '',
        member.image || '',
        index + 1
      ]);
      await connection.query('INSERT INTO team_members (name, role, image_url, sort_order) VALUES ?', [teamValues]);
    }

    await connection.query('DELETE FROM news_items');
    if (Array.isArray(data.news) && data.news.length) {
      const newsValues = data.news.map((item, index) => [
        item.date || '',
        item.title || '',
        item.description || '',
        index + 1,
        1
      ]);
      await connection.query('INSERT INTO news_items (date_label, title, description, sort_order, is_published) VALUES ?', [newsValues]);
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Ghost Motors API funcionando' });
});

app.get('/', (req, res) => {
  res.sendFile(require('path').join(__dirname, 'index.html'));
});

app.get('/api/site', async (req, res) => {
  try {
    const data = await getSiteData();
    res.json(data);
  } catch (error) {
    console.error('Error al leer el sitio:', error);
    res.status(500).json({ error: 'No se pudo cargar la información del sitio.' });
  }
});

app.post('/api/visit', async (req, res) => {
  try {
    await pool.query('UPDATE site_settings SET visitor_count = visitor_count + 1 WHERE id = (SELECT id FROM (SELECT id FROM site_settings ORDER BY id DESC LIMIT 1) AS latest)');
    const [rows] = await pool.query('SELECT visitor_count FROM site_settings ORDER BY id DESC LIMIT 1');
    res.json({ visitorCount: Number(rows[0]?.visitor_count || 0) });
  } catch (error) {
    console.error('Error al registrar visita:', error);
    res.status(500).json({ error: 'No se pudo registrar la visita.' });
  }
});

app.post('/api/site', async (req, res) => {
  try {
    await saveSiteData(req.body);
    res.json({ success: true, message: 'Información guardada correctamente.' });
  } catch (error) {
    console.error('Error al guardar el sitio:', error);
    res.status(500).json({ error: 'No se pudo guardar la información del sitio.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Usuario y contraseña requeridos.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, username, full_name, role FROM admin_users WHERE username = ? AND password_hash = SHA2(?, 256) AND is_active = 1 LIMIT 1',
      [username, password]
    );

    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });
    }

    return res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ success: false, message: 'Error al iniciar sesión.' });
  }
});

app.listen(PORT, () => {
  console.log(`Ghost Motors API corriendo en http://localhost:${PORT}`);
});
