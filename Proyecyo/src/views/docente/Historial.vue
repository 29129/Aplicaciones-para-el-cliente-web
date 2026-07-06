<template>
  <div>
    <section class="page-heading">
      <div>
        <h2>Historial de seguimiento</h2>
        <p>Timeline completo de notas, asistencia y observaciones por estudiante.</p>
      </div>
    </section>

    <!-- Selector de estudiante y filtro periodo -->
    <div class="est-selector">
      <div>
        <label for="sel-est">Estudiante</label>
        <select id="sel-est" v-model="estudianteSeleccionadoId">
          <option value="">— Seleccionar estudiante —</option>
          <option v-for="e in misEstudiantes" :key="e.id" :value="e.id">
            {{ e.nombres }} {{ e.apellidos }}
          </option>
        </select>
      </div>
      <div>
        <label for="fil-periodo">Periodo</label>
        <input 
          type="text" 
          id="fil-periodo" 
          v-model="filtroPeriodo" 
          placeholder="Ej: 2026-1 (dejar vacío = todos)"
        />
      </div>
      <button class="secondary-action" @click="limpiarFiltros" type="button" style="align-self:end; height:42px;">
        <i class="fas fa-eraser"></i> Limpiar
      </button>
    </div>

    <!-- Timeline -->
    <article class="table-section">
      <div class="section-title-row">
        <h2>{{ tituloEstudiante }}</h2>
        <span>{{ totalLogs }}</span>
      </div>
      
      <div v-if="!estudianteSeleccionadoId" class="no-hist">
        <i class="fas fa-history"></i>
        Selecciona un estudiante para ver su historial de seguimiento.
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
          <span class="tl-fecha">{{ formatearFecha(s.fecha) }} &mdash; {{ s.asignatura || '—' }} · Periodo {{ s.periodo || '—' }}</span>
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
    </article>
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
import { formatearFecha } from '../../utils/helpers.js';

const docenteId = ref('');
const misEstudiantes = ref([]);
const estudianteSeleccionadoId = ref('');
const filtroPeriodo = ref('');

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

const tituloEstudiante = computed(() => {
  if (!estudianteSeleccionadoId.value) return 'Selecciona un estudiante';
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
  return 'asist'; // Regular
}

function limpiarFiltros() {
  estudianteSeleccionadoId.value = '';
  filtroPeriodo.value = '';
}
</script>
