<template>
  <div>
    <section class="page-heading">
      <div>
        <h2>Gestión de adaptaciones</h2>
        <p>Registra y gestiona las adaptaciones curriculares visibles para los docentes.</p>
      </div>
      <button class="primary-action" @click="abrirNuevaAdaptacion" type="button">
        <i class="fas fa-plus"></i> Nueva adaptación
      </button>
    </section>

    <!-- Filtros -->
    <section class="filters-section tracking-filters" aria-label="Filtros">
      <div class="search-field">
        <label for="ada-search">Buscar</label>
        <div class="input-with-icon">
          <i class="fas fa-search"></i>
          <input 
            type="search" 
            id="ada-search" 
            v-model="filtroBusqueda" 
            placeholder="Nombre del estudiante..."
          />
        </div>
      </div>
      <div class="filter-field">
        <label for="ada-tipo-fil">Tipo</label>
        <select id="ada-tipo-fil" v-model="filtroTipo">
          <option value="">Todos</option>
          <option value="Tiempo extra">Tiempo extra</option>
          <option value="Material adaptado">Material adaptado</option>
          <option value="Evaluación oral">Evaluación oral</option>
          <option value="Intérprete">Intérprete</option>
          <option value="Recursos tecnológicos">Recursos tecnológicos</option>
          <option value="Otro">Otro</option>
        </select>
      </div>
      <button class="secondary-action" @click="limpiarFiltros" type="button" style="margin-top:24px; height:42px;">
        <i class="fas fa-eraser"></i> Limpiar
      </button>
    </section>

    <!-- Tabla -->
    <article class="table-section">
      <div class="section-title-row">
        <h2>Adaptaciones registradas</h2>
        <span>{{ adaptacionesFiltradas.length }} adaptación{{ adaptacionesFiltradas.length !== 1 ? 'es' : '' }}</span>
      </div>
      <div style="overflow-x:auto" v-if="adaptaciones.length > 0">
        <table class="students-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Vigencia</th>
              <th>Observaciones docente</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="adaptacionesFiltradas.length === 0">
              <td colspan="6" class="empty-row" style="text-align:center; padding: 20px;">
                No se encontraron adaptaciones con esos criterios.
              </td>
            </tr>
            <tr 
              v-for="a in adaptacionesFiltradas" 
              :key="a.id"
            >
              <td>
                <strong>{{ getEstudianteNombre(a.estudianteId) }}</strong>
              </td>
              <td>
                <span class="priority-badge low">{{ a.tipo }}</span>
              </td>
              <td>{{ a.descripcion || '—' }}</td>
              <td>{{ a.vigencia || '—' }}</td>
              <td>{{ a.observaciones || '—' }}</td>
              <td>
                <button class="action-btn edit" @click="editarAdaptacion(a)" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" @click="confirmarEliminar(a)" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="empty-state">No hay adaptaciones registradas.</p>
    </article>

    <!-- Modal nueva/editar adaptación -->
    <div 
      v-if="modalVisible" 
      class="modal-overlay visible" 
      @click.self="cerrarModal"
    >
      <div class="modal-box">
        <div class="modal-header">
          <h3>{{ formAdapt.id ? 'Editar adaptación' : 'Nueva adaptación' }}</h3>
          <button class="modal-close" @click="cerrarModal"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarAdaptacionForm" novalidate>
            <div class="mf-grid">
              <div class="mf-field required full" :class="{ 'is-invalid': errors.estudianteId }">
                <label for="adapt-est">Estudiante</label>
                <select id="adapt-est" v-model="formAdapt.estudianteId" :disabled="formAdapt.id">
                  <option value="">Seleccionar...</option>
                  <option v-for="e in estudiantes" :key="e.id" :value="e.id">
                    {{ e.nombres }} {{ e.apellidos }}
                  </option>
                </select>
                <span class="mf-error" v-if="errors.estudianteId">{{ errors.estudianteId }}</span>
              </div>
              <div class="mf-field required">
                <label for="adapt-tipo">Tipo de adaptación</label>
                <select id="adapt-tipo" v-model="formAdapt.tipo">
                  <option value="Tiempo extra">Tiempo extra</option>
                  <option value="Material adaptado">Material adaptado</option>
                  <option value="Evaluación oral">Evaluación oral</option>
                  <option value="Intérprete">Intérprete</option>
                  <option value="Recursos tecnológicos">Recursos tecnológicos</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div class="mf-field">
                <label for="adapt-vigencia">Vigencia (fecha)</label>
                <input type="date" id="adapt-vigencia" v-model="formAdapt.vigencia">
              </div>
              <div class="mf-field required full" :class="{ 'is-invalid': errors.descripcion }">
                <label for="adapt-desc">Descripción</label>
                <textarea id="adapt-desc" v-model="formAdapt.descripcion" placeholder="Describe la adaptación curricular..."></textarea>
                <span class="mf-error" v-if="errors.descripcion">{{ errors.descripcion }}</span>
              </div>
              <div class="mf-field full">
                <label for="adapt-obs">Observaciones para el docente</label>
                <textarea id="adapt-obs" v-model="formAdapt.observaciones" placeholder="Indicaciones visibles para el docente..."></textarea>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="secondary-action" @click="cerrarModal">Cancelar</button>
          <button type="button" class="primary-action" @click="guardarAdaptacionForm">
            <i class="fas fa-save"></i> Guardar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal confirmar eliminar -->
    <div 
      v-if="adaptacionAEliminar" 
      class="modal-overlay visible" 
      @click.self="adaptacionAEliminar = null"
    >
      <div class="modal-box sm" style="max-width: 440px;">
        <div class="modal-header">
          <h3>Confirmar eliminación</h3>
          <button class="modal-close" @click="adaptacionAEliminar = null"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="confirm-body">
            <div class="confirm-icon"><i class="fas fa-trash-alt"></i></div>
            <p>¿Está seguro que desea eliminar esta adaptación?</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="secondary-action" @click="adaptacionAEliminar = null">Cancelar</button>
          <button type="button" class="danger-action" @click="eliminarAdaptacionConfirmada">
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
  obtenerAdaptaciones, 
  obtenerEstudiantes, 
  obtenerEstudiantePorId, 
  crearAdaptacion, 
  actualizarAdaptacion, 
  eliminarAdaptacion,
  ROLES 
} from '../../services/storage.js';
import { normalizarTexto } from '../../utils/helpers.js';
import { showToast } from '../../services/toast.js';
import { Validaciones } from '../../services/validaciones.js';

