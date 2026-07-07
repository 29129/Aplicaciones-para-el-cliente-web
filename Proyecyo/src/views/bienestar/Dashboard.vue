<template>
  <div>
    <section class="dashboard-welcome">
      <h1>Bienvenido/a, {{ bienestarNombre }}</h1>
      <p>Panel integral de atención y seguimiento de personas con capacidades especiales</p>
    </section>

    <!-- Métricas -->
    <section class="dashboard-metrics" aria-label="Resumen">
      <article class="metric-card metric-green">
        <div class="metric-icon"><i class="fas fa-users"></i></div>
        <div>
          <span>Total estudiantes</span>
          <strong>{{ totalEstudiantes }}</strong>
          <p>Registrados</p>
        </div>
      </article>
      <article class="metric-card metric-amber">
        <div class="metric-icon"><i class="fas fa-exclamation-triangle"></i></div>
        <div>
          <span>En seguimiento</span>
          <strong>{{ totalEnSeguimiento }}</strong>
          <p>Casos activos</p>
        </div>
      </article>
      <article class="metric-card metric-purple">
        <div class="metric-icon"><i class="fas fa-exclamation-circle"></i></div>
        <div>
          <span>Riesgo alto</span>
          <strong>{{ totalRiesgoAlto }}</strong>
          <p>Atención prioritaria</p>
        </div>
      </article>
      <article class="metric-card metric-blue">
        <div class="metric-icon"><i class="fas fa-hands-helping"></i></div>
        <div>
          <span>Apoyos activos</span>
          <strong>{{ totalApoyosActivos }}</strong>
          <p>En curso</p>
        </div>
      </article>
    </section>

    <section class="dashboard-layout">
      <div class="dashboard-side">
        <!-- Alertas de riesgo -->
        <article class="dashboard-panel">
          <h2>Alertas de riesgo</h2>
          <div class="alerta-list-body">
            <p v-if="alertasRiesgo.length === 0" class="alerta-empty">Sin alertas activas.</p>
            <div
              v-for="alerta in alertasRiesgo"
              :key="alerta.id"
              class="alerta-item"
              :class="alerta.nivelRiesgo === 'Alto' ? 'high' : 'medium'"
            >
              <i class="fas fa-exclamation-circle"></i>
              <div>
                <strong>{{ alerta.nombres }} {{ alerta.apellidos }}</strong>
                <span>Riesgo {{ alerta.nivelRiesgo }} — {{ alerta.tipoDiscapacidad || '—' }} — {{ alerta.carrera }}</span>
              </div>
            </div>
          </div>
          <router-link class="panel-link" to="/bienestar/estudiantes">Ver todos los estudiantes</router-link>
        </article>

        <!-- Accesos rápidos -->
        <article class="dashboard-panel">
          <h2>Accesos rápidos</h2>
          <div class="dashboard-panel-body">
            <div class="acceso-grid">
              <router-link to="/bienestar/seguimiento" class="acceso-btn">
                <i class="fas fa-plus-circle"></i>
                Nuevo seguimiento
              </router-link>
              <router-link to="/bienestar/adaptaciones" class="acceso-btn accent-blue">
                <i class="fas fa-tools"></i>
                Adaptaciones
              </router-link>
              <router-link to="/bienestar/reportes" class="acceso-btn accent-purple">
                <i class="fas fa-file-alt"></i>
                Reportes
              </router-link>
            </div>
          </div>
        </article>
      </div>

      <!-- Tabla de estudiantes con mayor riesgo -->
      <article class="dashboard-panel students-dashboard-table">
        <div class="students-table-toolbar">
          <h2>Estudiantes con mayor riesgo</h2>
          <router-link to="/bienestar/estudiantes" class="secondary-action">
            Ver todos <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>
        <div style="overflow-x:auto" v-if="estudiantesRiesgoOrdenado.length > 0">
          <table class="students-table dashboard-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Discapacidad</th>
                <th>Riesgo</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="e in estudiantesRiesgoOrdenado" 
                :key="e.id"
              >
                <td>
                  <strong>{{ e.nombres }} {{ e.apellidos }}</strong>
                  <span style="display:block; font-size:12px; color:var(--text-muted);">{{ e.correoInstitucional }}</span>
                </td>
                <td>{{ e.tipoDiscapacidad || '—' }}</td>
                <td>
                  <span class="priority-badge" :class="claseNivelRiesgo(e.nivelRiesgo)">
                    {{ e.nivelRiesgo || 'Bajo' }}
                  </span>
                </td>
                <td>
                  <span class="status" :class="claseEstEstado(e.estado)">{{ e.estado }}</span>
                </td>
                <td>
                  <router-link 
                    :to="'/bienestar/seguimiento?est=' + e.id" 
                    class="action-btn follow" 
                    style="display:inline-flex; align-items:center; justify-content:center" 
                    title="Ver seguimiento"
                  >
                    <i class="fas fa-eye"></i>
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="empty-state">No hay estudiantes registrados.</p>
      </article>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { obtenerSesion, obtenerEstudiantes, obtenerApoyos } from '../../services/storage.js';
import { claseNivelRiesgo } from '../../utils/helpers.js';

const bienestarNombre = ref('Bienestar');
const estudiantes = ref([]);
const apoyosActivos = ref([]);

onMounted(() => {
  const sesion = obtenerSesion();
  if (sesion) {
    bienestarNombre.value = sesion.nombres;
  }
  estudiantes.value = obtenerEstudiantes();
  apoyosActivos.value = obtenerApoyos().filter(a => a.estado === 'Activo');
});

const totalEstudiantes = computed(() => estudiantes.value.length);
const totalEnSeguimiento = computed(() => estudiantes.value.filter(e => e.estado === 'En seguimiento').length);
const totalRiesgoAlto = computed(() => estudiantes.value.filter(e => e.nivelRiesgo === 'Alto').length);
const totalApoyosActivos = computed(() => apoyosActivos.value.length);

const alertasRiesgo = computed(() => {
  return estudiantes.value
    .filter(e => e.nivelRiesgo === 'Alto' || e.nivelRiesgo === 'Medio')
    .sort((a, b) => (a.nivelRiesgo === 'Alto' ? -1 : 1))
    .slice(0, 5);
});

const estudiantesRiesgoOrdenado = computed(() => {
  const orden = { Alto: 0, Medio: 1, Bajo: 2 };
  return [...estudiantes.value]
    .sort((a, b) => (orden[a.nivelRiesgo] || 2) - (orden[b.nivelRiesgo] || 2))
    .slice(0, 6);
});

function claseEstEstado(estado) {
  if (estado === 'En seguimiento') return 'active';
  if (estado === 'Egresado') return 'resolved';
  return 'inactive'; // Inactivo
}
</script>
