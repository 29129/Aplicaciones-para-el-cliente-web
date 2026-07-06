<template>
  <div>
    <section class="page-heading">
      <div>
        <h2>Seguimiento de estudiantes</h2>
        <p>Vista global de registros académicos, notas, asistencia y observaciones.</p>
      </div>
      <button class="primary-action" @click="abrirNuevoSeguimiento" type="button">
        <i class="fas fa-plus"></i>
        Nuevo seguimiento
      </button>
    </section>

    <!-- Tarjetas Resumen -->
    <section class="summary-grid tracking-summary" aria-label="Resumen">
      <article class="summary-card tracking-card">
        <span class="summary-label">Total registros</span>
        <strong>{{ totalRegistros }}</strong>
        <small>Todos los periodos</small>
      </article>
      <article class="summary-card tracking-card">
        <span class="summary-label">Este periodo</span>
        <strong>{{ registrosEstePeriodo }}</strong>
        <small>Periodo {{ periodoActivo }}</small>
      </article>
      <article class="summary-card tracking-card">
        <span class="summary-label">En riesgo</span>
        <strong>{{ totalEnRiesgo }}</strong>
        <small>Estado académico crítico</small>
      </article>
      <article class="summary-card tracking-card">
        <span class="summary-label">Estudiantes con seguimiento</span>
        <strong>{{ totalEstudiantesConSeguimiento }}</strong>
        <small>Tienen al menos 1 registro</small>
      </article>
    </section>

    <!-- Filtros -->
    <section class="filters-section tracking-filters" aria-label="Filtros">
      <div class="search-field">
        <label for="seg-search">Buscar</label>
        <div class="input-with-icon">
          <i class="fas fa-search" aria-hidden="true"></i>
          <input 
            type="search" 
            id="seg-search" 
            v-model="filtroBusqueda" 
            placeholder="Nombre, cédula o asignatura"
          />
        </div>
      </div>
      <div class="filter-field">
        <label for="seg-docente-filter">Docente</label>
        <select id="seg-docente-filter" v-model="filtroDocente">
          <option value="">Todos</option>
          <option v-for="d in docentes" :key="d.id" :value="d.id">
            {{ d.nombres }} {{ d.apellidos }}
          </option>
        </select>
      </div>
      <div class="filter-field">
        <label for="seg-estado-filter">Estado académico</label>
        <select id="seg-estado-filter" v-model="filtroEstado">
          <option value="">Todos</option>
          <option value="Bueno">Bueno</option>
          <option value="Regular">Regular</option>
          <option value="En riesgo">En riesgo</option>
        </select>
      </div>
      <button class="secondary-action" @click="limpiarFiltros" type="button" style="margin-top: 24px; height: 42px;">
        <i class="fas fa-eraser"></i> Limpiar
      </button>
    </section>

    <div class="tracking-layout">
      <!-- Tabla principal -->
      <article class="table-section tracking-table-section">
        <div class="section-title-row">
          <h2>Registros de seguimiento</h2>
          <span>{{ registrosFiltrados.length }} registros</span>
        </div>
        <div style="overflow-x:auto">
          <table class="students-table tracking-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Asignatura</th>
                <th>Docente</th>
                <th>Nota</th>
                <th>Asistencia</th>
                <th>Estado acad.</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="registrosFiltrados.length === 0">
                <td colspan="8" class="empty-row" style="text-align:center; padding: 20px;">
                  No se encontraron registros de seguimiento.
                </td>
              </tr>
              <tr 
                v-for="seg in registrosFiltrados" 
                :key="seg.id"
              >
                <td>
                  <strong>{{ getEstudianteNombre(seg.estudianteId) }}</strong>
                </td>
                <td>{{ seg.asignatura }}</td>
                <td>{{ getDocenteNombre(seg.docenteId) }}</td>
                <td>{{ seg.nota !== null ? seg.nota.toFixed(1) : '—' }}</td>
                <td>
                  <span v-if="seg.asistencia !== null" class="seg-chip asist" :style="seg.asistencia < 75 ? 'background:#ffe1e6;color:#b42335' : ''">
                    {{ seg.asistencia }}%
                  </span>
                  <span v-else>—</span>
                </td>
                <td>
                  <span class="seg-chip" :class="claseSegEstado(seg.estadoAcademico)">
                    {{ seg.estadoAcademico }}
                  </span>
                </td>
                <td>{{ formatearFecha(seg.fecha) }}</td>
                <td>
                  <button class="action-btn view" @click="verHistorialEstudiante(seg.estudianteId)" title="Ver historial del estudiante">
                    <i class="fas fa-history"></i>
                  </button>
                  <button class="action-btn edit" @click="editarSeguimiento(seg)" title="Editar registro">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn delete" @click="confirmarEliminar(seg)" title="Eliminar registro">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <!-- Panel lateral -->
      <aside class="tracking-side-panel">
        <article class="dashboard-panel">
          <h2>Últimos registros</h2>
          <div class="timeline-list">
            <p v-if="ultimosSeguimientos.length === 0" style="padding:14px 20px;color:#94a3b8;font-size:13px">Sin registros.</p>
            <div 
              v-for="seg in ultimosSeguimientos" 
              :key="seg.id" 
              class="recent-person"
              style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;"
            >
              <div>
                <strong style="font-size: 13px; display:block;">{{ getEstudianteNombre(seg.estudianteId) }}</strong>
                <span style="font-size: 11px; color:#64748b;">{{ seg.asignatura }} — {{ getDocenteNombre(seg.docenteId) }}</span>
              </div>
              <time style="font-size: 11px; color:#94a3b8;">{{ formatearFecha(seg.fecha) }}</time>
            </div>
          </div>
        </article>

        <article class="dashboard-panel">
          <h2>Alertas académicas</h2>
          <div class="alert-list">
            <p v-if="alertasAcademicas.length === 0" style="padding:14px 20px;color:#94a3b8;font-size:13px">Sin alertas.</p>
            <div 
              v-for="alerta in alertasAcademicas" 
              :key="alerta.id" 
              class="alerta-card"
              :class="alerta.tipo === 'riesgo' ? 'danger' : 'medium'"
              style="display:flex; gap:12px; align-items:flex-start; padding:12px 14px; border-radius:8px; margin-bottom:10px; font-size:13px;"
              :style="alerta.tipo === 'riesgo' ? 'background:#fff1f2;color:#b42335' : 'background:#fff8e1;color:#9a5c00'"
            >
              <i class="fas fa-exclamation-triangle" style="margin-top:2px; flex-shrink:0;"></i>
              <div>
                <strong>{{ alerta.nombre }}</strong>
                <span>{{ alerta.motivo }}</span>
              </div>
            </div>
          </div>
        </article>
      </aside>
    </div>

    <!-- MODAL NUEVO / EDITAR SEGUIMIENTO -->
    <div 
      v-if="modalSegVisible" 
      class="modal-overlay visible" 
      @click.self="cerrarModalSeg"
    >
      <div class="modal-box">
        <div class="modal-header">
          <h3>{{ editandoSegId ? 'Editar seguimiento' : 'Nuevo seguimiento' }}</h3>
          <button class="modal-close" @click="cerrarModalSeg" aria-label="Cerrar"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarSeguimientoForm" novalidate>
            <div class="mf-grid">
              <div class="mf-field required full" :class="{ 'is-invalid': errors.estudianteId }">
                <label>Estudiante</label>
                <select v-model="formSeg.estudianteId" :disabled="editandoSegId">
                  <option value="">Seleccionar...</option>
                  <option v-for="e in estudiantes" :key="e.id" :value="e.id">
                    {{ e.nombres }} {{ e.apellidos }} ({{ e.cedula }})
                  </option>
                </select>
                <span class="mf-error" v-if="errors.estudianteId">{{ errors.estudianteId }}</span>
              </div>
              <div class="mf-field full">
                <label>Docente responsable</label>
                <select v-model="formSeg.docenteId">
                  <option value="">Sin asignar</option>
                  <option v-for="d in docentes" :key="d.id" :value="d.id">
                    {{ d.nombres }} {{ d.apellidos }}
                  </option>
                </select>
              </div>
              <div class="mf-field required" :class="{ 'is-invalid': errors.asignatura }">
                <label>Asignatura</label>
                <input type="text" v-model="formSeg.asignatura" placeholder="Ej: Matemáticas">
                <span class="mf-error" v-if="errors.asignatura">{{ errors.asignatura }}</span>
              </div>
              <div class="mf-field required" :class="{ 'is-invalid': errors.periodo }">
                <label>Periodo</label>
                <input type="text" v-model="formSeg.periodo" placeholder="Ej: 2026-1">
                <span class="mf-error" v-if="errors.periodo">{{ errors.periodo }}</span>
              </div>
              <div class="mf-field" :class="{ 'is-invalid': errors.nota }">
                <label>Nota (0-10)</label>
                <input type="number" v-model.number="formSeg.nota" min="0" max="10" step="0.1" placeholder="Ej: 8.5">
                <span class="mf-error" v-if="errors.nota">{{ errors.nota }}</span>
              </div>
              <div class="mf-field" :class="{ 'is-invalid': errors.asistencia }">
                <label>Asistencia (%)</label>
                <input type="number" v-model.number="formSeg.asistencia" min="0" max="100" placeholder="Ej: 85">
                <span class="mf-error" v-if="errors.asistencia">{{ errors.asistencia }}</span>
              </div>
              <div class="mf-field required">
                <label>Estado académico</label>
                <select v-model="formSeg.estadoAcademico">
                  <option value="Bueno">Bueno</option>
                  <option value="Regular">Regular</option>
                  <option value="En riesgo">En riesgo</option>
                </select>
              </div>
              <div class="mf-field full">
                <label>Observaciones</label>
                <textarea v-model="formSeg.observaciones" placeholder="Descripción del seguimiento..."></textarea>
              </div>
              <div class="mf-field full">
                <label>Comentarios adicionales</label>
                <textarea v-model="formSeg.comentarios" placeholder="Notas internas o coordinación con bienestar..."></textarea>
              </div>
            </div>
            <!-- Submit trigger button is form-based, but we handle it manually in footer for alignment -->
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="secondary-action" @click="cerrarModalSeg">Cancelar</button>
          <button type="button" class="primary-action" @click="guardarSeguimientoForm">
            <i class="fas fa-save"></i> Guardar
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL HISTORIAL COMPLETO DE UN ESTUDIANTE -->
    <div 
      v-if="modalHistorialVisible" 
      class="modal-overlay visible" 
      @click.self="modalHistorialVisible = false"
    >
      <div class="modal-box">
        <div class="modal-header">
          <h3>Historial de seguimiento</h3>
          <button class="modal-close" @click="modalHistorialVisible = false" aria-label="Cerrar"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="ficha-header" v-if="historialEstudiante">
            <div class="ficha-avatar">
              {{ obtenerIniciales(historialEstudiante.nombres, historialEstudiante.apellidos) }}
            </div>
            <div>
              <strong>{{ nombreCompleto(historialEstudiante) }}</strong>
              <span>Carrera: {{ historialEstudiante.carrera }} — {{ historialEstudiante.estado }}</span>
            </div>
          </div>
          <div class="seg-timeline">
            <p v-if="historialRegistros.length === 0" style="color:#64748b; font-size:14px; text-align:center; padding:15px 0;">
              No hay registros para este estudiante.
            </p>
            <div 
              v-for="r in historialRegistros" 
              :key="r.id"
              class="seg-titem"
            >
              <span class="seg-titem-fecha">{{ formatearFecha(r.fecha) }}</span>
              <div class="seg-titem-body">
                <strong>{{ r.asignatura }} — {{ getDocenteNombre(r.docenteId) }}</strong>
                <p style="font-size: 13px; margin: 4px 0; color: #374151;">{{ r.observaciones || 'Sin observaciones detalladas.' }}</p>
                <p v-if="r.comentarios" style="font-size:12px; font-style:italic; color:#64748b; margin-top:2px;">Comentario: {{ r.comentarios }}</p>
                <div class="seg-meta">
                  <span class="seg-chip nota" v-if="r.nota !== null">Nota: {{ r.nota.toFixed(1) }}</span>
                  <span class="seg-chip asist" v-if="r.asistencia !== null" :style="r.asistencia < 75 ? 'background:#ffe1e6;color:#b42335' : ''">
                    Asistencia: {{ r.asistencia }}%
                  </span>
                  <span class="seg-chip" :class="claseSegEstado(r.estadoAcademico)">{{ r.estadoAcademico }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="secondary-action" @click="modalHistorialVisible = false">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- MODAL CONFIRMAR ELIMINAR -->
    <div 
      v-if="segAEliminar" 
      class="modal-overlay visible" 
      @click.self="segAEliminar = null"
    >
      <div class="modal-box modal-sm">
        <div class="modal-header">
          <h3>Confirmar eliminación</h3>
          <button class="modal-close" @click="segAEliminar = null" aria-label="Cerrar"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="confirm-body">
            <div class="confirm-icon"><i class="fas fa-trash-alt"></i></div>
            <p>¿Está seguro que desea eliminar este registro de seguimiento de <strong>{{ getEstudianteNombre(segAEliminar.estudianteId) }}</strong> en la materia <strong>{{ segAEliminar.asignatura }}</strong>?</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="secondary-action" @click="segAEliminar = null">Cancelar</button>
          <button type="button" class="danger-action" @click="eliminarSeguimientoConfirmado">
            <i class="fas fa-trash-alt"></i> Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { 
  obtenerSeguimientos, 
  obtenerEstudiantes, 
  obtenerUsuarios, 
  obtenerConfig, 
  crearSeguimiento, 
  actualizarSeguimiento, 
  eliminarSeguimiento,
  ROLES 
} from '../../services/storage.js';
import { 
  formatearFecha, 
  normalizarTexto, 
  obtenerIniciales, 
  nombreCompleto 
} from '../../utils/helpers.js';
import { showToast } from '../../services/toast.js';
import { Validaciones } from '../../services/validaciones.js';

const route = useRoute();

const seguimientos = ref([]);
const estudiantes = ref([]);
const docentes = ref([]);
const config = ref({});

const filtroBusqueda = ref('');
const filtroDocente = ref('');
const filtroEstado = ref('');
const periodoActivo = ref('2026-1');

// Modales
const modalSegVisible = ref(false);
const editandoSegId = ref(null);
const modalHistorialVisible = ref(false);
const historialEstudiante = ref(null);
const historialRegistros = ref([]);
const segAEliminar = ref(null);

const formSeg = ref({
  estudianteId: '',
  docenteId: '',
  asignatura: '',
  periodo: '2026-1',
  nota: null,
  asistencia: null,
  estadoAcademico: 'Regular',
  observaciones: '',
  comentarios: ''
});

const errors = ref({
  estudianteId: '',
  asignatura: '',
  periodo: '',
  nota: '',
  asistencia: ''
});

onMounted(() => {
  cargarTodo();

  // Si viene con un parámetro de estudiante en la URL (?est=id)
  const estId = route.query.est;
  if (estId) {
    const estudianteExiste = estudiantes.value.some(e => e.id === estId);
    if (estudianteExiste) {
      // Filtrar tabla por ese estudiante
      const est = estudiantes.value.find(e => e.id === estId);
      if (est) {
        filtroBusqueda.value = est.nombres;
      }
    }
  }
});

function cargarTodo() {
  seguimientos.value = obtenerSeguimientos();
  estudiantes.value = obtenerEstudiantes();
  docentes.value = obtenerUsuarios().filter(u => u.rol === ROLES.DOCENTE);
  
  const cfg = obtenerConfig();
  if (cfg) {
    config.value = cfg;
    if (cfg.periodoActivo) {
      periodoActivo.value = cfg.periodoActivo;
    }
  }
}

// Estadísticas
const totalRegistros = computed(() => seguimientos.value.length);
const registrosEstePeriodo = computed(() => {
  return seguimientos.value.filter(s => s.periodo === periodoActivo.value).length;
});
const totalEnRiesgo = computed(() => {
  return seguimientos.value.filter(s => s.estadoAcademico === 'En riesgo').length;
});
const totalEstudiantesConSeguimiento = computed(() => {
  const ids = seguimientos.value.map(s => s.estudianteId);
  return new Set(ids).size;
});

// Alertas Académicas (notas menores a 7 o asistencia menor a 75%, o estado "En riesgo")
const alertasAcademicas = computed(() => {
  const alertas = [];
  const estudiantesMap = {};
  estudiantes.value.forEach(e => {
    estudiantesMap[e.id] = nombreCompleto(e);
  });

  // Alertas de seguimientos
  seguimientos.value.forEach(s => {
    const nombre = estudiantesMap[s.estudianteId] || 'Estudiante';
    if (s.estadoAcademico === 'En riesgo') {
      alertas.push({
        id: s.id,
        nombre,
        tipo: 'riesgo',
        motivo: `En riesgo en ${s.asignatura} (${s.nota !== null ? 'Nota: ' + s.nota : 'Sin nota'})`
      });
    } else if (s.nota !== null && s.nota < 7) {
      alertas.push({
        id: s.id,
        nombre,
        tipo: 'alerta',
        motivo: `Nota baja (${s.nota}) en ${s.asignatura}`
      });
    } else if (s.asistencia !== null && s.asistencia < 75) {
      alertas.push({
        id: s.id,
        nombre,
        tipo: 'alerta',
        motivo: `Asistencia crítica (${s.asistencia}%) en ${s.asignatura}`
      });
    }
  });

  return alertas.slice(0, 5); // top 5
});

const ultimosSeguimientos = computed(() => {
  return [...seguimientos.value]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 4);
});

