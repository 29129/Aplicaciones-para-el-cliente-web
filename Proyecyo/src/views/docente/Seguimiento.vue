<template>
  <div>
    <section class="page-heading">
      <div>
        <h2>Registrar seguimiento</h2>
        <p>Registra notas, asistencia y observaciones de tus estudiantes asignados.</p>
      </div>
      <button class="primary-action" @click="abrirNuevoSeguimiento" type="button">
        <i class="fas fa-plus"></i> Nuevo registro
      </button>
    </section>

    <!-- Filtros -->
    <section class="filters-section tracking-filters" aria-label="Filtros">
      <div class="search-field">
        <label for="seg-search">Buscar</label>
        <div class="input-with-icon">
          <i class="fas fa-search"></i>
          <input 
            type="search" 
            id="seg-search" 
            v-model="filtroBusqueda" 
            placeholder="Nombre o asignatura..."
          />
        </div>
      </div>
      <div class="filter-field">
        <label for="seg-filtro-estado">Estado acad.</label>
        <select id="seg-filtro-estado" v-model="filtroEstado">
          <option value="">Todos</option>
          <option value="Bueno">Bueno</option>
          <option value="Regular">Regular</option>
          <option value="En riesgo">En riesgo</option>
        </select>
      </div>
      <button class="secondary-action" @click="limpiarFiltros" type="button" style="margin-top:24px; height:42px;">
        <i class="fas fa-eraser"></i> Limpiar
      </button>
    </section>

    <!-- Tabla -->
    <article class="table-section">
      <div class="section-title-row">
        <h2>Mis registros</h2>
        <span>{{ seguimientosFiltrados.length }} registro{{ seguimientosFiltrados.length !== 1 ? 's' : '' }}</span>
      </div>
      <div style="overflow-x:auto" v-if="misSeguimientos.length > 0">
        <table class="students-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Asignatura</th>
              <th>Nota</th>
              <th>Asistencia</th>
              <th>Estado acad.</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="seguimientosFiltrados.length === 0">
              <td colspan="7" class="empty-row" style="text-align:center; padding: 20px;">
                No se encontraron registros de seguimiento.
              </td>
            </tr>
            <tr 
              v-for="s in seguimientosFiltrados" 
              :key="s.id"
            >
              <td>
                <strong>{{ getEstudianteNombre(s.estudianteId) }}</strong>
              </td>
              <td>{{ s.asignatura || '—' }}</td>
              <td>{{ s.nota !== null ? s.nota.toFixed(1) : '—' }}</td>
              <td>{{ s.asistencia !== null ? s.asistencia + '%' : '—' }}</td>
              <td>
                <span class="seg-chip" :class="claseSegEstado(s.estadoAcademico)">
                  {{ s.estadoAcademico }}
                </span>
              </td>
              <td>{{ formatearFecha(s.fecha) }}</td>
              <td>
                <button class="action-btn edit" @click="editarSeguimiento(s)" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" @click="confirmarEliminar(s)" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="empty-state">No tienes registros de seguimiento aún.</p>
    </article>

    <!-- Modal Nuevo/Editar -->
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
                <label for="seg-est">Estudiante</label>
                <select id="seg-est" v-model="formSeg.estudianteId" :disabled="editandoSegId">
                  <option value="">Seleccionar estudiante...</option>
                  <option v-for="e in misEstudiantes" :key="e.id" :value="e.id">
                    {{ e.nombres }} {{ e.apellidos }}
                  </option>
                </select>
                <span class="mf-error" v-if="errors.estudianteId">{{ errors.estudianteId }}</span>
              </div>
              <div class="mf-field required" :class="{ 'is-invalid': errors.asignatura }">
                <label for="seg-asig">Asignatura</label>
                <input type="text" id="seg-asig" v-model="formSeg.asignatura" placeholder="Ej: Matemáticas">
                <span class="mf-error" v-if="errors.asignatura">{{ errors.asignatura }}</span>
              </div>
              <div class="mf-field required" :class="{ 'is-invalid': errors.periodo }">
                <label for="seg-periodo">Periodo</label>
                <input type="text" id="seg-periodo" v-model="formSeg.periodo" placeholder="Ej: 2026-1">
                <span class="mf-error" v-if="errors.periodo">{{ errors.periodo }}</span>
              </div>
              <div class="mf-field" :class="{ 'is-invalid': errors.nota }">
                <label for="seg-nota">Nota (0-10)</label>
                <input type="number" id="seg-nota" v-model.number="formSeg.nota" min="0" max="10" step="0.1" placeholder="Ej: 8.5">
                <span class="mf-error" v-if="errors.nota">{{ errors.nota }}</span>
              </div>
              <div class="mf-field" :class="{ 'is-invalid': errors.asistencia }">
                <label for="seg-asist">Asistencia (%)</label>
                <input type="number" id="seg-asist" v-model.number="formSeg.asistencia" min="0" max="100" placeholder="Ej: 85">
                <span class="mf-error" v-if="errors.asistencia">{{ errors.asistencia }}</span>
              </div>
              <div class="mf-field full">
                <label for="seg-estado">Estado académico</label>
                <select id="seg-estado" v-model="formSeg.estadoAcademico">
                  <option value="Bueno">Bueno</option>
                  <option value="Regular">Regular</option>
                  <option value="En riesgo">En riesgo</option>
                </select>
              </div>
              <div class="mf-field full">
                <label for="seg-obs">Observaciones</label>
                <textarea id="seg-obs" v-model="formSeg.observaciones" placeholder="Describe el desempeño y situación del estudiante..."></textarea>
              </div>
              <div class="mf-field full">
                <label for="seg-coment">Comentarios adicionales</label>
                <textarea id="seg-coment" v-model="formSeg.comentarios" placeholder="Coordinación con bienestar, familia, etc."></textarea>
              </div>
            </div>
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

    <!-- Modal confirmar eliminar -->
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
  obtenerSesion, 
  obtenerUsuarios, 
  obtenerEstudiantePorId, 
  obtenerSeguimientosPorDocente, 
  obtenerConfig, 
  crearSeguimiento, 
  actualizarSeguimiento, 
  eliminarSeguimiento,
  ROLES 
} from '../../services/storage.js';
import { 
  formatearFecha, 
  normalizarTexto 
} from '../../utils/helpers.js';
import { showToast } from '../../services/toast.js';
import { Validaciones } from '../../services/validaciones.js';

