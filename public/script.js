// API BASE URL
const API_URL = window.location.origin;
let ticketActual = null;

// ==================== FUNCIONES DE NAVEGACIÓN ====================

function mostrarSeccion(seccion) {
  // Ocultar todas las secciones
  document.querySelectorAll('.seccion').forEach(el => {
    el.classList.remove('active');
  });

  // Mostrar la sección seleccionada
  const elemento = document.getElementById(`seccion-${seccion}`);
  if (elemento) {
    elemento.classList.add('active');
  }
}

// ==================== CREAR TICKET ====================

document.getElementById('formulario-ticket').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const asunto = document.getElementById('asunto').value;
  const descripcion = document.getElementById('descripcion').value;
  const prioridad = document.getElementById('prioridad').value;

  try {
    const response = await fetch(`${API_URL}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre,
        email,
        asunto,
        descripcion,
        prioridad
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Mostrar mensaje de éxito
      const mensajeDiv = document.getElementById('mensaje-exito');
      mensajeDiv.innerHTML = `
  <strong>¡Ticket creado exitosamente!</strong><br>
  ID del Ticket: <strong>${data.id}</strong><br>
  Para darle seguimiento a tu ticket, entra al apartado de <strong>Mis Tickets</strong> con tu cuenta de correo: <strong>${email}</strong>
`;
      `;
      mensajeDiv.style.display = 'block';

      // Limpiar formulario
      document.getElementById('formulario-ticket').reset();

      // Scroll al mensaje de éxito
      setTimeout(() => {
        mensajeDiv.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      alert('Error al crear el ticket: ' + (data.error || 'Error desconocido'));
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión. Intenta nuevamente.');
  }
});

// ==================== BUSCAR TICKETS ====================

async function buscarTickets() {
  const email = document.getElementById('email-buscar').value;

  if (!email) {
    alert('Por favor ingresa tu correo electrónico');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/tickets-usuario/${encodeURIComponent(email)}`);
    const tickets = await response.json();

    const listaDiv = document.getElementById('lista-tickets');

    if (tickets.length === 0) {
      listaDiv.innerHTML = '<div class="alert alert-warning">No se encontraron tickets para este email.</div>';
      return;
    }

    let html = '<div class="list-group">';

    tickets.forEach(ticket => {
      const estado = ticket.estado === 'cerrado' ? '✅' : ticket.estado === 'en_proceso' ? '⏳' : '📋';
      const fechaFormato = new Date(ticket.fecha_creacion).toLocaleDateString('es-ES');

      html += `
        <button type="button" class="list-group-item list-group-item-action" onclick="verTicket('${ticket.id}')">
          <div class="d-flex w-100 justify-content-between">
            <h6 class="mb-1">${estado} ${ticket.asunto}</h6>
            <span class="badge estado-${ticket.estado}">${ticket.estado.replace('_', ' ').toUpperCase()}</span>
          </div>
          <p class="mb-1"><strong>ID:</strong> ${ticket.id.substring(0, 8)}...</p>
          <small class="text-muted">Creado: ${fechaFormato}</small>
        </button>
      `;
    });

    html += '</div>';
    listaDiv.innerHTML = html;
  } catch (error) {
    console.error('Error:', error);
    alert('Error al buscar tickets.');
  }
}

// ==================== VER TICKET DETALLADO ====================

async function verTicket(ticketId) {
  try {
    const response = await fetch(`${API_URL}/api/tickets/${ticketId}`);
    const ticket = await response.json();

    if (!ticket.id) {
      alert('Ticket no encontrado');
      return;
    }

    ticketActual = ticket;

    // Mostrar información del ticket
    const estadoColor = ticket.estado === 'cerrado' ? 'success' : ticket.estado === 'en_proceso' ? 'warning' : 'info';
    const prioridadColor = ticket.prioridad === 'alta' ? 'danger' : ticket.prioridad === 'baja' ? 'success' : 'warning';

    document.getElementById('titulo-ticket').textContent = `Ticket #${ticket.id.substring(0, 8)} - ${ticket.asunto}`;

    const contenido = `
      <div class="info-ticket">
        <div class="info-ticket-item">
          <span class="info-ticket-label">Estado:</span>
          <span class="badge estado-${ticket.estado}">${ticket.estado.replace('_', ' ').toUpperCase()}</span>
        </div>
        <div class="info-ticket-item">
          <span class="info-ticket-label">Prioridad:</span>
          <span class="badge prioridad-${ticket.prioridad}">${ticket.prioridad.toUpperCase()}</span>
        </div>
        <div class="info-ticket-item">
          <span class="info-ticket-label">Nombre:</span>
          <span class="info-ticket-valor">${ticket.nombre}</span>
        </div>
        <div class="info-ticket-item">
          <span class="info-ticket-label">Email:</span>
          <span class="info-ticket-valor">${ticket.email}</span>
        </div>
        <div class="info-ticket-item">
          <span class="info-ticket-label">Creado:</span>
          <span class="info-ticket-valor">${new Date(ticket.fecha_creacion).toLocaleString('es-ES')}</span>
        </div>
        ${ticket.fecha_cierre ? `
          <div class="info-ticket-item">
            <span class="info-ticket-label">Cerrado:</span>
            <span class="info-ticket-valor">${new Date(ticket.fecha_cierre).toLocaleString('es-ES')}</span>
          </div>
        ` : ''}
      </div>
    `;

    document.getElementById('contenido-ticket').innerHTML = contenido;

    // Mostrar mensajes
    mostrarMensajes(ticket.mensajes || []);

    // Habilitar/deshabilitar entrada de mensajes según estado
    const inputMensaje = document.getElementById('nuevo-mensaje');
    if (ticket.estado === 'cerrado') {
      inputMensaje.disabled = true;
      inputMensaje.placeholder = 'Ticket cerrado - No se pueden agregar mensajes';
    } else {
      inputMensaje.disabled = false;
      inputMensaje.placeholder = 'Escribe tu mensaje...';
    }

    mostrarSeccion('ticket');
  } catch (error) {
    console.error('Error:', error);
    alert('Error al obtener el ticket.');
  }
}

function mostrarMensajes(mensajes) {
  const listaDiv = document.getElementById('lista-mensajes');

  if (mensajes.length === 0) {
    listaDiv.innerHTML = '<p class="text-muted">No hay mensajes aún.</p>';
    return;
  }

  let html = '';

  mensajes.forEach(msg => {
    const tipoClase = msg.tipo_autor === 'admin' ? 'admin' : 'usuario';
    const fechaFormato = new Date(msg.fecha).toLocaleString('es-ES');

    html += `
      <div class="mensaje ${tipoClase}">
        <div style="flex-grow: 1;">
          <div class="mensaje-autor">
            ${msg.tipo_autor === 'admin' ? '🛡️ ' : '👤 '}${msg.autor}
            <span class="ms-2">
              <span class="mensaje-fecha">${fechaFormato}</span>
            </span>
          </div>
          <div class="mensaje-contenido">${msg.mensaje}</div>
        </div>
      </div>
    `;
  });

  listaDiv.innerHTML = html;

  // Auto scroll al último mensaje
  setTimeout(() => {
    listaDiv.scrollTop = listaDiv.scrollHeight;
  }, 100);
}

// ==================== AGREGAR MENSAJE ====================

async function agregarMensaje() {
  if (!ticketActual) {
    alert('No hay ticket seleccionado');
    return;
  }

  const mensaje = document.getElementById('nuevo-mensaje').value.trim();

  if (!mensaje) {
    alert('Por favor escribe un mensaje');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/mensajes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticket_id: ticketActual.id,
        autor: ticketActual.nombre,
        tipo_autor: 'usuario',
        mensaje: mensaje
      })
    });

    if (response.ok) {
      document.getElementById('nuevo-mensaje').value = '';
      // Recargar el ticket para ver el nuevo mensaje
      verTicket(ticketActual.id);
    } else {
      alert('Error al enviar el mensaje');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión');
  }
}

// Permitir Enter para enviar mensaje
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('nuevo-mensaje').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      agregarMensaje();
    }
  });
});
