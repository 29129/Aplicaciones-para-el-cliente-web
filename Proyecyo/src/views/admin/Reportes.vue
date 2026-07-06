<template>
  <div>
    <section class="page-heading">
      <div>
        <h2>Centro de reportes</h2>
        <p>Genera, consulta y exporta información institucional del sistema.</p>
      </div>
    </section>

    <!-- Resumen de reportes -->
    <section class="summary-grid reports-summary" aria-label="Resumen">
      <article class="summary-card report-summary-card">
        <span class="summary-label">Reportes generados</span>
        <strong>{{ totalReportes }}</strong>
        <small>En el historial</small>
      </article>
      <article class="summary-card report-summary-card">
        <span class="summary-label">Total estudiantes</span>
        <strong>{{ totalEstudiantes }}</strong>
        <small>Registrados</small>
      </article>
      <article class="summary-card report-summary-card">
        <span class="summary-label">Seguimientos</span>
        <strong>{{ totalSeguimientos }}</strong>
        <small>Registros académicos</small>
      </article>
      <article class="summary-card report-summary-card">
        <span class="summary-label">Usuarios activos</span>
        <strong>{{ totalUsuariosActivos }}</strong>
        <small>Con acceso al sistema</small>
      </article>
    </section>

    <!-- Plantillas de reporte -->
    <section class="report-template-grid">
      <article class="report-template-card">
        <div class="report-template-icon blue"><i class="fas fa-users"></i></div>
        <div>
          <h3>Estudiantes</h3>
          <p>Lista completa por carrera, estado y tipo de discapacidad.</p>
          <button class="primary-action report-template-action" @click="generarReporteDe('estudiantes')">Generar</button>
        </div>
      </article>
      <article class="report-template-card">
        <div class="report-template-icon green"><i class="fas fa-chart-line"></i></div>
        <div>
          <h3>Seguimiento académico</h3>
          <p>Notas, asistencia y estado académico de todos los registros.</p>
          <button class="primary-action report-template-action" @click="generarReporteDe('seguimiento')">Generar</button>
        </div>
      </article>
      <article class="report-template-card">
        <div class="report-template-icon amber"><i class="fas fa-wheelchair"></i></div>
        <div>
          <h3>Por discapacidad</h3>
          <p>Distribución por tipo de discapacidad y facultad.</p>
          <button class="primary-action report-template-action" @click="generarReporteDe('discapacidad')">Generar</button>
        </div>
      </article>
      <article class="report-template-card">
        <div class="report-template-icon purple"><i class="fas fa-user-cog"></i></div>
        <div>
          <h3>Usuarios del sistema</h3>
          <p>Listado de usuarios por rol, estado y fecha de registro.</p>
          <button class="primary-action report-template-action" @click="generarReporteDe('usuarios')">Generar</button>
        </div>
      </article>
    </section>

    <!-- Filtros del historial -->
    <section class="filters-section reports-filters" aria-label="Filtros del historial">
      <div class="search-field">
        <label for="rep-search">Buscar en historial</label>
        <div class="input-with-icon">
          <i class="fas fa-search" aria-hidden="true"></i>
          <input 
            type="search" 
            id="rep-search" 
            v-model="filtroBusqueda" 
            placeholder="Nombre o tipo de reporte..."
          />
        </div>
      </div>
      <div class="filter-field">
        <label for="rep-tipo-fil">Tipo</label>
        <select id="rep-tipo-fil" v-model="filtroTipo">
          <option value="">Todos</option>
          <option value="estudiantes">Estudiantes</option>
          <option value="seguimiento">Seguimiento</option>
          <option value="discapacidad">Discapacidad</option>
          <option value="usuarios">Usuarios</option>
        </select>
      </div>
      <button class="secondary-action" @click="limpiarFiltros" type="button" style="margin-top: 24px; height: 42px;">
        <i class="fas fa-eraser"></i> Limpiar
      </button>
    </section>

    <div class="reports-layout">
      <!-- Tabla historial -->
      <article class="table-section reports-table-section">
        <div class="section-title-row">
          <h2>Historial de reportes</h2>
          <span>{{ reportesFiltrados.length }} reportes</span>
        </div>
        <div style="overflow-x:auto">
          <table class="students-table reports-table">
            <thead>
              <tr>
                <th>Reporte</th>
                <th>Tipo</th>
                <th>Generado por</th>
                <th>Fecha</th>
                <th>Formato</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="reportesFiltrados.length === 0">
                <td colspan="7" class="empty-row" style="text-align:center; padding: 20px;">
                  No hay reportes generados aún. Usa las plantillas de arriba para crear uno.
                </td>
              </tr>
              <tr 
                v-for="rep in reportesFiltrados" 
                :key="rep.id"
              >
                <td>
                  <strong>{{ rep.nombre }}</strong>
                  <span style="display:block; font-size:12px; color:var(--text-muted);">{{ rep.descripcion }}</span>
                </td>
                <td>{{ rep.tipo }}</td>
                <td>{{ rep.generadoPor }}</td>
                <td>{{ formatearFecha(rep.fecha) }}</td>
                <td><span class="priority-badge low">{{ rep.formato }}</span></td>
                <td><span class="status active">Listo</span></td>
                <td>
                  <button class="action-btn view" @click="abrirVistaPrevia(rep)" title="Ver reporte"><i class="fas fa-eye"></i></button>
                  <button class="action-btn download" @click="descargarCSV(rep)" title="Descargar CSV"><i class="fas fa-download"></i></button>
                  <button class="action-btn delete" @click="confirmarEliminar(rep)" title="Eliminar reporte"><i class="fas fa-trash-alt"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <!-- Panel lateral -->
      <aside class="reports-side-panel">
        <article class="dashboard-panel">
          <h2>Formatos disponibles</h2>
          <div class="format-list" style="padding: 10px 20px; display:flex; flex-direction:column; gap:10px; font-size:13px; color:#374151;">
            <span><i class="fas fa-file-csv" style="color:var(--uleam-green); margin-right:8px;"></i> CSV (descarga directa)</span>
            <span><i class="fas fa-print" style="color:var(--uleam-green); margin-right:8px;"></i> HTML imprimible</span>
          </div>
        </article>
        <article class="dashboard-panel">
          <h2>Últimos reportes</h2>
          <div style="padding:14px 20px 18px">
            <p v-if="ultimosReportes.length === 0" style="color:#94a3b8;font-size:13px">Sin reportes recientes.</p>
            <div 
              v-for="rep in ultimosReportes" 
              :key="rep.id"
              style="padding:10px 0; border-bottom:1px solid #e5ebf2; display:flex; align-items:center; gap:10px"
            >
              <i class="fas fa-file-alt" style="color:var(--uleam-green); flex-shrink:0"></i>
              <div>
                <strong style="display:block; font-size:13px; color:#111827">{{ rep.nombre }}</strong>
                <span style="color:#94a3b8; font-size:11px">{{ formatearFecha(rep.fecha) }}</span>
              </div>
            </div>
          </div>
        </article>
      </aside>
    </div>

    <!-- Modal vista previa del reporte -->
    <div 
      v-if="modalRepVisible" 
      class="modal-overlay visible" 
      @click.self="modalRepVisible = false"
    >
      <div class="modal-box" style="max-width: 900px;">
        <div class="modal-header">
          <h3>{{ repActual.nombre }}</h3>
          <button class="modal-close" @click="modalRepVisible = false" aria-label="Cerrar"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="reporte-preview">
            <h2 style="color:var(--uleam-green); text-align:center; margin-bottom:4px">{{ repActual.nombre }}</h2>
            <p class="rep-sub" style="color:#64748b; text-align:center; font-size:12px; margin-bottom:16px">
              {{ repActual.descripcion }} &mdash; Generado el {{ formatearFechaDetalle(repActual.fecha) }} por {{ repActual.generadoPor }}
            </p>
            <div v-if="repActual.filas.length === 0" class="rep-vacio" style="text-align:center; color:#94a3b8; padding:24px;">
              <i class="fas fa-inbox" style="font-size:30px; display:block; margin-bottom:8px"></i>
              No hay datos en este reporte.
            </div>
            <div v-else style="overflow-x:auto">
              <table style="width:100%; border-collapse:collapse; font-size:13px;">
                <thead>
                  <tr>
                    <th 
                      v-for="c in repActual.columnas" 
                      :key="c"
                      style="background:#f8fafc; color:#374151; font-weight:700; padding:7px 10px; text-align:left; border-bottom:1px solid #e5ebf2;"
                    >
                      {{ c }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="(row, rIdx) in repActual.filas" 
                    :key="rIdx"
                  >
                    <td 
                      v-for="(val, cIdx) in row" 
                      :key="cIdx"
                      style="padding:7px 10px; text-align:left; border-bottom:1px solid #e5ebf2;"
                    >
                      {{ val }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p style="color:#94a3b8; font-size:12px; margin-top:12px; text-align:right">
                {{ repActual.filas.length }} registro{{ repActual.filas.length !== 1 ? 's' : '' }}
              </p>
            </div>
          </div>
        </div>
        <div class="modal-footer acciones-rep">
          <button type="button" class="secondary-action" @click="modalRepVisible = false">Cerrar</button>
          <button type="button" class="secondary-action" @click="descargarCSV(repActual)"><i class="fas fa-download"></i> CSV</button>
          <button type="button" class="primary-action" @click="imprimirReporte"><i class="fas fa-print"></i> Imprimir</button>
        </div>
      </div>
    </div>

    <!-- Modal confirmar eliminar reporte -->
    <div 
      v-if="repAEliminar" 
      class="modal-overlay visible" 
      @click.self="repAEliminar = null"
    >
      <div class="modal-box sm" style="max-width: 440px;">
        <div class="modal-header">
          <h3>Confirmar eliminación</h3>
          <button class="modal-close" @click="repAEliminar = null" aria-label="Cerrar"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="confirm-body">
            <div class="confirm-icon"><i class="fas fa-trash-alt"></i></div>
            <p>¿Está seguro que desea eliminar el reporte <strong>{{ repAEliminar.nombre }}</strong> del historial? Los datos del sistema no se verán afectados.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="secondary-action" @click="repAEliminar = null">Cancelar</button>
          <button type="button" class="danger-action" @click="eliminarReporteConfirmado">
            <i class="fas fa-trash-alt"></i> Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  obtenerReportes, 
  obtenerEstudiantes, 
  obtenerSeguimientos, 
  obtenerUsuarios, 
  obtenerSesion, 
  obtenerConfig, 
  obtenerEstudiantePorId,
  crearReporte, 
  eliminarReporte 
} from '../../services/storage.js';
import { 
  formatearFecha, 
  normalizarTexto 
} from '../../utils/helpers.js';
import { showToast } from '../../services/toast.js';

const reportes = ref([]);
const estudiantesCount = ref(0);
const seguimientosCount = ref(0);
const usuariosActivosCount = ref(0);

const filtroBusqueda = ref('');
const filtroTipo = ref('');

// Modales
const modalRepVisible = ref(false);
const repActual = ref(null);
const repAEliminar = ref(null);

onMounted(() => {
  cargarTodo();
});

function cargarTodo() {
  reportes.value = obtenerReportes();
  estudiantesCount.value = obtenerEstudiantes().length;
  seguimientosCount.value = obtenerSeguimientos().length;
  usuariosActivosCount.value = obtenerUsuarios().filter(u => u.activo).length;
}

const totalReportes = computed(() => reportes.value.length);
const totalEstudiantes = computed(() => estudiantesCount.value);
const totalSeguimientos = computed(() => seguimientosCount.value);
const totalUsuariosActivos = computed(() => usuariosActivosCount.value);

const reportesFiltrados = computed(() => {
  let list = reportes.value;
  const busq = normalizarTexto(filtroBusqueda.value.trim());
  const tipo = filtroTipo.value;

  return list.filter(r =>
    (!busq || normalizarTexto(r.nombre + ' ' + r.tipo).includes(busq)) &&
    (!tipo || r.tipo === tipo)
  );
});

const ultimosReportes = computed(() => {
  return [...reportes.value]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 4);
});