const route = useRoute();

const docenteId = ref('');
const misEstudiantes = ref([]);
const misSeguimientos = ref([]);
const config = ref({});
const periodoActivo = ref('2026-1');

const filtroBusqueda = ref('');
const filtroEstado = ref('');

// Modales
const modalSegVisible = ref(false);
const editandoSegId = ref(null);
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
  const sesion = obtenerSesion();
  if (sesion) {
    docenteId.value = sesion.id;
    const list = obtenerUsuarios();
    const current = list.find(x => x.id === sesion.id);
    if (current && current.estudiantesAsignados) {
      misEstudiantes.value = current.estudiantesAsignados
        .map(id => obtenerEstudiantePorId(id))
        .filter(Boolean);
    }
  }

  const cfg = obtenerConfig();
  if (cfg) {
    config.value = cfg;
    if (cfg.periodoActivo) {
      periodoActivo.value = cfg.periodoActivo;
    }
  }

  cargarSeguimientos();

  // Preselección desde URL (?est=id)
  const estId = route.query.est;
  if (estId) {
    const estudianteAsignado = misEstudiantes.value.some(e => e.id === estId);
    if (estudianteAsignado) {
      abrirNuevoSeguimiento();
      formSeg.value.estudianteId = estId;
    }
  }
});

function cargarSeguimientos() {
  if (docenteId.value) {
    misSeguimientos.value = obtenerSeguimientosPorDocente(docenteId.value);
  }
}

const seguimientosFiltrados = computed(() => {
  const query = normalizarTexto(filtroBusqueda.value.trim());
  const estado = filtroEstado.value;

  return misSeguimientos.value.filter(s => {
    const est = obtenerEstudiantePorId(s.estudianteId);
    const nombre = est ? `${est.nombres} ${est.apellidos}` : '';
    const txt = normalizarTexto(`${nombre} ${s.asignatura}`);

    const coincideBusqueda = !query || txt.includes(query);
    const coincideEstado = !estado || s.estadoAcademico === estado;

    return coincideBusqueda && coincideEstado;
  }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
});

function getEstudianteNombre(id) {
  const est = misEstudiantes.value.find(e => e.id === id);
  return est ? `${est.nombres} ${est.apellidos}` : 'Desconocido';
}

function claseSegEstado(estado) {
  if (estado === 'Bueno') return 'ok';
  if (estado === 'En riesgo') return 'riesgo';
  return 'nota'; // Regular
}

function limpiarFiltros() {
  filtroBusqueda.value = '';
  filtroEstado.value = '';
}

// Modal acciones
function abrirNuevoSeguimiento() {
  editandoSegId.value = null;
  formSeg.value = {
    estudianteId: '',
    docenteId: docenteId.value,
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

function editarSeguimiento(s) {
  editandoSegId.value = s.id;
  formSeg.value = { ...s };
  errors.value = { estudianteId: '', asignatura: '', periodo: '', nota: '', asistencia: '' };
  modalSegVisible.value = true;
}

function validarForm() {
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
  if (!validarForm()) {
    showToast('Corrija los campos requeridos.', 'error');
    return;
  }

  if (formSeg.value.nota === '') formSeg.value.nota = null;
  if (formSeg.value.asistencia === '') formSeg.value.asistencia = null;

  let res;
  if (editandoSegId.value) {
    res = actualizarSeguimiento(editandoSegId.value, formSeg.value);
  } else {
    formSeg.value.creadoPor = ROLES.DOCENTE;
    res = crearSeguimiento(formSeg.value);
  }

  if (res.exito) {
    showToast(res.mensaje);
    cerrarModalSeg();
    cargarSeguimientos();
  } else {
    showToast(res.mensaje, 'error');
  }
}

function confirmarEliminar(s) {
  segAEliminar.value = s;
}

function eliminarSeguimientoConfirmado() {
  if (segAEliminar.value) {
    const res = eliminarSeguimiento(segAEliminar.value.id);
    if (res.exito) {
      showToast(res.mensaje);
      segAEliminar.value = null;
      cargarSeguimientos();
    } else {
      showToast(res.mensaje, 'error');
    }
  }
}
</script>
