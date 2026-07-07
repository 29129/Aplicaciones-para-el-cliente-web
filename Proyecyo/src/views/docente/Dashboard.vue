<template>
  <div>
    <section class="dashboard-welcome">
      <h1>Bienvenido/a, {{ docenteNombre }}</h1>
      <p>Panel de seguimiento académico — Estudiantes con capacidades especiales</p>
    </section>

    <!-- Métricas -->
    <section class="dashboard-metrics" aria-label="Resumen">
      <article class="metric-card metric-blue">
        <div class="metric-icon"><i class="fas fa-users"></i></div>
        <div>
          <span>Estudiantes asignados</span>
          <strong>{{ totalAsignados }}</strong>
          <p>A tu cargo</p>
        </div>
      </article>
      <article class="metric-card metric-green">
        <div class="metric-icon"><i class="fas fa-check-circle"></i></div>
        <div>
          <span>Estado activo</span>
          <strong>{{ totalActivos }}</strong>
          <p>Sin alertas</p>
        </div>
      </article>
      <article class="metric-card metric-amber">
        <div class="metric-icon"><i class="fas fa-exclamation-triangle"></i></div>
        <div>
          <span>En riesgo académico</span>
          <strong>{{ totalEnRiesgo }}</strong>
          <p>Requieren atención</p>
        </div>
      </article>
      <article class="metric-card metric-purple">
        <div class="metric-icon"><i class="fas fa-clipboard-list"></i></div>
        <div>
          <span>Seguimientos registrados</span>
          <strong>{{ totalSeguimientosRegistrados }}</strong>
          <p>Por ti</p>
        </div>
      </article>
    </section>

    <section class="dashboard-layout">
      <div class="dashboard-side">
        <!-- Alertas académicas -->
        <article class="dashboard-panel">
          <h2>Alertas académicas</h2>
          <div class="alerta-list-body">
            <p v-if="alertasRiesgo.length === 0" class="alerta-empty">Sin alertas activas.</p>
            <div
              v-for="alerta in alertasRiesgo"
              :key="alerta.id"
              class="alerta-card"
            >
              <i class="fas fa-exclamation-circle"></i>
              <div>
                <strong>{{ alerta.nombre }}</strong>
                <span>{{ alerta.asignatura }} — En riesgo académico</span>
              </div>
            </div>
          </div>
        </article>

        <!-- Accesos rápidos -->
        <article class="dashboard-panel">
          <h2>Accesos rápidos</h2>
          <div class="dashboard-panel-body">
            <div class="acceso-grid">
              <router-link to="/docente/estudiantes" class="acceso-btn">
                <i class="fas fa-users"></i>
                Mis estudiantes
              </router-link>
              <router-link to="/docente/seguimiento" class="acceso-btn accent-blue">
                <i class="fas fa-plus-circle"></i>
                Nuevo seguimiento
              </router-link>
              <router-link to="/docente/historial" class="acceso-btn accent-purple">
                <i class="fas fa-history"></i>
                Ver historial
              </router-link>
            </div>
          </div>
        </article>
      </div>

      <!-- Tabla de estudiantes asignados -->
      <article class="dashboard-panel students-dashboard-table">
        <div class="students-table-toolbar">
          <h2>Mis estudiantes</h2>
          <router-link to="/docente/estudiantes" class="secondary-action">
            Ver todos <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>
        <div style="overflow-x:auto" v-if="misEstudiantes.length > 0">
          <table class="students-table dashboard-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Carrera</th>
                <th>Discapacidad</th>
                <th>Últ. seguimiento</th>
                <th>Estado acad.</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="e in misEstudiantes" 
                :key="e.id"
              >
                <td>
                  <strong>{{ e.nombres }} {{ e.apellidos }}</strong>
                  <span style="display:block; font-size:12px; color:var(--text-muted);">{{ e.correoInstitucional }}</span>
                </td>
                <td>{{ e.carrera }}</td>
                <td>{{ e.tipoDiscapacidad || '—' }}</td>
                <td>{{ getUltimoSeguimientoFecha(e.id) }}</td>
                <td>
                  <span 
                    v-if="getUltimoSeguimientoEstado(e.id) !== '—'" 
                    class="seg-chip" 
                    :class="chipEstadoAcad(getUltimoSeguimientoEstado(e.id))"
                  >
                    {{ getUltimoSeguimientoEstado(e.id) }}
                  </span>
                  <span v-else>—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="empty-state" style="padding:20px; text-align:center;">
          No tienes estudiantes asignados. El administrador debe asignarte estudiantes desde el módulo de Usuarios.
        </p>
      </article>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { 
  obtenerSesion, 
  obtenerUsuarios, 
  obtenerEstudiantePorId, 
  obtenerSeguimientosPorDocente, 
  obtenerSeguimientosPorEstudiante 
} from '../../services/storage.js';
import { formatearFecha } from '../../utils/helpers.js';

