// API BASE URL
const API_URL = window.location.origin;
let adminToken = null;
let ticketDetalleActual = null;

// ==================== VERIFICACIÓN DE ADMIN ====================

function verificarAdmin() {
  const contraseña = document.getElementById('contraseña-admin').value;

  if (contraseña === 'admin123') {
    adminToken = 'admin123';
    localStorage.setItem('adminToken', adminToken);
    mostrarAdmin();
    cargarEstadisticas();
    cargarTickets();
  } else {
    alert('Contraseña incorrecta');
    document.getElementById('contraseña-admin').value = '';
  }
}

function cerrarSesion() {
  adminToken = null;
  localStorage.removeItem('adminToken');
  document.getElementById('contraseña-admin').value = '';
  mostrarLogin();
}

function mostrarLogin() {
  document.getElementById('seccion-login').classList.add('active');
  document.getElementById('seccion-admin').classList.remove('active');
  document.getElementById('seccion-detalle').classList.remove('active');
}

function mostrarAdmin() {
  document.getElementById('seccion-login').classList.remove('active');
  document.getElementById('seccion-admin').classList.add('active');
  document.getElementById('seccion-detalle').classList.remove('active');
}

function mostrarDetalle() {
  document.getElementById('seccion-login').classList.remove('active');
  document.getElementById('seccion-admin').classList.remove('active');
  document.getElementById('seccion-detalle').classList.add('active');
}

// Verificar si hay sesión guardada al cargar
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    adminToken = token;
    mostrarAdmin();
    cargarEstadisticas();
    cargarTickets();
  }
});

// ==================== CARGAR ESTADÍSTICAS ====================

async function cargarEstadisticas() {
  if (!adminToken) return;

  try {
    const response = await fetch(`${API_URL}/api/admin/estadisticas?token=${adminToken}`);
    const stats = await response.json();

    document.getElementById('stat-total').textContent = stats.total || 0;
    document.getElementById('stat-abiertos').textContent = stats.abiertos || 0;
    document.getElementById('stat-proceso').textContent = stats.en_proceso || 0;
    document.getElementById('stat-cerrados').textContent = stats.cerrados || 0;

    const horasPromedio = stats.horas_promedio || 0;
    const diasPromedio = (horasPromedio / 24).toFixed(1);
    document.getElementById('stat-promedio').textContent =
      `${horasPromedio.toFixed(1)} horas (${diasPromedio} días)`;
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
  }
}

// ==================== CARGAR TICKETS ====================

async function cargarTickets() {
  if (!adminToken) return;

  try {
    const response = await fetch(`${API_URL}/api/admin/tickets?token=${adminToken}`);
    const tickets = await response.json();

    const tabla = document.getElementById('tabla-tickets');

    if (tickets.length === 0) {
      tabla.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No hay tickets</td></tr>';
      return;
    }

    let html = '';

    tickets.forEach(ticket => {
      const estadoColor = ticket.estado === 'cerrado' ? 'success' :
                         ticket.estado === 'en_proceso' ? 'warning' : 'info';
      const prioridadColor = ticket.prioridad === 'alta' ? 'danger' :
                            ticket.prioridad === 'baja' ? 'success' : 'warning';

      const fechaFormato = new Date(ticket.fecha_creacion).toLocaleDateString('es-ES');

      html += `
        <tr>
          <td><strong>${ticket.id.substring(0, 8)}...</strong></td>
          <td>${ticket.nombre}</td>
          <td>${ticket.email}</td>
          <td>${ticket.asunto}</td>
          <td><span class="badge estado-${ticket.estado}">${ticket.estado.replace('_', ' ').toUpperCase()}</span></td>
          <td><span class="badge prioridad-${ticket.prioridad}">${ticket.prioridad.toUpperCase()}</span></td>
          <td>${fechaFormato}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="verDetalleTicket('${ticket.id}')">Ver</button>
          </td>
        </tr>
      `;
    });

    tabla.innerHTML = html;
  } catch (error) {
    console.error('Error cargando tickets:', error);
  }
}

// ==================== VER DETALLE DEL TICKET ====================