// Filtros de tabla
const registrosFiltrados = computed(() => {
  let list = seguimientos.value;
  const busqueda = normalizarTexto(filtroBusqueda.value.trim());
  const docId = filtroDocente.value;
  const estado = filtroEstado.value;

  return list.filter(s => {
    const estudianteNombre = getEstudianteNombre(s.estudianteId);
    const estudianteCedula = getEstudianteCedula(s.estudianteId);
    const texto = normalizarTexto([estudianteNombre, estudianteCedula, s.asignatura].join(' '));
    
    const coincideBusqueda = !busqueda || texto.includes(busqueda);
    const coincideDocente = !docId || s.docenteId === docId;
    const coincideEstado = !estado || s.estadoAcademico === estado;

    return coincideBusqueda && coincideDocente && coincideEstado;
  }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
});

// Helpers de texto
function getEstudianteNombre(id) {
  const est = estudiantes.value.find(e => e.id === id);
  return est ? nombreCompleto(est) : 'Desconocido';
}
function getEstudianteCedula(id) {
  const est = estudiantes.value.find(e => e.id === id);
  return est ? est.cedula : '';
}
function getDocenteNombre(id) {
  if (!id) return 'Administrador';
  const doc = docentes.value.find(u => u.id === id);
  return doc ? `${doc.nombres} ${doc.apellidos}` : 'Administrador';
}

function claseSegEstado(estado) {
  if (estado === 'Bueno') return 'ok';
  if (estado === 'En riesgo') return 'riesgo';
  return 'nota'; // Regular
}

function limpiarFiltros() {
  filtroBusqueda.value = '';
  filtroDocente.value = '';
  filtroEstado.value = '';
}

// Acciones modal seguimientos
function abrirNuevoSeguimiento() {
  editandoSegId.value = null;
  formSeg.value = {
    estudianteId: route.query.est || '',
    docenteId: '',
    asignatura: '',
    periodo: periodoActivo.value,
    nota: null,
    asistencia: null,
    estadoAcademico: 'Regular',
    observaciones: '',
    comentarios: ''
  };
  errors.value = { estudianteId: '', asignatura: '', periodo: '', nota: '', asistencia: '' };
  modalSegVisible.value = true;
}

function cerrarModalSeg() {
  modalSegVisible.value = false;
}

function editarSeguimiento(seg) {
  editandoSegId.value = seg.id;
  formSeg.value = { ...seg };
  errors.value = { estudianteId: '', asignatura: '', periodo: '', nota: '', asistencia: '' };
  modalSegVisible.value = true;
}

function validarFormSeg() {
  let valido = true;
  errors.value = { estudianteId: '', asignatura: '', periodo: '', nota: '', asistencia: '' };

  if (!Validaciones.requerido(formSeg.value.estudianteId)) {
    errors.value.estudianteId = 'El estudiante es obligatorio.';
    valido = false;
  }
  if (!Validaciones.requerido(formSeg.value.asignatura)) {
    errors.value.asignatura = 'La asignatura es obligatoria.';
    valido = false;
  }
  if (!Validaciones.requerido(formSeg.value.periodo)) {
    errors.value.periodo = 'El periodo es obligatorio.';
    valido = false;
  }

  if (formSeg.value.nota !== null && formSeg.value.nota !== '') {
    if (!Validaciones.rango(formSeg.value.nota, 0, 10)) {
      errors.value.nota = 'La nota debe estar entre 0 y 10.';
      valido = false;
    }
  }
  if (formSeg.value.asistencia !== null && formSeg.value.asistencia !== '') {
    if (!Validaciones.rango(formSeg.value.asistencia, 0, 100)) {
      errors.value.asistencia = 'La asistencia debe estar entre 0 y 100%.';
      valido = false;
    }
  }

  return valido;
}

function guardarSeguimientoForm() {
  if (!validarFormSeg()) {
    showToast('Por favor complete los campos requeridos correctamente.', 'error');
    return;
  }

  // Si nota o asistencia son vacíos, guardarlos como null
  if (formSeg.value.nota === '') formSeg.value.nota = null;
  if (formSeg.value.asistencia === '') formSeg.value.asistencia = null;

  let res;
  if (editandoSegId.value) {
    res = actualizarSeguimiento(editandoSegId.value, formSeg.value);
  } else {
    // Definir el rol creador
    formSeg.value.creadoPor = ROLES.ADMIN;
    res = crearSeguimiento(formSeg.value);
  }

  if (res.exito) {
    showToast(res.mensaje);
    cerrarModalSeg();
    cargarTodo();
  } else {
    showToast(res.mensaje, 'error');
  }
}

// Historial
function verHistorialEstudiante(studentId) {
  const est = estudiantes.value.find(e => e.id === studentId);
  if (est) {
    historialEstudiante.value = est;
    historialRegistros.value = seguimientos.value
      .filter(s => s.estudianteId === studentId)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    modalHistorialVisible.value = true;
  }
}

// Eliminar
function confirmarEliminar(seg) {
  segAEliminar.value = seg;
}

function eliminarSeguimientoConfirmado() {
  if (segAEliminar.value) {
    const res = eliminarSeguimiento(segAEliminar.value.id);
    if (res.exito) {
      showToast(res.mensaje);
      segAEliminar.value = null;
      cargarTodo();
    } else {
      showToast(res.mensaje, 'error');
    }
  }
}
</script>
