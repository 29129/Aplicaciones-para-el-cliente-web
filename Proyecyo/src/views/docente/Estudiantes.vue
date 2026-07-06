<template>
  <div>
    <section class="page-heading">
      <div>
        <h2>Mis estudiantes asignados</h2>
        <p>Consulta la ficha y adaptaciones de cada estudiante a tu cargo.</p>
      </div>
      <router-link to="/docente/seguimiento" class="primary-action">
        <i class="fas fa-plus"></i> Nuevo seguimiento
      </router-link>
    </section>

    <!-- Buscador -->
    <section class="filters-section" style="grid-template-columns:1fr auto" aria-label="Buscar">
      <div class="search-field">
        <label for="est-search">Buscar estudiante</label>
        <div class="input-with-icon">
          <i class="fas fa-search" aria-hidden="true"></i>
          <input 
            type="search" 
            id="est-search" 
            v-model="filtroBusqueda" 
            placeholder="Nombre o cédula..."
          />
        </div>
      </div>
      <button class="secondary-action" @click="limpiarFiltro" type="button" style="align-self:end; height:42px;">
        <i class="fas fa-eraser"></i> Limpiar
      </button>
    </section>

    <!-- Tabla -->
    <article class="table-section">
      <div class="section-title-row">
        <h2>Listado</h2>
        <span>{{ estudiantesFiltrados.length }} estudiante{{ estudiantesFiltrados.length !== 1 ? 's' : '' }}</span>
      </div>
      <div style="overflow-x:auto" v-if="misEstudiantes.length > 0">
        <table class="students-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Cédula</th>
              <th>Carrera / Semestre</th>
              <th>Discapacidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="estudiantesFiltrados.length === 0">
              <td colspan="6" class="empty-row" style="text-align:center; padding: 20px;">
                No se encontraron estudiantes.
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
              <td>{{ e.carrera }}<span style="color:#94a3b8; font-size:12px"> {{ e.semestre || '' }}</span></td>
              <td>{{ e.tipoDiscapacidad || '—' }}</td>
              <td><span class="status" :class="claseEstado(e.estado)">{{ e.estado }}</span></td>
              <td>
                <button class="action-btn view" @click="verFicha(e)" aria-label="Ver ficha"><i class="fas fa-eye"></i></button>
                <router-link 
                  :to="'/docente/seguimiento?est=' + e.id" 
                  class="action-btn follow" 
                  aria-label="Nuevo seguimiento"
                  style="display:inline-flex; align-items:center; justify-content:center;"
                >
                  <i class="fas fa-plus-circle"></i>
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="empty-state">
        No tienes estudiantes asignados aún. Solicita al administrador que te asigne estudiantes.
      </p>
    </article>

    <!-- Modal ficha del estudiante (solo lectura) -->
    <div 
      v-if="fichaEstudiante" 
      class="modal-overlay visible" 
      @click.self="fichaEstudiante = null"
    >
      <div class="modal-box">
        <div class="modal-header">
          <h3>Ficha del estudiante</h3>
          <button class="modal-close" @click="fichaEstudiante = null" aria-label="Cerrar"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="ficha-header">
            <div class="ficha-avatar">
              {{ obtenerIniciales(fichaEstudiante.nombres, fichaEstudiante.apellidos) }}
            </div>
            <div>
              <strong style="font-size:15px; color:#111827">{{ fichaEstudiante.nombres }} {{ fichaEstudiante.apellidos }}</strong><br>
              <span style="color:#64748b; font-size:13px">{{ fichaEstudiante.correoInstitucional }}</span>
            </div>
          </div>
          <div class="info-grid">
            <div class="info-row"><span class="info-label">Cédula</span><span class="info-value">{{ fichaEstudiante.cedula }}</span></div>
            <div class="info-row"><span class="info-label">Teléfono</span><span class="info-value">{{ fichaEstudiante.telefono || '—' }}</span></div>
            <div class="info-row"><span class="info-label">Carrera</span><span class="info-value">{{ fichaEstudiante.carrera }}</span></div>
            <div class="info-row"><span class="info-label">Semestre</span><span class="info-value">{{ fichaEstudiante.semestre || '—' }}</span></div>
            <div class="info-row"><span class="info-label">Tipo discapacidad</span><span class="info-value">{{ fichaEstudiante.tipoDiscapacidad || '—' }}</span></div>
            <div class="info-row"><span class="info-label">Grado (%)</span><span class="info-value">{{ fichaEstudiante.gradoDiscapacidad !== null ? fichaEstudiante.gradoDiscapacidad + '%' : '—' }}</span></div>
            <div class="info-row full">
              <span class="info-label">Estado</span>
              <span class="info-value">
                <span class="status" :class="claseEstado(fichaEstudiante.estado)">{{ fichaEstudiante.estado }}</span>
              </span>
            </div>
          </div>
          <h4 style="margin:16px 0 8px; color:#374151; font-size:13px; font-weight:700">
            <i class="fas fa-tools" style="margin-right:6px; color:var(--uleam-green)"></i>
            Adaptaciones registradas (solo lectura)
          </h4>
          
          <div class="adaptaciones-list" v-if="adaptacionesFicha.length > 0">
            <div 
              v-for="a in adaptacionesFicha" 
              :key="a.id" 
              class="adapt-item"
            >
              <i class="fas fa-check-circle"></i>
              <div>
                <strong style="color:#111827">{{ a.tipo || 'Adaptación' }}</strong>
                <p v-if="a.descripcion" style="color:#64748b; margin-top:3px">{{ a.descripcion }}</p>
                <span v-if="a.vigencia" style="color:#94a3b8; font-size:11px">Vigencia: {{ a.vigencia }}</span>
              </div>
            </div>
          </div>
          <p v-else style="color:#94a3b8; font-size:13px">Sin adaptaciones registradas por bienestar.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="secondary-action" @click="fichaEstudiante = null">Cerrar</button>
          <router-link :to="'/docente/seguimiento?est=' + fichaEstudiante.id" class="primary-action">
            <i class="fas fa-plus"></i> Registrar seguimiento
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { 
  obtenerSesion, 
  obtenerUsuarios, 
  obtenerEstudiantePorId, 
  obtenerAdaptaciones 
} from '../../services/storage.js';
import { 
  normalizarTexto, 
  obtenerIniciales, 
  claseEstado 
} from '../../utils/helpers.js';

const misEstudiantes = ref([]);
const filtroBusqueda = ref('');
const fichaEstudiante = ref(null);
const adaptacionesFicha = ref([]);

onMounted(() => {
  const sesion = obtenerSesion();
  if (sesion) {
    const list = obtenerUsuarios();
    const current = list.find(x => x.id === sesion.id);
    if (current && current.estudiantesAsignados) {
      misEstudiantes.value = current.estudiantesAsignados
        .map(id => obtenerEstudiantePorId(id))
        .filter(Boolean);
    }
  }
});

const estudiantesFiltrados = computed(() => {
  const query = normalizarTexto(filtroBusqueda.value.trim());
  if (!query) return misEstudiantes.value;

  return misEstudiantes.value.filter(e => {
    const txt = normalizarTexto(`${e.nombres} ${e.apellidos} ${e.cedula}`);
    return txt.includes(query);
  });
});

function limpiarFiltro() {
  filtroBusqueda.value = '';
}

function verFicha(estudiante) {
  fichaEstudiante.value = estudiante;
  // Cargar adaptaciones
  adaptacionesFicha.value = obtenerAdaptaciones()
    .filter(a => a.estudianteId === estudiante.id);
}
</script>