function limpiarFiltros() {
  filtroBusqueda.value = '';
  filtroTipo.value = '';
}

// Generar Datos de Reporte
function generarDatosDeReporte(tipo) {
  const sesion = obtenerSesion();
  const autor = sesion ? `${sesion.nombres} ${sesion.apellidos}` : 'Administrador';
  const config = obtenerConfig();
  const periodo = config.periodoActivo || '—';
  let columnas = [], filas = [], nombre = '', descripcion = '';

  if (tipo === 'estudiantes') {
    nombre = 'Reporte de Estudiantes';
    descripcion = `Listado completo — Periodo ${periodo}`;
    columnas = ['Nombre', 'Cédula', 'Facultad', 'Carrera', 'Semestre', 'Discapacidad', 'Grado %', 'Estado', 'Riesgo'];
    filas = obtenerEstudiantes().map(e => [
      `${e.nombres} ${e.apellidos}`, e.cedula, e.facultad || '—', e.carrera || '—',
      e.semestre || '—', e.tipoDiscapacidad || '—', e.gradoDiscapacidad !== null ? e.gradoDiscapacidad + '%' : '—', e.estado || '—', e.nivelRiesgo || '—'
    ]);
  } else if (tipo === 'seguimiento') {
    nombre = 'Reporte de Seguimiento Académico';
    descripcion = `Registros académicos — Periodo ${periodo}`;
    columnas = ['Estudiante', 'Asignatura', 'Docente', 'Nota', 'Asistencia %', 'Estado Acad.', 'Fecha'];
    filas = obtenerSeguimientos().map(s => {
      const est = obtenerEstudiantePorId(s.estudianteId);
      const doc = s.docenteId ? obtenerUsuarios().find(u => u.id === s.docenteId) : null;
      return [
        est ? `${est.nombres} ${est.apellidos}` : '—',
        s.asignatura || '—',
        doc ? `${doc.nombres} ${doc.apellidos}` : 'Administrador',
        s.nota !== null ? s.nota : '—',
        s.asistencia !== null ? s.asistencia + '%' : '—',
        s.estadoAcademico || '—',
        formatearFecha(s.fecha)
      ];
    });
  } else if (tipo === 'discapacidad') {
    nombre = 'Distribución por Tipo de Discapacidad';
    descripcion = 'Agrupado por tipo y facultad';
    columnas = ['Tipo de Discapacidad', 'Cantidad', 'Facultades'];
    const conteo = {};
    obtenerEstudiantes().forEach(e => {
      const t = e.tipoDiscapacidad || 'Sin especificar';
      if (!conteo[t]) conteo[t] = { cantidad: 0, facultades: new Set() };
      conteo[t].cantidad++;
      if (e.facultad) conteo[t].facultades.add(e.facultad);
    });
    filas = Object.entries(conteo).map(([tipo, d]) => [
      tipo, d.cantidad, [...d.facultades].join(', ') || '—'
    ]);
  } else if (tipo === 'usuarios') {
    nombre = 'Reporte de Usuarios del Sistema';
    descripcion = 'Listado por rol y estado';
    columnas = ['Nombre', 'Correo', 'Rol', 'Estado', 'Fecha Registro'];
    filas = obtenerUsuarios().map(u => [
      `${u.nombres} ${u.apellidos}`, u.correo,
      u.rol.charAt(0).toUpperCase() + u.rol.slice(1),
      u.activo ? 'Activo' : 'Inactivo',
      formatearFecha(u.fechaCreacion)
    ]);
  }

  return { tipo, nombre, descripcion, columnas, filas, generadoPor: autor };
}

