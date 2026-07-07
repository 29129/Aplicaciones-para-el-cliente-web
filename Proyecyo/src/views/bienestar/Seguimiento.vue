<template>
  <div>
    <section class="page-heading">
      <div>
        <h2>Seguimiento por estudiante</h2>
        <p>Apoyos, observaciones y estado integral de cada caso.</p>
      </div>
    </section>

    <div class="bien-layout">
      <!-- Lista lateral de estudiantes -->
      <aside class="bien-sidebar-panel">
        <article class="dashboard-panel">
          <h2>Estudiantes</h2>
          <div class="dashboard-panel-body">
            <div class="panel-search">
              <i class="fas fa-search"></i>
              <input
                type="search"
                v-model="filtroLateral"
                placeholder="Buscar estudiante..."
              />
            </div>
            <div class="est-list">
              <p v-if="estudiantesFiltrados.length === 0" class="est-list-empty">Sin resultados.</p>
              <div
                v-for="e in estudiantesFiltrados"
                :key="e.id"
                class="est-list-item"
                :class="{ selected: e.id === estudianteSeleccionadoId }"
                @click="seleccionarEstudiante(e.id)"
              >
                <div class="est-av-sm">{{ obtenerIniciales(e.nombres, e.apellidos) }}</div>
                <div>
                  <strong>{{ e.nombres }} {{ e.apellidos }}</strong>
                  <span>
                    <span class="priority-badge" :class="claseNivelRiesgo(e.nivelRiesgo)">{{ e.nivelRiesgo }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </aside>

      <!-- Panel de detalles -->
      <article class="dashboard-panel bien-detail-panel">
        <div v-if="!estudianteSeleccionadoId" class="sin-sel">
          <i class="fas fa-user-circle"></i>
          Selecciona un estudiante de la lista para ver su seguimiento integral.
        </div>
        <div v-else class="dashboard-panel-body">
          <!-- Encabezado del estudiante -->
          <div class="seg-est-header">
            <div class="seg-est-avatar">
              {{ obtenerIniciales(estudianteActual.nombres, estudianteActual.apellidos) }}
            </div>
            <div class="seg-est-info">
              <strong>{{ estudianteActual.nombres }} {{ estudianteActual.apellidos }}</strong>
              <span>
                {{ estudianteActual.carrera }} —
                <span class="priority-badge" :class="claseNivelRiesgo(estudianteActual.nivelRiesgo)">{{ estudianteActual.nivelRiesgo }}</span>
              </span>
            </div>
          </div>

          <!-- Pestañas internas -->
          <div class="detalle-tabs">
            <button class="detalle-tab" :class="{ active: activeTab === 'apoyos' }" @click="activeTab = 'apoyos'" type="button">Apoyos</button>
            <button class="detalle-tab" :class="{ active: activeTab === 'observaciones' }" @click="activeTab = 'observaciones'" type="button">Observaciones</button>
            <button class="detalle-tab" :class="{ active: activeTab === 'estado' }" @click="activeTab = 'estado'" type="button">Estado</button>
          </div>

          <!-- Contenido Apoyos -->
          <div v-show="activeTab === 'apoyos'" class="dtab-panel">
            <div class="dtab-actions">
              <button class="primary-action" @click="abrirNuevoApoyo" type="button">
                <i class="fas fa-plus"></i> Nuevo apoyo
              </button>
            </div>
            <div v-if="apoyos.length > 0">
              <div
                v-for="a in apoyos"
                :key="a.id"
                class="item-card-row"
              >
                <div class="item-card-icon">
                  <i class="fas" :class="'fa-' + getIcoApoyo(a.tipo)"></i>
                </div>
                <div class="item-card-content">
                  <strong>
                    {{ a.tipo }} —
                    <span class="status" :class="a.estado === 'Activo' ? 'active' : 'inactive'">{{ a.estado }}</span>
                  </strong>
                  <span>{{ a.descripcion || '—' }}</span>
                  <span class="meta">{{ a.fechaInicio || '—' }} — {{ a.fechaFin || 'Indefinido' }} | {{ a.responsable || '—' }}</span>
                </div>
                <div class="item-card-actions">
                  <button class="action-btn edit" @click="editarApoyo(a)" title="Editar" type="button"><i class="fas fa-edit"></i></button>
                  <button class="action-btn delete" @click="confirmarEliminarApoyo(a)" title="Eliminar" type="button"><i class="fas fa-trash-alt"></i></button>
                </div>
              </div>
            </div>
            <p v-else class="panel-empty">Sin apoyos registrados.</p>
          </div>

          <!-- Contenido Observaciones -->
          <div v-show="activeTab === 'observaciones'" class="dtab-panel">
            <div class="dtab-actions">
              <button class="primary-action" @click="abrirNuevaObs" type="button">
                <i class="fas fa-plus"></i> Nueva observación
              </button>
            </div>
            <div v-if="observaciones.length > 0" class="bien-tl">
              <div
                v-for="o in observaciones"
                :key="o.id"
                class="bien-ti"
              >
                <span class="bien-ti-fecha">{{ formatearFecha(o.fecha) }} — {{ o.tipo }}</span>
                <div class="bien-ti-card">
                  <strong>
                    {{ o.tipo }} —
                    <span class="priority-badge" :class="claseNivelRiesgo(o.nivelRiesgo)">{{ o.nivelRiesgo }}</span>
                  </strong>
                  <p>{{ o.contenido }}</p>
                  <div class="bien-ti-actions">
                    <button class="action-btn delete" @click="confirmarEliminarObs(o)" title="Eliminar observación" type="button"><i class="fas fa-trash-alt"></i></button>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="panel-empty">Sin observaciones.</p>
          </div>

          <!-- Contenido Estado / Riesgo -->
          <div v-show="activeTab === 'estado'" class="dtab-panel">
            <form @submit.prevent="guardarEstadoEstudiante">
              <div class="mf-grid">
                <div class="mf-field">
                  <label for="bien-sel-estado">Estado del estudiante</label>
                  <select id="bien-sel-estado" v-model="formEstado.estado">
                    <option value="Activo">Activo</option>
                    <option value="En seguimiento">En seguimiento</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
                <div class="mf-field">
                  <label for="bien-sel-riesgo">Nivel de riesgo</label>
                  <select id="bien-sel-riesgo" v-model="formEstado.nivelRiesgo">
                    <option value="Bajo">Bajo</option>
                    <option value="Medio">Medio</option>
                    <option value="Alto">Alto</option>
                  </select>
                </div>
                <div class="mf-field full">
                  <label for="bien-recom">Recomendaciones</label>
                  <textarea id="bien-recom" v-model="formEstado.recomendaciones" rows="4"></textarea>
                </div>
              </div>
              <div class="form-section-actions">
                <button type="submit" class="primary-action"><i class="fas fa-save"></i> Actualizar estado</button>
              </div>
            </form>
          </div>
        </div>
      </article>
    </div>

    <!-- MODAL REGISTRAR APOYO -->
    <div 
      v-if="modalApoyoVisible" 
      class="modal-overlay visible" 
      @click.self="cerrarModalApoyo"
    >
      <div class="modal-box">
        <div class="modal-header">
          <h3>{{ formApoyo.id ? 'Editar apoyo' : 'Registrar apoyo' }}</h3>
          <button class="modal-close" @click="cerrarModalApoyo"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarApoyoForm" novalidate>
            <div class="mf-grid">
              <div class="mf-field required">
                <label>Tipo de apoyo</label>
                <select v-model="formApoyo.tipo">
                  <option value="Académico">Académico</option>
                  <option value="Psicológico">Psicológico</option>
                  <option value="Tecnológico">Tecnológico</option>
                  <option value="Físico">Físico</option>
                  <option value="Social">Social</option>
                </select>
              </div>
              <div class="mf-field">
                <label>Estado</label>
                <select v-model="formApoyo.estado">
                  <option value="Activo">Activo</option>
                  <option value="Finalizado">Finalizado</option>
                  <option value="Suspendido">Suspendido</option>
                </select>
              </div>
              <div class="mf-field">
                <label>Fecha inicio</label>
                <input type="date" v-model="formApoyo.fechaInicio">
              </div>
              <div class="mf-field">
                <label>Fecha fin (opcional)</label>
                <input type="date" v-model="formApoyo.fechaFin">
              </div>
              <div class="mf-field full">
                <label>Responsable</label>
                <input type="text" v-model="formApoyo.responsable" placeholder="Nombre del responsable...">
              </div>
              <div class="mf-field required full" :class="{ 'is-invalid': errors.apoyoDesc }">
                <label>Descripción</label>
                <textarea v-model="formApoyo.descripcion" placeholder="Descripción del apoyo..."></textarea>
                <span class="mf-error" v-if="errors.apoyoDesc">{{ errors.apoyoDesc }}</span>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="secondary-action" @click="cerrarModalApoyo">Cancelar</button>
          <button type="button" class="primary-action" @click="guardarApoyoForm">
            <i class="fas fa-save"></i> Guardar
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL NUEVA OBSERVACIÓN -->
    <div 
      v-if="modalObsVisible" 
      class="modal-overlay visible" 
      @click.self="cerrarModalObs"
    >
      <div class="modal-box">
        <div class="modal-header">
          <h3>Nueva observación</h3>
          <button class="modal-close" @click="cerrarModalObs"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarObsForm" novalidate>
            <div class="mf-grid">
              <div class="mf-field">
                <label>Tipo</label>
                <select v-model="formObs.tipo">
                  <option value="Social">Social</option>
                  <option value="Psicológica">Psicológica</option>
                  <option value="Académica">Académica</option>
                  <option value="Familiar">Familiar</option>
                </select>
              </div>
              <div class="mf-field">
                <label>Nivel de riesgo</label>
                <select v-model="formObs.nivelRiesgo">
                  <option value="Bajo">Bajo</option>
                  <option value="Medio">Medio</option>
                  <option value="Alto">Alto</option>
                </select>
              </div>
              <div class="mf-field required full" :class="{ 'is-invalid': errors.obsCont }">
                <label>Contenido</label>
                <textarea v-model="formObs.contenido" placeholder="Descripción de la observación..." style="min-height:100px"></textarea>
                <span class="mf-error" v-if="errors.obsCont">{{ errors.obsCont }}</span>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="secondary-action" @click="cerrarModalObs">Cancelar</button>
          <button type="button" class="primary-action" @click="guardarObsForm">
            <i class="fas fa-save"></i> Guardar
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL CONFIRMAR ELIMINAR (Para Apoyos u Observaciones) -->
    <div 
      v-if="elementoEliminar" 
      class="modal-overlay visible" 
      @click.self="elementoEliminar = null"
    >
      <div class="modal-box sm" style="max-width:440px">
        <div class="modal-header">
          <h3>Confirmar eliminación</h3>
          <button class="modal-close" @click="elementoEliminar = null"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="confirm-body">
            <div class="confirm-icon"><i class="fas fa-trash-alt"></i></div>
            <p>¿Está seguro que desea eliminar este {{ elementoEliminar.tipoEliminacion }}?</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="secondary-action" @click="elementoEliminar = null">Cancelar</button>
          <button type="button" class="danger-action" @click="eliminarConfirmado">
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
  obtenerEstudiantes, 
  obtenerEstudiantePorId, 
  obtenerApoyosPorEstudiante, 
  obtenerObservacionesPorEstudiante, 
  actualizarEstadoEstudiante,
  crearApoyo, 
  actualizarApoyo, 
  eliminarApoyo, 
  crearObservacion, 
  eliminarObservacion,
  ROLES 
} from '../../services/storage.js';
import { 
  normalizarTexto,
  obtenerIniciales, 
  claseNivelRiesgo, 
  formatearFecha 
} from '../../utils/helpers.js';
import { showToast } from '../../services/toast.js';
import { Validaciones } from '../../services/validaciones.js';