const docenteNombre = ref('Docente');
const misEstudiantes = ref([]);
const misSeguimientos = ref([]);
const docenteId = ref('');

onMounted(() => {
  const sesion = obtenerSesion();
  if (sesion) {
    docenteNombre.value = sesion.nombres;
    docenteId.value = sesion.id;
    
    // Buscar docente en usuarios
    const usuariosList = obtenerUsuarios();
    const currentDocente = usuariosList.find(u => u.id === sesion.id);
    
    if (currentDocente && currentDocente.estudiantesAsignados) {
      misEstudiantes.value = currentDocente.estudiantesAsignados
        .map(id => obtenerEstudiantePorId(id))
        .filter(Boolean);
    }
    
    misSeguimientos.value = obtenerSeguimientosPorDocente(sesion.id);
  }
});

const totalAsignados = computed(() => misEstudiantes.value.length);
const totalActivos = computed(() => misEstudiantes.value.filter(e => e.estado === 'Activo').length);
const totalEnRiesgo = computed(() => {
  const enRiesgo = misSeguimientos.value.filter(s => s.estadoAcademico === 'En riesgo');
  const ids = enRiesgo.map(s => s.estudianteId);
  return new Set(ids).size;
});
const totalSeguimientosRegistrados = computed(() => misSeguimientos.value.length);

// Alertas académicas (estudiantes con estatus 'En riesgo' en sus seguimientos)
const alertasRiesgo = computed(() => {
  const enRiesgo = misSeguimientos.value.filter(s => s.estadoAcademico === 'En riesgo');
  // Obtener únicos por estudiante
  const unicos = [];
  const cache = new Set();
  enRiesgo.forEach(s => {
    if (!cache.has(s.estudianteId)) {
      cache.add(s.estudianteId);
      const est = misEstudiantes.value.find(e => e.id === s.estudianteId);
      unicos.push({
        id: s.id,
        nombre: est ? `${est.nombres} ${est.apellidos}` : 'Desconocido',
        asignatura: s.asignatura
      });
    }
  });
  return unicos.slice(0, 4);
});

// Helpers de seguimiento por estudiante (específicos del docente logueado)
function getUltimoSeguimientoDocente(studentId) {
  const list = obtenerSeguimientosPorEstudiante(studentId)
    .filter(s => s.docenteId === docenteId.value);
  return list[0] || null;
}

function getUltimoSeguimientoFecha(studentId) {
  const seg = getUltimoSeguimientoDocente(studentId);
  return seg ? formatearFecha(seg.fecha) : 'Sin registros';
}

function getUltimoSeguimientoEstado(studentId) {
  const seg = getUltimoSeguimientoDocente(studentId);
  return seg ? seg.estadoAcademico : '—';
}

function chipEstadoAcad(estado) {
  const map = { Bueno: 'ok', Regular: 'asist', 'En riesgo': 'riesgo' };
  return map[estado] || 'asist';
}
</script>