const adaptaciones = ref([]);
const estudiantes = ref([]);
const filtroBusqueda = ref('');
const filtroTipo = ref('');

// Modales
const modalVisible = ref(false);
const adaptacionAEliminar = ref(null);

const formAdapt = ref({
  id: '',
  estudianteId: '',
  tipo: 'Tiempo extra',
  vigencia: '',
  descripcion: '',
  observaciones: ''
});

const errors = ref({ estudianteId: '', descripcion: '' });

onMounted(() => {
  cargarTodo();
});

function cargarTodo() {
  adaptaciones.value = obtenerAdaptaciones();
  estudiantes.value = obtenerEstudiantes();
}

const adaptacionesFiltradas = computed(() => {
  const query = normalizarTexto(filtroBusqueda.value.trim());
  const tipo = filtroTipo.value;

  return adaptaciones.value.filter(a => {
    const est = obtenerEstudiantePorId(a.estudianteId);
    const nombre = est ? `${est.nombres} ${est.apellidos}` : '';
    const txt = normalizarTexto(nombre);

    const coincideBusqueda = !query || txt.includes(query);
    const coincideTipo = !tipo || a.tipo === tipo;

    return coincideBusqueda && coincideTipo;
  }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
});

function getEstudianteNombre(id) {
  const est = estudiantes.value.find(e => e.id === id);
  return est ? `${est.nombres} ${est.apellidos}` : 'Desconocido';
}

function limpiarFiltros() {
  filtroBusqueda.value = '';
  filtroTipo.value = '';
}

// Modal acciones
function abrirNuevaAdaptacion() {
  formAdapt.value = {
    id: '',
    estudianteId: '',
    tipo: 'Tiempo extra',
    vigencia: '',
    descripcion: '',
    observaciones: ''
  };
  errors.value = { estudianteId: '', descripcion: '' };
  modalVisible.value = true;
}

function editarAdaptacion(a) {
  formAdapt.value = { ...a };
  errors.value = { estudianteId: '', descripcion: '' };
  modalVisible.value = true;
}

function cerrarModal() {
  modalVisible.value = false;
}

function validarForm() {
  let valido = true;
  errors.value = { estudianteId: '', descripcion: '' };

  if (!Validaciones.requerido(formAdapt.value.estudianteId)) {
    errors.value.estudianteId = 'Selecciona un estudiante.';
    valido = false;
  }
  if (!Validaciones.requerido(formAdapt.value.descripcion)) {
    errors.value.descripcion = 'La descripción es obligatoria.';
    valido = false;
  }

  return valido;
}

function guardarAdaptacionForm() {
  if (!validarForm()) {
    showToast('Corrija los errores del formulario.', 'error');
    return;
  }

  let res;
  const datos = {
    ...formAdapt.value,
    creadoPor: ROLES.BIENESTAR
  };

  if (formAdapt.value.id) {
    res = actualizarAdaptacion(formAdapt.value.id, datos);
  } else {
    res = crearAdaptacion(datos);
  }

  if (res.exito) {
    showToast(res.mensaje);
    cerrarModal();
    cargarTodo();
  } else {
    showToast(res.mensaje, 'error');
  }
}

function confirmarEliminar(a) {
  adaptacionAEliminar.value = a;
}

function eliminarAdaptacionConfirmada() {
  if (adaptacionAEliminar.value) {
    const res = eliminarAdaptacion(adaptacionAEliminar.value.id);
    if (res.exito) {
      showToast(res.mensaje);
      adaptacionAEliminar.value = null;
      cargarTodo();
    } else {
      showToast(res.mensaje, 'error');
    }
  }
}
</script>