const route = useRoute();

const estudiantes = ref([]);
const filtroLateral = ref('');
const estudianteSeleccionadoId = ref('');

const activeTab = ref('apoyos');
const estudianteActual = ref({});
const apoyos = ref([]);
const observaciones = ref([]);

const formEstado = ref({ estado: 'Activo', nivelRiesgo: 'Bajo', recomendaciones: '' });

// Modales
const modalApoyoVisible = ref(false);
const formApoyo = ref({ id: '', tipo: 'Académico', estado: 'Activo', fechaInicio: '', fechaFin: '', responsable: '', descripcion: '' });

const modalObsVisible = ref(false);
const formObs = ref({ tipo: 'Social', nivelRiesgo: 'Bajo', contenido: '' });

const elementoEliminar = ref(null); // { id: '', tipoEliminacion: 'apoyo'|'observación' }

const errors = ref({ apoyoDesc: '', obsCont: '' });

onMounted(() => {
  cargarEstudiantes();
  
  // Preselección por URL (?est=id)
  const estId = route.query.est;
  if (estId) {
    seleccionarEstudiante(estId);
  }
});

function cargarEstudiantes() {
  estudiantes.value = obtenerEstudiantes();
}

const estudiantesFiltrados = computed(() => {
  const query = normalizarTexto(filtroLateral.value.trim());
  if (!query) return estudiantes.value;
  return estudiantes.value.filter(e => 
    normalizarTexto(`${e.nombres} ${e.apellidos}`).includes(query)
  );
});

