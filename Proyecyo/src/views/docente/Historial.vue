<template>
  <div>
    <section class="page-heading">
      <div>
        <h2>Historial de seguimiento</h2>
        <p>Timeline completo de notas, asistencia y observaciones por estudiante.</p>
      </div>
    </section>

    <div class="hist-layout">
      <!-- Lista lateral de estudiantes -->
      <aside class="hist-sidebar">
        <article class="dashboard-panel">
          <h2>Estudiantes</h2>
          <div class="dashboard-panel-body">
            <div class="panel-search">
              <i class="fas fa-search"></i>
              <input
                type="search"
                v-model="filtroBusqueda"
                placeholder="Buscar estudiante..."
              />
            </div>
            <div class="est-list">
              <p v-if="estudiantesFiltrados.length === 0" class="est-list-empty">Sin estudiantes asignados.</p>
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
                  <span>{{ e.carrera || 'Sin carrera' }}</span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </aside>

      <!-- Panel de historial -->
      <article class="dashboard-panel hist-detail">
        <div class="hist-toolbar">
          <div>
            <h2>{{ tituloEstudiante }}</h2>
            <span v-if="estudianteSeleccionadoId" class="hist-count">{{ totalLogs }}</span>
          </div>
          <div v-if="estudianteSeleccionadoId" class="hist-period-filter">
            <label for="fil-periodo">Periodo</label>
            <input
              type="text"
              id="fil-periodo"
              v-model="filtroPeriodo"
              placeholder="Ej: 2026-1"
            />
            <button class="secondary-action" @click="limpiarFiltros" type="button">
              <i class="fas fa-eraser"></i> Limpiar
            </button>
          </div>
        </div>

        <div class="hist-body">
          <div v-if="!estudianteSeleccionadoId" class="no-hist">
            <i class="fas fa-history"></i>
            Selecciona un estudiante de la lista para ver su historial de seguimiento.
          </div>
          <div v-else-if="historialFiltrado.length === 0" class="no-hist">
            <i class="fas fa-clipboard"></i>
            No hay registros de seguimiento{{ filtroPeriodo ? ' para el periodo "' + filtroPeriodo + '"' : '' }}.
          </div>
          <div v-else class="timeline-ext">
            <div
              v-for="s in historialFiltrado"
              :key="s.id"
              class="tl-item"
              :class="{ riesgo: s.estadoAcademico === 'En riesgo' }"
            >
              <span class="tl-fecha">{{ formatearFecha(s.fecha) }} — {{ s.asignatura || '—' }} · Periodo {{ s.periodo || '—' }}</span>
              <div class="tl-card">
                <strong>{{ s.asignatura || '—' }}</strong>
                <p v-if="s.observaciones" class="tl-obs">{{ s.observaciones }}</p>
                <div class="tl-chips">
                  <span v-if="s.nota !== null" class="seg-chip nota">
                    <i class="fas fa-star"></i> Nota: {{ s.nota.toFixed(1) }}
                  </span>
                  <span v-if="s.asistencia !== null" class="seg-chip asist">
                    <i class="fas fa-user-check"></i> Asistencia: {{ s.asistencia }}%
                  </span>
                  <span class="seg-chip" :class="claseSegEstado(s.estadoAcademico)">
                    {{ s.estadoAcademico }}
                  </span>
                </div>
                <p v-if="s.comentarios" class="tl-coment">Comentario: {{ s.comentarios }}</p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  obtenerSesion,
  obtenerUsuarios,
  obtenerEstudiantePorId,
  obtenerSeguimientosPorEstudiante
} from '../../services/storage.js';
import { formatearFecha, obtenerIniciales, normalizarTexto } from '../../utils/helpers.js';

const docenteId = ref('');
const misEstudiantes = ref([]);
const estudianteSeleccionadoId = ref('');
const filtroPeriodo = ref('');
const filtroBusqueda = ref('');

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
});

const estudiantesFiltrados = computed(() => {
  const query = normalizarTexto(filtroBusqueda.value.trim());
  if (!query) return misEstudiantes.value;
  return misEstudiantes.value.filter(e =>
    normalizarTexto(`${e.nombres} ${e.apellidos} ${e.carrera || ''}`).includes(query)
  );
});

function seleccionarEstudiante(id) {
  estudianteSeleccionadoId.value = id;
}

const tituloEstudiante = computed(() => {
  if (!estudianteSeleccionadoId.value) return 'Historial de seguimiento';
  const est = misEstudiantes.value.find(e => e.id === estudianteSeleccionadoId.value);
  return est ? `${est.nombres} ${est.apellidos}` : 'Estudiante';
});

const historialFiltrado = computed(() => {
  if (!estudianteSeleccionadoId.value) return [];
  let list = obtenerSeguimientosPorEstudiante(estudianteSeleccionadoId.value)
    .filter(s => s.docenteId === docenteId.value);

  const periodo = filtroPeriodo.value.trim();
  if (periodo) {
    list = list.filter(s => (s.periodo || '').includes(periodo));
  }
  return list.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
});

const totalLogs = computed(() => {
  if (!estudianteSeleccionadoId.value) return '';
  const count = historialFiltrado.value.length;
  return `${count} registro${count !== 1 ? 's' : ''}`;
});

function claseSegEstado(estado) {
  if (estado === 'Bueno') return 'ok';
  if (estado === 'En riesgo') return 'riesgo';
  return 'asist';
}

function limpiarFiltros() {
  filtroPeriodo.value = '';
}
</script>

<style scoped>
.hist-count {
  display: inline-block;
  margin-top: 4px;
  color: #64748b;
  font-size: 13px;
}
</style>
