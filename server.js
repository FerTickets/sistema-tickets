const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
// Configuración de Nodemailer para Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'general.controlgifyt@gmail.com',
    pass: 'hymx zbgg kdqk qdab'
  }
});

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Base de datos
let db = new sqlite3.Database('./tickets.db', (err) => {
  if (err) console.error('Error abriendo DB:', err);
  else console.log('Base de datos conectada');
});

// Crear tablas
const crearTablas = () => {
  db.serialize(() => {
    // Tabla de tickets
    db.run(`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        nombre TEXT NOT NULL,
        asunto TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        estado TEXT DEFAULT 'abierto',
        prioridad TEXT DEFAULT 'normal',
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_cierre DATETIME,
        admin_asignado TEXT
      )
    `);

    // Tabla de mensajes
    db.run(`
      CREATE TABLE IF NOT EXISTS mensajes (
        id TEXT PRIMARY KEY,
        ticket_id TEXT NOT NULL,
        autor TEXT NOT NULL,
        tipo_autor TEXT DEFAULT 'usuario',
        mensaje TEXT NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(ticket_id) REFERENCES tickets(id)
      )
    `);

    console.log('Tablas creadas/verificadas');
  });
};

crearTablas();

// ==================== RUTAS API ====================

// 1. CREAR TICKET
app.post('/api/tickets', (req, res) => {
  const { email, nombre, asunto, descripcion, prioridad } = req.body;
  const ticketId = uuidv4();

  if (!email || !nombre || !asunto || !descripcion) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  db.run(
    `INSERT INTO tickets (id, email, nombre, asunto, descripcion, prioridad)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [ticketId, email, nombre, asunto, descripcion, prioridad || 'normal'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al crear ticket' });
      }

      // Agregar mensaje inicial
      const msgId = uuidv4();
      db.run(
        `INSERT INTO mensajes (id, ticket_id, autor, tipo_autor, mensaje)
         VALUES (?, ?, ?, ?, ?)`,
        [msgId, ticketId, nombre, 'usuario', descripcion],
        (err) => {
          if (err) console.error('Error al crear mensaje inicial:', err);

          // ENVIAR CORREO AL USUARIO
          const urlSeguimiento = `${req.protocol}://${req.get('host')}`;
          const mailOptions = {
            from: 'general.controlgifyt@gmail.com',
            to: email,
            subject: `Ticket creado: ${asunto}`,
            html: `
              <h2>¡Tu ticket ha sido creado exitosamente!</h2>
              <p><strong>Asunto:</strong> ${asunto}</p>
              <p><strong>ID del Ticket:</strong> <strong style="color: blue; font-size: 18px;">${ticketId.substring(0, 8)}</strong></p>
              <hr>
              <h3>¿Cómo hacer seguimiento?</h3>
              <ol>
                <li>Ve a: ${urlSeguimiento}</li>
                <li>Haz clic en "Mis Tickets"</li>
                <li>Ingresa tu email: ${email}</li>
                <li>Verás el estado de tu ticket y todos los comentarios</li>
              </ol>
              <p><strong>Tiempo de respuesta estimado:</strong> En breve nos pondremos en contacto.</p>
              <hr>
              <p>¡Gracias por tu paciencia!</p>
            `
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error enviando correo:', error);
            } else {
              console.log('Correo enviado:', info.response);
            }
          });

          res.json({
            id: ticketId,
            mensaje: 'Ticket creado exitosamente',
            email: email
          });
        }
      );
    }
  );
});

// 2. OBTENER TICKET POR ID (usuario)
app.get('/api/tickets/:id', (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT * FROM tickets WHERE id = ?`,
    [id],
    (err, ticket) => {
      if (err) {
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket no encontrado' });
      }

      // Obtener mensajes
      db.all(
        `SELECT * FROM mensajes WHERE ticket_id = ? ORDER BY fecha ASC`,
        [id],
        (err, mensajes) => {
          if (err) {
            return res.status(500).json({ error: 'Error obteniendo mensajes' });
          }
          res.json({ ...ticket, mensajes });
        }
      );
    }
  );
});

// 3. OBTENER TICKET POR EMAIL (usuario)
app.get('/api/tickets-usuario/:email', (req, res) => {
  const { email } = req.params;

  db.all(
    `SELECT id, email, nombre, asunto, estado, prioridad, fecha_creacion, fecha_cierre
     FROM tickets WHERE email = ? ORDER BY fecha_creacion DESC`,
    [email],
    (err, tickets) => {
      if (err) {
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      res.json(tickets || []);
    }
  );
});

// 4. AGREGAR MENSAJE
app.post('/api/mensajes', (req, res) => {
  const { ticket_id, autor, tipo_autor, mensaje } = req.body;
  const msgId = uuidv4();

  if (!ticket_id || !autor || !mensaje) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  db.run(
    `INSERT INTO mensajes (id, ticket_id, autor, tipo_autor, mensaje)
     VALUES (?, ?, ?, ?, ?)`,
    [msgId, ticket_id, autor, tipo_autor || 'usuario', mensaje],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al agregar mensaje' });
      }
      res.json({ id: msgId, mensaje: 'Mensaje agregado' });
    }
  );
});

// ==================== RUTAS ADMIN ====================

// 5. OBTENER TODOS LOS TICKETS (ADMIN)
app.get('/api/admin/tickets', (req, res) => {
  const token = req.query.token;

  if (token !== 'admin123') {
    return res.status(401).json({ error: 'No autorizado' });
  }

  db.all(
    `SELECT id, email, nombre, asunto, estado, prioridad, fecha_creacion, fecha_cierre
     FROM tickets ORDER BY fecha_creacion DESC`,
    (err, tickets) => {
      if (err) {
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      res.json(tickets || []);
    }
  );
});

// 6. CAMBIAR ESTADO DEL TICKET (ADMIN)
app.put('/api/admin/tickets/:id', (req, res) => {
  const token = req.query.token;
  const { id } = req.params;
  const { estado } = req.body;

  if (token !== 'admin123') {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const fechaCierre = estado === 'cerrado' ? new Date().toISOString() : null;

  db.run(
    `UPDATE tickets SET estado = ?, fecha_cierre = ? WHERE id = ?`,
    [estado, fechaCierre, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error actualizando ticket' });
      }
      res.json({ mensaje: 'Ticket actualizado' });
    }
  );
});

// 7. ESTADÍSTICAS (ADMIN)
app.get('/api/admin/estadisticas', (req, res) => {
  const token = req.query.token;

  if (token !== 'admin123') {
    return res.status(401).json({ error: 'No autorizado' });
  }

  db.all(
    `SELECT
      COUNT(*) as total,
      SUM(CASE WHEN estado = 'abierto' THEN 1 ELSE 0 END) as abiertos,
      SUM(CASE WHEN estado = 'en_proceso' THEN 1 ELSE 0 END) as en_proceso,
      SUM(CASE WHEN estado = 'cerrado' THEN 1 ELSE 0 END) as cerrados,
      ROUND(AVG(CASE WHEN fecha_cierre IS NOT NULL
        THEN (julianday(fecha_cierre) - julianday(fecha_creacion)) * 24
        ELSE NULL END), 2) as horas_promedio
     FROM tickets`,
    (err, stats) => {
      if (err) {
        return res.status(500).json({ error: 'Error en estadísticas' });
      }
      res.json(stats[0] || {});
    }
  );
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
// Versión con correos automáticos
});