function seleccionarEstudiante(id) {
  estudianteSeleccionadoId.value = id;
  const est = estudiantes.value.find(e => e.id === id);
  if (est) {
    estudianteActual.value = est;
    formEstado.value = {
      estado: est.estado,
      nivelRiesgo: est.nivelRiesgo || 'Bajo',
      recomendaciones: est.recomendaciones || ''
    };
    cargarDetallesEstudiante();
  }
}

function cargarDetallesEstudiante() {
  if (estudianteSeleccionadoId.value) {
    apoyos.value = obtenerApoyosPorEstudiante(estudianteSeleccionadoId.value);
    observaciones.value = obtenerObservacionesPorEstudiante(estudianteSeleccionadoId.value);
  }
}

function getIcoApoyo(tipo) {
  const map = { Académico:'graduation-cap', Psicológico:'brain', Tecnológico:'laptop', Físico:'wheelchair', Social:'heart' };
  return map[tipo] || 'hands-helping';
}

// Actualizar Estado
function guardarEstadoEstudiante() {
  const res = actualizarEstadoEstudiante(
    estudianteSeleccionadoId.value,
    formEstado.value.estado,
    formEstado.value.nivelRiesgo,
    formEstado.value.recomendaciones.trim()
  );

  if (res.exito) {
    showToast(res.mensaje);
    cargarEstudiantes();
    // Actualizar datos locales
    const upd = obtenerEstudiantePorId(estudianteSeleccionadoId.value);
    if (upd) {
      estudianteActual.value = upd;
    }
  } else {
    showToast(res.mensaje, 'error');
  }
}

