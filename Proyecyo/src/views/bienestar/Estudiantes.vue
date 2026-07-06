<template>
  <div>
    <section class="page-heading">
      <div>
        <h2>Todos los estudiantes</h2>
        <p>Ficha integral, apoyos, adaptaciones y estado de cada estudiante.</p>
      </div>
    </section>

    <!-- Filtros -->
    <section class="filters-section tracking-filters" aria-label="Filtros">
      <div class="search-field">
        <label for="est-search">Buscar</label>
        <div class="input-with-icon">
          <i class="fas fa-search"></i>
          <input 
            type="search" 
            id="est-search" 
            v-model="filtroBusqueda" 
            placeholder="Nombre, cédula o carrera..."
          />
        </div>
      </div>
      <div class="filter-field">
        <label for="fil-riesgo">Nivel de riesgo</label>
        <select id="fil-riesgo" v-model="filtroRiesgo">
          <option value="">Todos</option>
          <option value="Alto">Alto</option>
          <option value="Medio">Medio</option>
          <option value="Bajo">Bajo</option>
        </select>
      </div>
      <div class="filter-field">
        <label for="fil-estado">Estado</label>
        <select id="fil-estado" v-model="filtroEstado">
          <option value="">Todos</option>
          <option value="Activo">Activo</option>
          <option value="En seguimiento">En seguimiento</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>
      <button class="secondary-action" @click="limpiarFiltros" type="button" style="margin-top: 24px; height: 42px;">
        <i class="fas fa-eraser"></i> Limpiar
      </button>
    </section>

    <!-- Tabla -->
    <article class="table-section">
      <div class="section-title-row">
        <h2>Listado</h2>
        <span>{{ estudiantesFiltrados.length }} estudiante{{ estudiantesFiltrados.length !== 1 ? 's' : '' }}</span>
      </div>
      <div style="overflow-x:auto" v-if="estudiantes.length > 0">
        <table class="students-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Cédula</th>
              <th>Carrera</th>
              <th>Discapacidad</th>
              <th>Riesgo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="estudiantesFiltrados.length === 0">
              <td colspan="7" class="empty-row" style="text-align:center; padding: 20px;">
                No se encontraron estudiantes con esos criterios.
              </td>
            </tr>
            <tr 
              v-for="e in estudiantesFiltrados" 
              :key="e.id"
            >
              <td>
                <strong>{{ e.nombres }} {{ e.apellidos }}</strong>
                <span style="display:block; font-size:12px; color:var(--text-muted);">{{ e.correoInstitucional }}</span>
              </td>
              <td>{{ e.cedula }}</td>
              <td>{{ e.carrera }}</td>
              <td>{{ e.tipoDiscapacidad || '—' }}</td>
              <td>
                <span class="priority-badge" :class="claseNivelRiesgo(e.nivelRiesgo)">
                  {{ e.nivelRiesgo || 'Bajo' }}
                </span>
              </td>
              <td>
                <span class="status" :class="claseEstBien(e.estado)">{{ e.estado }}</span>
              </td>
              <td>
                <button class="action-btn view" @click="abrirFicha(e)" title="Ver ficha"><i class="fas fa-eye"></i></button>
                <router-link 
                  :to="'/bienestar/seguimiento?est=' + e.id" 
                  class="action-btn follow" 
                  style="display:inline-flex; align-items:center; justify-content:center"
                  title="Seguimiento"
                >
                  <i class="fas fa-chart-line"></i>
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="empty-state">No se encontraron estudiantes.</p>
    </article>

    <!-- Modal integral del estudiante (tabs) -->
    <div 
      v-if="modalVisible" 
      class="modal-overlay visible" 
      @click.self="modalVisible = false"
    >
      <div class="modal-box">
        <div class="modal-header">
          <h3>Ficha de {{ estudianteActual.nombres }} {{ estudianteActual.apellidos }}</h3>
          <button class="modal-close" @click="modalVisible = false" aria-label="Cerrar"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="ficha-hdr" style="display:flex; gap:14px; align-items:center; background:#f8fafc; border-radius:8px; padding:14px; margin-bottom:18px;">
            <div class="ficha-av" style="display:grid; place-items:center; width:52px; height:52px; border-radius:50%; background:#d5f5de; color:var(--uleam-green); font-weight:700; font-size:18px; flex-shrink:0;">
              {{ obtenerIniciales(estudianteActual.nombres, estudianteActual.apellidos) }}
            </div>
            <div>
              <strong style="font-size:15px; color:#111827">{{ estudianteActual.nombres }} {{ estudianteActual.apellidos }}</strong><br>
              <span style="color:#64748b; font-size:13px">{{ estudianteActual.correoInstitucional }} &mdash; {{ estudianteActual.carrera }}</span>
            </div>
          </div>
          <div class="modal-tabs">
            <button class="modal-tab" :class="{ active: activeTab === 'ficha' }" @click="activeTab = 'ficha'">Ficha</button>
            <button class="modal-tab" :class="{ active: activeTab === 'apoyos' }" @click="activeTab = 'apoyos'">Apoyos</button>
            <button class="modal-tab" :class="{ active: activeTab === 'observaciones' }" @click="activeTab = 'observaciones'">Observaciones</button>
            <button class="modal-tab" :class="{ active: activeTab === 'estado' }" @click="activeTab = 'estado'">Estado / Riesgo</button>
          </div>

          <!-- Tab Ficha -->
          <div v-show="activeTab === 'ficha'" class="tab-panel active">
            <div class="info-grid">
              <div class="info-row"><span class="info-label">Cédula</span><span class="info-value">{{ estudianteActual.cedula }}</span></div>
              <div class="info-row"><span class="info-label">Teléfono</span><span class="info-value">{{ estudianteActual.telefono || '—' }}</span></div>
              <div class="info-row"><span class="info-label">Facultad</span><span class="info-value">{{ estudianteActual.facultad || '—' }}</span></div>
              <div class="info-row"><span class="info-label">Semestre</span><span class="info-value">{{ estudianteActual.semestre || '—' }}</span></div>
              <div class="info-row"><span class="info-label">Tipo discapacidad</span><span class="info-value">{{ estudianteActual.tipoDiscapacidad || '—' }}</span></div>
              <div class="info-row"><span class="info-label">Grado (%)</span><span class="info-value">{{ estudianteActual.gradoDiscapacidad !== null ? estudianteActual.gradoDiscapacidad + '%' : '—' }}</span></div>
              <div class="info-row"><span class="info-label">Certificado</span><span class="info-value">{{ estudianteActual.certificado || '—' }}</span></div>
              <div class="info-row"><span class="info-label">Institución certif.</span><span class="info-value">{{ estudianteActual.institucionCertificadora || '—' }}</span></div>
              <div class="info-row full">
                <span class="info-label">Nivel de riesgo</span>
                <span class="info-value">
                  <span class="priority-badge" :class="claseNivelRiesgo(estudianteActual.nivelRiesgo)">{{ estudianteActual.nivelRiesgo }}</span>
                </span>
              </div>
              <div class="info-row full"><span class="info-label">Recomendaciones</span><span class="info-value">{{ estudianteActual.recomendaciones || 'Sin recomendaciones registradas.' }}</span></div>
            </div>
          </div>

          <!-- Tab Apoyos -->
          <div v-show="activeTab === 'apoyos'" class="tab-panel active">
            <div v-if="apoyosList.length > 0">
              <div 
                v-for="a in apoyosList" 
                :key="a.id" 
                class="item-card"
              >
                <div class="item-card-icon"><i class="fas" :class="'fa-' + getIcoApoyo(a.tipo)"></i></div>
                <div>
                  <strong>{{ a.tipo }}</strong>
                  <span>{{ a.descripcion || '—' }}</span>
                  <span>Responsable: {{ a.responsable || '—' }} &nbsp;|&nbsp; {{ a.fechaInicio || '—' }} &mdash; {{ a.fechaFin || 'Indefinido' }}</span>
                  <span>Estado: <span class="status" :class="a.estado === 'Activo' ? 'active' : 'inactive'" style="font-size:11px; padding:2px 8px">{{ a.estado }}</span></span>
                </div>
              </div>
            </div>
            <p v-else class="sin-datos">Sin apoyos registrados.</p>
          </div>

          <!-- Tab Observaciones (Seguimientos académicos o notas de atencion) -->
          <div v-show="activeTab === 'observaciones'" class="tab-panel active">
            <div v-if="observacionesList.length > 0">
              <div 
                v-for="o in observacionesList" 
                :key="o.id" 
                class="item-card"
              >
                <div class="item-card-icon purple"><i class="fas fa-clipboard"></i></div>
                <div>
                  <strong>{{ o.tipo }} &mdash; <span class="priority-badge" :class="claseNivelRiesgo(o.nivelRiesgo)">{{ o.nivelRiesgo }}</span></strong>
                  <span>{{ o.contenido }}</span>
                  <span>{{ formatearFecha(o.fecha) }}</span>
                </div>
              </div>
            </div>
            <p v-else class="sin-datos">Sin observaciones registradas.</p>
          </div>

          <!-- Tab Estado / Riesgo -->
          <div v-show="activeTab === 'estado'" class="tab-panel active">
            <form @submit.prevent="guardarEstadoEstudiante">
              <div class="mf-grid">
                <div class="mf-field">
                  <label for="sel-estado-est">Estado del estudiante</label>
                  <select id="sel-estado-est" v-model="formEstado.estado">
                    <option value="Activo">Activo</option>
                    <option value="En seguimiento">En seguimiento</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
                <div class="mf-field">
                  <label for="sel-riesgo-est">Nivel de riesgo</label>
                  <select id="sel-riesgo-est" v-model="formEstado.nivelRiesgo">
                    <option value="Bajo">Bajo</option>
                    <option value="Medio">Medio</option>
                    <option value="Alto">Alto</option>
                  </select>
                </div>
                <div class="mf-field full">
                  <label for="txt-recom">Recomendaciones</label>
                  <textarea id="txt-recom" v-model="formEstado.recomendaciones" placeholder="Indicaciones para docentes y bienestar..."></textarea>
                </div>
              </div>
              <div style="text-align:right; margin-top:14px">
                <button type="submit" class="primary-action"><i class="fas fa-save"></i> Guardar estado</button>
              </div>
            </form>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="secondary-action" @click="modalVisible = false">Cerrar</button>
          <router-link :to="'/bienestar/seguimiento?est=' + estudianteActual.id" class="primary-action">
            <i class="fas fa-chart-line"></i> Ver seguimiento
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  obtenerEstudiantes, 
  obtenerEstudiantePorId, 
  obtenerApoyosPorEstudiante, 
  obtenerObservacionesPorEstudiante, 
  actualizarEstadoEstudiante 
} from '../../services/storage.js';
import { 
  normalizarTexto, 
  obtenerIniciales, 
  claseNivelRiesgo, 
  formatearFecha 
} from '../../utils/helpers.js';
import { showToast } from '../../services/toast.js';

