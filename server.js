const express = require('express');
const { createClient } = require('@supabase/supabase-js');
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

// Supabase Client
const SUPABASE_URL = 'https://hklvofgfghubhopjzwwy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8P261h1SvzRBLX3ESA-tzA_w58EwQ5Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('Conectando a Supabase...');

// ==================== RUTAS API ====================

// 1. CREAR TICKET
app.post('/api/tickets', async (req, res) => {
  const { email, nombre, asunto, descripcion, prioridad } = req.body;
  const ticketId = uuidv4();

  if (!email || !nombre || !asunto || !descripcion) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    // Insertar ticket
    const { error: ticketError } = await supabase
      .from('tickets')
      .insert({
        id: ticketId,
        email,
        nombre,
        asunto,
        descripcion,
        prioridad: prioridad || 'normal'
      });

    if (ticketError) {
      console.error('Error insertando ticket:', ticketError);
      return res.status(500).json({ error: 'Error al crear ticket' });
    }

    // Insertar mensaje inicial
    const msgId = uuidv4();
    const { error: msgError } = await supabase
      .from('mensajes')
      .insert({
        id: msgId,
        ticket_id: ticketId,
        autor: nombre,
        tipo_autor: 'usuario',
        mensaje: descripcion
      });

    if (msgError) {
      console.error('Error insertando mensaje:', msgError);
    }

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
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (ticketError || !ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    const { data: mensajes, error: msgError } = await supabase
      .from('mensajes')
      .select('*')
      .eq('ticket_id', id)
      .order('fecha', { ascending: true });

    if (msgError) {
      console.error('Error obteniendo mensajes:', msgError);
      return res.status(500).json({ error: 'Error obteniendo mensajes' });
    }

    res.json({ ...ticket, mensajes: mensajes || [] });
  } catch (err) {
    console.error('Error obteniendo ticket:', err);
    res.status(500).json({ error: 'Error en la base de datos' });
  }
});

// 3. OBTENER TICKET POR EMAIL (usuario)
app.get('/api/tickets-usuario/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('id, email, nombre, asunto, estado, prioridad, fecha_creacion, fecha_cierre')
      .eq('email', email)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Error obteniendo tickets:', error);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    res.json(tickets || []);
  } catch (err) {
    console.error('Error:', err);
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
    const { error } = await supabase
      .from('mensajes')
      .insert({
        id: msgId,
        ticket_id,
        autor,
        tipo_autor: tipo_autor || 'usuario',
        mensaje
      });

    if (error) {
      console.error('Error insertando mensaje:', error);
      return res.status(500).json({ error: 'Error al agregar mensaje' });
    }

    res.json({ id: msgId, mensaje: 'Mensaje agregado' });
  } catch (err) {
    console.error('Error:', err);
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
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('id, email, nombre, asunto, estado, prioridad, fecha_creacion, fecha_cierre')
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Error obteniendo tickets:', error);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    res.json(tickets || []);
  } catch (err) {
    console.error('Error:', err);
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

    const { error } = await supabase
      .from('tickets')
      .update({
        estado,
        fecha_cierre: fechaCierre
      })
      .eq('id', id);

    if (error) {
      console.error('Error actualizando ticket:', error);
      return res.status(500).json({ error: 'Error actualizando ticket' });
    }

    res.json({ mensaje: 'Ticket actualizado' });
  } catch (err) {
    console.error('Error:', err);
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
    // Obtener todos los tickets para calcular estadísticas
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('estado, fecha_creacion, fecha_cierre');

    if (error) {
      console.error('Error obteniendo tickets:', error);
      return res.status(500).json({ error: 'Error en estadísticas' });
    }

    // Calcular estadísticas manualmente
    const total = tickets.length;
    const abiertos = tickets.filter(t => t.estado === 'abierto').length;
    const en_proceso = tickets.filter(t => t.estado === 'en_proceso').length;
    const cerrados = tickets.filter(t => t.estado === 'cerrado').length;

    // Calcular promedio de horas
    let horasPromedio = 0;
    const ticketsConCierre = tickets.filter(t => t.fecha_cierre);
    if (ticketsConCierre.length > 0) {
      const horas = ticketsConCierre.map(t => {
        const inicio = new Date(t.fecha_creacion);
        const fin = new Date(t.fecha_cierre);
        return (fin - inicio) / (1000 * 60 * 60);
      });
      horasPromedio = Math.round((horas.reduce((a, b) => a + b) / horas.length) * 100) / 100;
    }

    res.json({
      total,
      abiertos,
      en_proceso,
      cerrados,
      horas_promedio: horasPromedio
    });
  } catch (err) {
    console.error('Error:', err);
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