async function verDetalleTicket(ticketId) {
  if (!adminToken) return;

  try {
    const response = await fetch(`${API_URL}/api/tickets/${ticketId}`);
    const ticket = await response.json();

    if (!ticket.id) {
      alert('Ticket no encontrado');
      return;
    }

    ticketDetalleActual = ticket;

    // Mostrar información del ticket
    document.getElementById('titulo-detalle').textContent = `Ticket #${ticket.id.substring(0, 8)} - ${ticket.asunto}`;

    const estadoOptions = `
      <option value="abierto" ${ticket.estado === 'abierto' ? 'selected' : ''}>Abierto</option>
      <option value="en_proceso" ${ticket.estado === 'en_proceso' ? 'selected' : ''}>En Proceso</option>
      <option value="cerrado" ${ticket.estado === 'cerrado' ? 'selected' : ''}>Cerrado</option>
    `;

    const horasDesdeCreacion = calcularHoras(ticket.fecha_creacion);
    const horasHastaCierre = ticket.fecha_cierre ? calcularHoras(ticket.fecha_creacion, ticket.fecha_cierre) : '-';

    const contenido = `
      <div class="info-ticket">
        <div class="info-ticket-item">
          <span class="info-ticket-label">Estado:</span>
          <select class="form-select" id="select-estado" style="width: 150px;">
            ${estadoOptions}
          </select>
        </div>
        <div class="info-ticket-item">
          <span class="info-ticket-label">Prioridad:</span>
          <span class="badge prioridad-${ticket.prioridad}">${ticket.prioridad.toUpperCase()}</span>
        </div>
        <div class="info-ticket-item">
          <span class="info-ticket-label">Usuario:</span>
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
        <div class="info-ticket-item">
          <span class="info-ticket-label">Tiempo en sistema:</span>
          <span class="info-ticket-valor">${horasDesdeCreacion} horas</span>
        </div>
        ${ticket.fecha_cierre ? `
          <div class="info-ticket-item">
            <span class="info-ticket-label">Cerrado:</span>
            <span class="info-ticket-valor">${new Date(ticket.fecha_cierre).toLocaleString('es-ES')}</span>
          </div>
          <div class="info-ticket-item">
            <span class="info-ticket-label">Tiempo de resolución:</span>
            <span class="info-ticket-valor">${horasHastaCierre} horas</span>
          </div>
        ` : ''}
      </div>

      <div class="mt-3">
        <button class="btn btn-primary" onclick="guardarEstadoTicket('${ticket.id}')">Guardar Cambios</button>
      </div>
    `;

    document.getElementById('contenido-detalle').innerHTML = contenido;

    // Mostrar mensajes
    mostrarMensajesAdmin(ticket.mensajes || []);

    mostrarDetalle();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al obtener el ticket.');
  }
}

function calcularHoras(fecha1, fecha2) {
  const f1 = new Date(fecha1);
  const f2 = fecha2 ? new Date(fecha2) : new Date();
  const diferencia = f2 - f1;
  const horas = Math.round(diferencia / (1000 * 60 * 60));
  return horas;
}

function mostrarMensajesAdmin(mensajes) {
  const listaDiv = document.getElementById('lista-mensajes-admin');

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

// ==================== GUARDAR CAMBIOS ====================

async function guardarEstadoTicket(ticketId) {
  if (!adminToken) return;

  const nuevoEstado = document.getElementById('select-estado').value;

  try {
    const response = await fetch(`${API_URL}/api/admin/tickets/${ticketId}?token=${adminToken}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        estado: nuevoEstado
      })
    });

    if (response.ok) {
      alert('Ticket actualizado exitosamente');
      // Recargar datos
      cargarEstadisticas();
      cargarTickets();
      verDetalleTicket(ticketId);
    } else {
      alert('Error al actualizar el ticket');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión');
  }
}

// ==================== AGREGAR RESPUESTA ====================

async function agregarRespuesta() {
  if (!adminToken || !ticketDetalleActual) {
    alert('Error de autenticación');
    return;
  }

  const respuesta = document.getElementById('respuesta-mensaje').value.trim();

  if (!respuesta) {
    alert('Por favor escribe una respuesta');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/mensajes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticket_id: ticketDetalleActual.id,
        autor: 'Administrador',
        tipo_autor: 'admin',
        mensaje: respuesta
      })
    });

    if (response.ok) {
      document.getElementById('respuesta-mensaje').value = '';
      // Recargar el ticket para ver la nueva respuesta
      verDetalleTicket(ticketDetalleActual.id);
    } else {
      alert('Error al enviar la respuesta');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión');
  }
}

// Permitir Enter para enviar respuesta
document.addEventListener('DOMContentLoaded', () => {
  const inputRespuesta = document.getElementById('respuesta-mensaje');
  if (inputRespuesta) {
    inputRespuesta.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        agregarRespuesta();
      }
    });
  }
});
