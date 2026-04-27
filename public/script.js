const API_URL = window.location.origin;

// Crear Ticket
document.getElementById('form-ticket').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const nombre = document.getElementById('nombre').value;
  const asunto = document.getElementById('asunto').value;
  const descripcion = document.getElementById('descripcion').value;
  const prioridad = document.getElementById('prioridad').value;

  try {
    const response = await fetch(`${API_URL}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, nombre, asunto, descripcion, prioridad })
    });

    const data = await response.json();

    if (data.id) {
      alert(`Ticket creado exitosamente\nID: ${data.id}\nGuarda este ID para seguimiento`);
      document.getElementById('form-ticket').reset();
    } else {
      alert('Error al crear ticket');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al crear ticket');
  }
});

// Buscar Tickets por Email
document.getElementById('form-buscar').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email-buscar').value;

  try {
    const response = await fetch(`${API_URL}/api/tickets-usuario/${encodeURIComponent(email)}`);
    const tickets = await response.json();

    const listaDiv = document.getElementById('lista-tickets');
    listaDiv.innerHTML = '';

    if (tickets.length === 0) {
      listaDiv.innerHTML = '<p>No hay tickets para este email</p>';
      return;
    }

    tickets.forEach(ticket => {
      const div = document.createElement('div');
      div.className = 'ticket-item';
      div.innerHTML = `
        <p><strong>ID:</strong> ${ticket.id}</p>
        <p><strong>Asunto:</strong> ${ticket.asunto}</p>
        <p><strong>Estado:</strong> ${ticket.estado}</p>
        <p><strong>Fecha:</strong> ${new Date(ticket.fecha_creacion).toLocaleString()}</p>
        <button onclick="verDetalles('${ticket.id}')">Ver Detalles</button>
      `;
      listaDiv.appendChild(div);
    });
  } catch (error) {
    console.error('Error:', error);
    alert('Error al buscar tickets');
  }
});

// Ver Detalles del Ticket
async function verDetalles(ticketId) {
  try {
    const response = await fetch(`${API_URL}/api/tickets/${ticketId}`);
    const ticket = await response.json();

    const detallesDiv = document.getElementById('detalles-ticket');
    detallesDiv.innerHTML = `
      <h3>Detalles del Ticket ${ticketId}</h3>
      <p><strong>Email:</strong> ${ticket.email}</p>
      <p><strong>Nombre:</strong> ${ticket.nombre}</p>
      <p><strong>Asunto:</strong> ${ticket.asunto}</p>
      <p><strong>Descripción:</strong> ${ticket.descripcion}</p>
      <p><strong>Estado:</strong> ${ticket.estado}</p>
      <p><strong>Prioridad:</strong> ${ticket.prioridad}</p>
      
      <h4>Mensajes</h4>
      <div id="mensajes-list"></div>
      
      <h4>Agregar Comentario</h4>
      <input type="text" id="nuevo-mensaje" placeholder="Tu comentario...">
      <button onclick="agregarMensaje('${ticketId}')">Enviar</button>
    `;

    const mensajesDiv = document.getElementById('mensajes-list');
    if (ticket.mensajes && ticket.mensajes.length > 0) {
      ticket.mensajes.forEach(msg => {
        const p = document.createElement('p');
        p.innerHTML = `<strong>${msg.autor}:</strong> ${msg.mensaje}`;
        mensajesDiv.appendChild(p);
      });
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al obtener detalles');
  }
}

// Agregar Mensaje
async function agregarMensaje(ticketId) {
  const mensaje = document.getElementById('nuevo-mensaje').value;

  if (!mensaje) {
    alert('Escribe un mensaje');
    return;
  }

  try {
    await fetch(`${API_URL}/api/mensajes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticket_id: ticketId,
        autor: 'Usuario',
        tipo_autor: 'usuario',
        mensaje: mensaje
      })
    });

    document.getElementById('nuevo-mensaje').value = '';
    verDetalles(ticketId);
  } catch (error) {
    console.error('Error:', error);
    alert('Error al enviar mensaje');
  }
}