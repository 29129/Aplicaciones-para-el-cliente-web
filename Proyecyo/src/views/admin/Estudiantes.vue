<template>
  <section>
    <section class="page-heading">
      <div>
        <h2>Estudiantes Registrados</h2>
        <p>Consulta, filtra y administra los registros del sistema.</p>
      </div>
      <router-link to="/admin/registro-estudiante" class="primary-action">
        <i class="fas fa-user-plus"></i>
        Registrar estudiante
      </router-link>
    </section>

    <section class="summary-grid compact-summary">
      <article class="summary-card"><span class="summary-label">Registrados</span><strong>{{ stats.total }}</strong></article>
      <article class="summary-card"><span class="summary-label">Activos</span><strong>{{ stats.activos }}</strong></article>
      <article class="summary-card"><span class="summary-label">Seguimiento</span><strong>{{ stats.enSeguimiento }}</strong></article>
      <article class="summary-card"><span class="summary-label">Inactivos</span><strong>{{ stats.inactivos }}</strong></article>
    </section>

    <section class="filters-section">
      <div class="search-field">
        <label>Buscar</label>
        <div class="input-with-icon">
          <i class="fas fa-search"></i>
          <input v-model="busqueda" type="search" placeholder="Nombre, cédula o correo" />
        </div>
      </div>
      <div class="filter-field"><label>Carrera</label><select v-model="carrera"><option value="">Todas</option><option v-for="item in carreras" :key="item" :value="item">{{ item }}</option></select></div>
      <div class="filter-field"><label>Tipo</label><select v-model="tipo"><option value="">Todos</option><option v-for="item in tipos" :key="item" :value="item">{{ item }}</option></select></div>
      <div class="filter-field"><label>Estado</label><select v-model="estado"><option value="">Todos</option><option>Activo</option><option>Inactivo</option><option>En seguimiento</option></select></div>
      <button class="secondary-action" type="button" @click="limpiar">Limpiar</button>
    </section>

    <section class="table-section">
      <div class="section-title-row"><h2>Listado de estudiantes</h2><span>{{ filtrados.length }} registros</span></div>
      <table class="students-table management-table">
        <thead>
          <tr><th>Nombre</th><th>Cédula</th><th>Carrera</th><th>Tipo</th><th>Estado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          <tr v-if="pagina.length === 0"><td colspan="6" class="empty-row">No hay estudiantes con esos filtros.</td></tr>
          <tr v-for="est in pagina" :key="est.id">
            <td><strong>{{ nombreCompleto(est) }}</strong><span style="display:block;font-size:12px;">{{ est.correoInstitucional }}</span></td>
            <td>{{ est.cedula }}</td>
            <td>{{ est.carrera }}</td>
            <td>{{ etiquetaDiscapacidad(est.tipoDiscapacidad) }}</td>
            <td>{{ est.estado }}</td>
            <td>
              <button class="action-btn view" @click="detalle = est"><i class="fas fa-eye"></i></button>
              <button class="action-btn edit" @click="editar(est)"><i class="fas fa-edit"></i></button>
              <button class="action-btn follow" @click="seguimiento(est)"><i class="fas fa-chart-line"></i></button>
              <button class="action-btn delete" @click="aEliminar = est"><i class="fas fa-trash-alt"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
      <nav v-if="paginas > 1" class="pagination">
        <button class="page-btn" :disabled="actual === 1" @click="actual--">Anterior</button>
        <span class="page-info">Página {{ actual }} de {{ paginas }}</span>
        <button class="page-btn" :disabled="actual === paginas" @click="actual++">Siguiente</button>
      </nav>
    </section>

    <div v-if="detalle" class="modal-overlay" @click.self="detalle = null">
      <div class="modal-card">
        <header class="modal-header">
          <h2>Detalle del estudiante</h2>
          <button class="modal-close" @click="detalle = null">×</button>
        </header>
        <div class="modal-body">
          <dl class="detalle-lista">
            <dt>Nombre</dt><dd>{{ nombreCompleto(detalle) }}</dd>
            <dt>Cédula</dt><dd>{{ detalle.cedula }}</dd>
            <dt>Carrera</dt><dd>{{ detalle.carrera }}</dd>
            <dt>Discapacidad</dt><dd>{{ etiquetaDiscapacidad(detalle.tipoDiscapacidad) }}</dd>
            <dt>Estado</dt><dd>{{ detalle.estado }}</dd>
          </dl>
        </div>
        <footer class="modal-footer">
          <button class="secondary-action" @click="detalle = null">Cerrar</button>
          <button class="primary-action" @click="editar(detalle)">Editar</button>
        </footer>
      </div>
    </div>

    <div v-if="aEliminar" class="modal-overlay" @click.self="aEliminar = null">
      <div class="modal-card modal-sm">
        <header class="modal-header"><h2>Confirmar eliminación</h2></header>
        <div class="modal-body"><p>¿Eliminar a {{ nombreCompleto(aEliminar) }}?</p></div>
        <footer class="modal-footer">
          <button class="secondary-action" @click="aEliminar = null">Cancelar</button>
          <button class="primary-action btn-danger" @click="eliminar">Eliminar</button>
        </footer>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { eliminarEstudiante, obtenerEstadisticasEstudiantes, obtenerEstudiantes } from '../../services/storage.js';
import { nombreCompleto, etiquetaDiscapacidad, normalizarTexto } from '../../utils/helpers.js';
import { showToast } from '../../services/toast.js';

const router = useRouter();
const busqueda = ref('');
const carrera = ref('');
const tipo = ref('');
const estado = ref('');
const actual = ref(1);
const detalle = ref(null);
const aEliminar = ref(null);
const porPagina = 5;

const stats = computed(() => obtenerEstadisticasEstudiantes());
const lista = computed(() => obtenerEstudiantes());
const carreras = computed(() => [...new Set(lista.value.map((e) => e.carrera).filter(Boolean))].sort());
const tipos = computed(() => [...new Set(lista.value.map((e) => e.tipoDiscapacidad).filter(Boolean))].sort());
const filtrados = computed(() => lista.value.filter((est) => {
  const texto = normalizarTexto([nombreCompleto(est), est.cedula, est.correoInstitucional].join(' '));
  return (!busqueda.value || texto.includes(normalizarTexto(busqueda.value))) &&
    (!carrera.value || est.carrera === carrera.value) &&
    (!tipo.value || est.tipoDiscapacidad === tipo.value) &&
    (!estado.value || est.estado === estado.value);
}));
const paginas = computed(() => Math.max(1, Math.ceil(filtrados.value.length / porPagina)));
const pagina = computed(() => filtrados.value.slice((actual.value - 1) * porPagina, actual.value * porPagina));

function limpiar() {
  busqueda.value = '';
  carrera.value = '';
  tipo.value = '';
  estado.value = '';
  actual.value = 1;
}
function editar(est) { router.push(`/admin/registro-estudiante?id=${est.id}`); }
function seguimiento(est) { router.push(`/admin/seguimiento?est=${est.id}`); }
function eliminar() {
  const res = eliminarEstudiante(aEliminar.value.id);
  if (res.exito) showToast(res.mensaje);
  aEliminar.value = null;
}
</script>