const estudiantes = ref([]);
const filtroBusqueda = ref('');
const filtroRiesgo = ref('');
const filtroEstado = ref('');

// Modal
const modalVisible = ref(false);
const activeTab = ref('ficha');
const estudianteActual = ref({});
const apoyosList = ref([]);
const observacionesList = ref([]);

const formEstado = ref({
  estado: 'Activo',
  nivelRiesgo: 'Bajo',
  recomendaciones: ''
});

onMounted(() => {
  cargarEstudiantes();
});

function cargarEstudiantes() {
  estudiantes.value = obtenerEstudiantes();
}

const estudiantesFiltrados = computed(() => {
  const query = normalizarTexto(filtroBusqueda.value.trim());
  const riesgo = filtroRiesgo.value;
  const estado = filtroEstado.value;

  return estudiantes.value.filter(e => {
    const txt = normalizarTexto(`${e.nombres} ${e.apellidos} ${e.cedula} ${e.carrera}`);
    const coincideBusqueda = !query || txt.includes(query);
    const coincideRiesgo = !riesgo || e.nivelRiesgo === riesgo;
    const coincideEstado = !estado || e.estado === estado;

    return coincideBusqueda && coincideRiesgo && coincideEstado;
  });
});

function claseEstBien(estado) {
  if (estado === 'En seguimiento') return 'active';
  if (estado === 'Egresado') return 'resolved';
  return 'inactive'; // Inactivo
}

