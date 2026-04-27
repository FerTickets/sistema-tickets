const express = require('express');
const { MongoClient } = require('mongodb');
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

// MongoDB Connection
const MONGO_URL = 'mongodb+srv://generalcontrolgifyt_db_user:XrtWBRFNyGKzv822@cluster0.dqpyrbl.mongodb.net/?appName=Cluster0';
let db;
let ticketsCollection;
let mensajesCollection;

const client = new MongoClient(MONGO_URL);

client.connect().then(() => {
  db = client.db('sistema_tickets');
  ticketsCollection = db.collection('tickets');
  mensajesCollection = db.collection('mensajes');
  console.log('Conectado a MongoDB');
}).catch(err => {
  console.error('Error conectando a MongoDB:', err);
});

// ==================== RUTAS API ====================

// 1. CREAR TICKET
app.post('/api/tickets', async (req, res) => {
  const { email, nombre, asunto, descripcion, prioridad } = req.body;
  const ticketId = uuidv4();

  if (!email || !nombre || !asunto || !descripcion) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    await ticketsCollection.insertOne({
      id: ticketId,
      email,
      nombre,
      asunto,
      descripcion,
      prioridad: prioridad || 'normal',
      estado: 'abierto',
      fecha_creacion: new Date(),
      fecha_cierre: null
    });

    const msgId = uuidv4();
    await mensajesCollection.insertOne({
      id: msgId,
      ticket_id: ticketId,
      autor: nombre,
      tipo_autor: 'usuario',
      mensaje: descripcion,
      fecha: new Date()
    });

    res.json({
      id: ticketId,
      mensaje: 'Ticket creado exitosamente',
      email: email
    });
  } catch (error) {
    console.error('Error al crear ticket:', error);
    res.status(500).json({ error: 'Error al crear ticket' });
  }
});

// 2. OBTENER TICKET POR ID
app.get('/api/tickets/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const ticket = await ticketsCollection.findOne({ id });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    const mensajes = await mensajesCollection
      .find({ ticket_id: id })
      .sort({ fecha: 1 })
      .toArray();

    res.json({ ...ticket, mensajes });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en la base de datos' });
  }
});

// 3. OBTENER TICKETS POR EMAIL
app.get('/api/tickets-usuario/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const tickets = await ticketsCollection
      .find({ email })
      .sort({ fecha_creacion: -1 })
      .toArray();

    res.json(tickets);
  } catch (error) {
    console.error('Error:', error);
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
    await mensajesCollection.insertOne({
      id: msgId,
      ticket_id,
      autor,
      tipo_autor: tipo_autor || 'usuario',
      mensaje,
      fecha: new Date()
    });

    res.json({ id: msgId, mensaje: 'Mensaje agregado' });
  } catch (error) {
    console.error('Error:', error);
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
    const tickets = await ticketsCollection
      .find({})
      .sort({ fecha_creacion: -1 })
      .toArray();

    res.json(tickets);
  } catch (error) {
    console.error('Error:', error);
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
    const fechaCierre = estado === 'cerrado' ? new Date() : null;

    await ticketsCollection.updateOne(
      { id },
      { $set: { estado, fecha_cierre: fechaCierre } }
    );

    res.json({ mensaje: 'Ticket actualizado' });
  } catch (error) {
    console.error('Error:', error);
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
    const tickets = await ticketsCollection.find({}).toArray();

    const total = tickets.length;
    const abiertos = tickets.filter(t => t.estado === 'abierto').length;
    const en_proceso = tickets.filter(t => t.estado === 'en_proceso').length;
    const cerrados = tickets.filter(t => t.estado === 'cerrado').length;

    let horas_promedio = 0;
    const ticketsConCierre = tickets.filter(t => t.fecha_cierre);
    if (ticketsConCierre.length > 0) {
      const horas = ticketsConCierre.map(t => {
        const inicio = new Date(t.fecha_creacion);
        const fin = new Date(t.fecha_cierre);
        return (fin - inicio) / (1000 * 60 * 60);
      });
      horas_promedio = Math.round((horas.reduce((a, b) => a + b) / horas.length) * 100) / 100;
    }

    res.json({
      total,
      abiertos,
      en_proceso,
      cerrados,
      horas_promedio
    });
  } catch (error) {
    console.error('Error:', error);
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