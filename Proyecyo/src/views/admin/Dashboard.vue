<template>
  <div>
    <section class="dashboard-welcome">
      <h1>Bienvenido, Administrador</h1>
      <p>Sistema de registro y seguimiento de personas con capacidades especiales</p>
    </section>

    <section class="dashboard-metrics" aria-label="Resumen general">
      <article class="metric-card metric-blue">
        <div class="metric-icon">
          <i class="fas fa-users"></i>
        </div>
        <div>
          <span>Total de estudiantes</span>
          <strong>{{ stats.total }}</strong>
          <p>Todos los registros</p>
        </div>
      </article>
      <article class="metric-card metric-green">
        <div class="metric-icon">
          <i class="fas fa-wheelchair"></i>
        </div>
        <div>
          <span>Estudiantes activos</span>
          <strong>{{ stats.activos }}</strong>
          <p>Activos</p>
        </div>
      </article>
      <article class="metric-card metric-amber">
        <div class="metric-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div>
          <span>En seguimiento</span>
          <strong>{{ stats.enSeguimiento }}</strong>
          <p>Requieren atención</p>
        </div>
      </article>
      <article class="metric-card metric-purple">
        <div class="metric-icon">
          <i class="fas fa-file-alt"></i>
        </div>
        <div>
          <span>Seguimientos</span>
          <strong>{{ totalSeguimientos }}</strong>
          <p>Registros totales</p>
        </div>
      </article>
    </section>

    <section class="dashboard-layout">
      <div class="dashboard-side">
        <!-- Panel Gráfico de Discapacidades -->
        <article class="dashboard-panel">
          <h2>Estudiantes por tipo de discapacidad</h2>
          <div class="donut-wrap">
            <div class="donut-chart">
              <div>
                <strong>{{ stats.total }}</strong>
                <span>Total</span>
              </div>
            </div>
            <ul class="chart-legend">
              <li v-if="Object.keys(discapacidadesConteo).length === 0">Sin datos registrados</li>
              <li v-for="(cantidad, tipo) in discapacidadesConteo" :key="tipo">
                <span class="legend-dot" :class="claseDiscapacidad(tipo)"></span>
                {{ etiquetaDiscapacidad(tipo) }} 
                <strong>{{ cantidad }} ({{ ((cantidad / stats.total) * 100).toFixed(1) }}%)</strong>
              </li>
            </ul>
          </div>
        </article>

        <!-- Panel Últimos Registros -->
        <article class="dashboard-panel">
          <h2>Últimos registros</h2>
          <div class="recent-list">
            <p v-if="ultimosEstudiantes.length === 0" class="empty-hint">No hay registros aún.</p>
            <div 
              v-for="est in ultimosEstudiantes" 
              :key="est.id" 
              class="recent-person"
            >
              <div class="person-avatar">{{ obtenerIniciales(est.nombres, est.apellidos) }}</div>
              <div>
                <strong>{{ nombreCompleto(est) }}</strong>
                <span>Discapacidad {{ etiquetaDiscapacidad(est.tipoDiscapacidad) }}</span>
              </div>
              <time>{{ formatearFecha(est.fechaRegistro) }}</time>
            </div>
          </div>
          <router-link to="/admin/estudiantes" class="panel-link">Ver todos los registros</router-link>
        </article>
      </div>

      <!-- Panel Tabla de Estudiantes -->
      <article class="dashboard-panel students-dashboard-table">
        <div class="students-table-toolbar">
          <h2>Listado de estudiantes</h2>
          <div class="table-tools">
            <div class="dashboard-search">
              <i class="fas fa-search" aria-hidden="true"></i>
              <input 
                type="search" 
                v-model="filtroBusqueda" 
                placeholder="Buscar estudiante..."
              />
            </div>
            <router-link to="/admin/registro-estudiante" class="primary-action">
              <i class="fas fa-plus"></i>
              Nuevo estudiante
            </router-link>
          </div>
        </div>
        <table class="students-table dashboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombres</th>
              <th>Cédula</th>
              <th>Carrera</th>
              <th>Tipo de discapacidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="estudiantesFiltrados.length === 0">
              <td colspan="7" class="empty-row">No se encontraron estudiantes.</td>
            </tr>
            <tr 
              v-for="(est, index) in estudiantesFiltrados" 
              :key="est.id"
            >
              <td>{{ index + 1 }}</td>
              <td>{{ nombreCompleto(est) }}</td>
              <td>{{ est.cedula }}</td>
              <td>{{ est.carrera }}</td>
              <td>
                <span class="type-badge" :class="claseDiscapacidad(est.tipoDiscapacidad)">
                  {{ etiquetaDiscapacidad(est.tipoDiscapacidad) }}
                </span>
              </td>
              <td>
                <span class="status" :class="claseEstado(est.estado)">
                  {{ est.estado }}
                </span>
              </td>
              <td>
                <button 
                  class="action-btn view" 
                  @click="verDetalle(est)" 
                  aria-label="Ver estudiante"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button 
                  class="action-btn edit" 
                  @click="editarEstudiante(est)" 
                  aria-label="Editar estudiante"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  class="action-btn delete" 
                  @click="confirmarEliminar(est)" 
                  aria-label="Eliminar estudiante"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="table-more">
          <router-link to="/admin/estudiantes" class="secondary-action">
            Ver más
            <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>
      </article>
    </section>

    <footer class="dashboard-footer">© 2026 ULEAM - Todos los derechos reservados</footer>

    <!-- Modal Detalle Rápido -->
    <div 
      v-if="detalleEstudiante" 
      class="modal-overlay" 
      @click.self="detalleEstudiante = null"
    >
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
        <header class="modal-header">
          <h2 id="modal-titulo">Detalle del estudiante</h2>
          <button type="button" class="modal-close" @click="detalleEstudiante = null" aria-label="Cerrar">
            <i class="fas fa-times"></i>
          </button>
        </header>
        <div class="modal-body">
          <dl class="detalle-lista">
            <dt>Nombre</dt><dd>{{ nombreCompleto(detalleEstudiante) }}</dd>
            <dt>Cédula</dt><dd>{{ detalleEstudiante.cedula }}</dd>
            <dt>Correo</dt><dd>{{ detalleEstudiante.correoInstitucional }}</dd>
            <dt>Carrera</dt><dd>{{ detalleEstudiante.carrera }} — {{ detalleEstudiante.semestre || '' }}</dd>
            <dt>Discapacidad</dt><dd>{{ etiquetaDiscapacidad(detalleEstudiante.tipoDiscapacidad) }} ({{ detalleEstudiante.gradoDiscapacidad || 0 }}%)</dd>
            <dt>Estado</dt><dd>{{ detalleEstudiante.estado }}</dd>
            <dt>Registrado</dt><dd>{{ formatearFecha(detalleEstudiante.fechaRegistro) }}</dd>
          </dl>
        </div>
        <footer class="modal-footer">
          <button type="button" class="secondary-action modal-close-btn" @click="detalleEstudiante = null">Cerrar</button>
          <router-link :to="'/admin/registro-estudiante?id=' + detalleEstudiante.id" class="primary-action">
            Editar
          </router-link>
        </footer>
      </div>
    </div>

    <!-- Modal Eliminar -->
    <div 
      v-if="estudianteAEliminar" 
      class="modal-overlay" 
      @click.self="estudianteAEliminar = null"
    >
      <div class="modal-card modal-sm" role="alertdialog" aria-labelledby="modal-eliminar-titulo">
        <header class="modal-header">
          <h2 id="modal-eliminar-titulo"><i class="fas fa-exclamation-triangle"></i> Confirmar eliminación</h2>
        </header>
        <div class="modal-body">
          <p>¿Está seguro que desea eliminar a "{{ nombreCompleto(estudianteAEliminar) }}"?</p>
          <p class="modal-warning">Esta acción no se puede deshacer.</p>
        </div>
        <footer class="modal-footer">
          <button type="button" class="secondary-action" @click="estudianteAEliminar = null">Cancelar</button>
          <button type="button" class="primary-action btn-danger" @click="eliminarEstudianteConfirmado">Eliminar</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  obtenerEstudiantes, 
  obtenerSeguimientos, 
  obtenerEstadisticasEstudiantes, 
  contarPorDiscapacidad, 
  obtenerUltimosEstudiantes, 
  eliminarEstudiante 
} from '../../services/storage.js';
import { 
  nombreCompleto, 
  etiquetaDiscapacidad, 
  formatearFecha, 
  obtenerIniciales, 
  claseDiscapacidad, 
  claseEstado, 
  normalizarTexto 
} from '../../utils/helpers.js';
import { showToast } from '../../services/toast.js';