function limpiarFiltros() {
  filtroBusqueda.value = '';
  filtroRiesgo.value = '';
  filtroEstado.value = '';
}

function abrirFicha(est) {
  estudianteActual.value = est;
  formEstado.value = {
    estado: est.estado,
    nivelRiesgo: est.nivelRiesgo || 'Bajo',
    recomendaciones: est.recomendaciones || ''
  };
  
  apoyosList.value = obtenerApoyosPorEstudiante(est.id);
  observacionesList.value = obtenerObservacionesPorEstudiante(est.id);
  
  activeTab.value = 'ficha';
  modalVisible.value = true;
}

function getIcoApoyo(tipo) {
  const map = { 
    Académico: 'graduation-cap', 
    Psicológico: 'brain', 
    Tecnológico: 'laptop', 
    Físico: 'wheelchair', 
    Social: 'heart' 
  };
  return map[tipo] || 'hands-helping';
}

function guardarEstadoEstudiante() {
  const res = actualizarEstadoEstudiante(
    estudianteActual.value.id,
    formEstado.value.estado,
    formEstado.value.nivelRiesgo,
    formEstado.value.recomendaciones.trim()
  );

  if (res.exito) {
    showToast(res.mensaje);
    cargarEstudiantes();
    // Actualizar datos del modal
    const upd = obtenerEstudiantePorId(estudianteActual.value.id);
    if (upd) {
      estudianteActual.value = upd;
    }
  } else {
    showToast(res.mensaje, 'error');
  }
}
</script>