// Apoyos modal
function abrirNuevoApoyo() {
  formApoyo.value = { id: '', tipo: 'Académico', estado: 'Activo', fechaInicio: '', fechaFin: '', responsable: '', descripcion: '' };
  errors.value.apoyoDesc = '';
  modalApoyoVisible.value = true;
}

function editarApoyo(a) {
  formApoyo.value = { ...a };
  errors.value.apoyoDesc = '';
  modalApoyoVisible.value = true;
}

function cerrarModalApoyo() {
  modalApoyoVisible.value = false;
}

function guardarApoyoForm() {
  errors.value.apoyoDesc = '';
  if (!Validaciones.requerido(formApoyo.value.descripcion)) {
    errors.value.apoyoDesc = 'La descripción es obligatoria.';
    return;
  }

  let res;
  const datos = {
    ...formApoyo.value,
    estudianteId: estudianteSeleccionadoId.value,
    creadoPor: ROLES.BIENESTAR
  };

  if (formApoyo.value.id) {
    res = actualizarApoyo(formApoyo.value.id, datos);
  } else {
    res = crearApoyo(datos);
  }

  if (res.exito) {
    showToast(res.mensaje);
    cerrarModalApoyo();
    cargarDetallesEstudiante();
  } else {
    showToast(res.mensaje, 'error');
  }
}

function confirmarEliminarApoyo(a) {
  elementoEliminar.value = { id: a.id, tipoEliminacion: 'apoyo' };
}

// Observaciones modal
function abrirNuevaObs() {
  formObs.value = { tipo: 'Social', nivelRiesgo: 'Bajo', contenido: '' };
  errors.value.obsCont = '';
  modalObsVisible.value = true;
}

function cerrarModalObs() {
  modalObsVisible.value = false;
}

function guardarObsForm() {
  errors.value.obsCont = '';
  if (!Validaciones.requerido(formObs.value.contenido)) {
    errors.value.obsCont = 'El contenido es obligatorio.';
    return;
  }

  const res = crearObservacion({
    estudianteId: estudianteSeleccionadoId.value,
    tipo: formObs.value.tipo,
    nivelRiesgo: formObs.value.nivelRiesgo,
    contenido: formObs.value.contenido.trim(),
    creadoPor: ROLES.BIENESTAR
  });

  if (res.exito) {
    showToast(res.mensaje);
    cerrarModalObs();
    cargarDetallesEstudiante();
  } else {
    showToast(res.mensaje, 'error');
  }
}

function confirmarEliminarObs(o) {
  elementoEliminar.value = { id: o.id, tipoEliminacion: 'observación' };
}

function eliminarConfirmado() {
  if (!elementoEliminar.value) return;
  const { id, tipoEliminacion } = elementoEliminar.value;
  
  let res;
  if (tipoEliminacion === 'apoyo') {
    res = eliminarApoyo(id);
  } else {
    res = eliminarObservacion(id);
  }

  if (res.exito) {
    showToast(res.mensaje);
    elementoEliminar.value = null;
    cargarDetallesEstudiante();
  } else {
    showToast(res.mensaje, 'error');
  }
}
</script>