const router = useRouter();

const stats = ref({ total: 0, activos: 0, enSeguimiento: 0, inactivos: 0 });
const totalSeguimientos = ref(0);
const discapacidadesConteo = ref({});
const ultimosEstudiantes = ref([]);
const estudiantesList = ref([]);
const filtroBusqueda = ref('');

const detalleEstudiante = ref(null);
const estudianteAEliminar = ref(null);

onMounted(() => {
  cargarDatosDashboard();
});

function cargarDatosDashboard() {
  stats.value = obtenerEstadisticasEstudiantes();
  totalSeguimientos.value = obtenerSeguimientos().length;
  discapacidadesConteo.value = contarPorDiscapacidad();
  ultimosEstudiantes.value = obtenerUltimosEstudiantes(4);
  estudiantesList.value = obtenerEstudiantes();
}

const estudiantesFiltrados = computed(() => {
  let list = estudiantesList.value;
  const query = normalizarTexto(filtroBusqueda.value);
  if (query) {
    list = list.filter((est) => {
      const text = normalizarTexto([
        nombreCompleto(est), 
        est.cedula, 
        est.correoInstitucional, 
        est.carrera
      ].join(' '));
      return text.includes(query);
    });
  }
  return list.slice(0, 7);
});

function verDetalle(estudiante) {
  detalleEstudiante.value = estudiante;
}

function editarEstudiante(estudiante) {
  router.push(`/admin/registro-estudiante?id=${estudiante.id}`);
}

function confirmarEliminar(estudiante) {
  estudianteAEliminar.value = estudiante;
}

function eliminarEstudianteConfirmado() {
  if (estudianteAEliminar.value) {
    const id = estudianteAEliminar.value.id;
    eliminarEstudiante(id);
    showToast('Estudiante eliminado correctamente.');
    estudianteAEliminar.value = null;
    cargarDatosDashboard();
  }
}
</script>
