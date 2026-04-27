const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Base de datos PostgreSQL
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Gif920130uw0@db.hklvofgfghubhopjzwwy.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('Error en pool de conexión:', err);
});

console.log('Conectando a PostgreSQL...');

// Crear tablas
const crearTablas = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        nombre TEXT NOT NULL,
        asunto TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        estado TEXT DEFAULT 'abierto',
        prioridad TEXT DEFAULT 'normal',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_cierre TIMESTAMP,
        admin_asignado TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS mensajes (
        id TEXT PRIMARY KEY,
        ticket_id TEXT NOT NULL,
        autor TEXT NOT NULL,
        tipo_autor TEXT DEFAULT 'usuario',
        mensaje TEXT NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(ticket_id) REFERENCES tickets(id)
      )
    `);

    console.log('Base de datos conectada y tablas verificadas');
  } catch (err) {
    console.error('Error creando tablas:', err);
  }
};

crearTablas();

// ==================== RUTAS API ====================

// 1. CREAR TICKET
app.post('/api/tickets', async (req, res) => {
  const { email, nombre, asunto, descripcion, prioridad } = req.body;
  const ticketId = uuidv4();

  if (!email || !nombre || !asunto || !descripcion) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    await pool.query(
      `INSERT INTO tickets (id, email, nombre, asunto, descripcion, prioridad)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [ticketId, email, nombre, asunto, descripcion, prioridad || 'normal']
    );

    const msgId = uuidv4();
    await pool.query(
      `INSERT INTO mensajes (id, ticket_id, autor, tipo_autor, mensaje)
       VALUES ($1, $2, $3, $4, $5)`,
      [msgId, ticketId, nombre, 'usuario', descripcion]
    );

    res.json({
      id: ticketId,
      mensaje: 'Ticket creado exitosamente',
      email: email
    });
  } catch (err) {
    console.error('Error al crear ticket:', err);
    res.status(500).json({ error: 'Error al crear ticket' });
  }
});

// 2. OBTENER TICKET POR ID (usuario)
app.get('/api/tickets/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const ticketResult = await pool.query(
      `SELECT * FROM tickets WHERE id = $1`,
      [id]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    const ticket = ticketResult.rows[0];

    const mensajesResult = await pool.query(
      `SELECT * FROM mensajes WHERE ticket_id = $1 ORDER BY fecha ASC`,
      [id]
    );

    res.json({ ...ticket, mensajes: mensajesResult.rows });
  } catch (err) {
    console.error('Error obteniendo ticket:', err);
    res.status(500).json({ error: 'Error en la base de datos' });
  }
});

// 3. OBTENER TICKET POR EMAIL (usuario)
app.get('/api/tickets-usuario/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, email, nombre, asunto, estado, prioridad, fecha_creacion, fecha_cierre
       FROM tickets WHERE email = $1 ORDER BY fecha_creacion DESC`,
      [email]
    );

    res.json(result.rows || []);
  } catch (err) {
    console.error('Error obteniendo tickets:', err);
    res.status(500).json({ error: 'Error en la base de datos' });
  }
});

// 4. AGREGAR MENSAJE
app.post('/api/mensajes', async (req, res) => {
  const { ticket_id, autor, tipo_autor, mensaje } = req.body;
  const msgId = uuidv4();

  if (!ticket_id || !autor || !mensaje) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  try {
    await pool.query(
      `INSERT INTO mensajes (id, ticket_id, autor, tipo_autor, mensaje)
       VALUES ($1, $2, $3, $4, $5)`,
      [msgId, ticket_id, autor, tipo_autor || 'usuario', mensaje]
    );

    res.json({ id: msgId, mensaje: 'Mensaje agregado' });
  } catch (err) {
    console.error('Error al agregar mensaje:', err);
    res.status(500).json({ error: 'Error al agregar mensaje' });
  }
});

// ==================== RUTAS ADMIN ====================

// 5. OBTENER TODOS LOS TICKETS (ADMIN)
app.get('/api/admin/tickets', async (req, res) => {
  const token = req.query.token;

  if (token !== 'admin123') {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const result = await pool.query(
      `SELECT id, email, nombre, asunto, estado, prioridad, fecha_creacion, fecha_cierre
       FROM tickets ORDER BY fecha_creacion DESC`
    );

    res.json(result.rows || []);
  } catch (err) {
    console.error('Error obteniendo tickets:', err);
    res.status(500).json({ error: 'Error en la base de datos' });
  }
});

// 6. CAMBIAR ESTADO DEL TICKET (ADMIN)
app.put('/api/admin/tickets/:id', async (req, res) => {
  const token = req.query.token;
  const { id } = req.params;
  const { estado } = req.body;

  if (token !== 'admin123') {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const fechaCierre = estado === 'cerrado' ? new Date().toISOString() : null;

    await pool.query(
      `UPDATE tickets SET estado = $1, fecha_cierre = $2 WHERE id = $3`,
      [estado, fechaCierre, id]
    );

    res.json({ mensaje: 'Ticket actualizado' });
  } catch (err) {
    console.error('Error actualizando ticket:', err);
    res.status(500).json({ error: 'Error actualizando ticket' });
  }
});

// 7. ESTADÍSTICAS (ADMIN)
app.get('/api/admin/estadisticas', async (req, res) => {
  const token = req.query.token;

  if (token !== 'admin123') {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'abierto' THEN 1 ELSE 0 END) as abiertos,
        SUM(CASE WHEN estado = 'en_proceso' THEN 1 ELSE 0 END) as en_proceso,
        SUM(CASE WHEN estado = 'cerrado' THEN 1 ELSE 0 END) as cerrados,
        ROUND(AVG(CASE WHEN fecha_cierre IS NOT NULL
          THEN EXTRACT(EPOCH FROM (fecha_cierre - fecha_creacion))/3600
          ELSE NULL END)::numeric, 2) as horas_promedio
       FROM tickets
    `);

    res.json(result.rows[0] || {});
  } catch (err) {
    console.error('Error en estadísticas:', err);
    res.status(500).json({ error: 'Error en estadísticas' });
  }
});

// Servir archivos estáticos
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Accede a http://localhost:${PORT}`);
});