function generarReporteDe(tipo) {
  const datos = generarDatosDeReporte(tipo);
  const res = crearReporte(datos);
  if (res.exito) {
    cargarTodo();
    showToast(res.mensaje);
    abrirVistaPrevia(res.reporte);
  }
}

function abrirVistaPrevia(reporte) {
  repActual.value = reporte;
  modalRepVisible.value = true;
}

function formatearFechaDetalle(fechaISO) {
  if (!fechaISO) return '';
  const date = new Date(fechaISO);
  return date.toLocaleDateString('es-EC', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// Descargar CSV
function descargarCSV(reporte) {
  if (!reporte.filas.length) {
    showToast('El reporte no tiene datos para exportar.', 'info');
    return;
  }
  const encabezado = reporte.columnas.map(c => `"${c}"`).join(',');
  const rows = reporte.filas.map(f => f.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const csv = '\uFEFF' + encabezado + '\n' + rows;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${reporte.tipo}_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('CSV descargado correctamente.');
}

function imprimirReporte() {
  window.print();
}

function confirmarEliminar(rep) {
  repAEliminar.value = rep;
}

function eliminarReporteConfirmado() {
  if (repAEliminar.value) {
    const res = eliminarReporte(repAEliminar.value.id);
    if (res.exito) {
      showToast(res.mensaje);
      repAEliminar.value = null;
      cargarTodo();
    } else {
      showToast(res.mensaje, 'error');
    }
  }
}
</script>
