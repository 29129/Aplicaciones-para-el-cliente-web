<template>
  <div>
    <section class="page-heading">
      <div>
        <h2>Reportes de Bienestar</h2>
        <p>Genera reportes filtrables y exporta en CSV o formato imprimible.</p>
      </div>
    </section>

    <!-- Plantillas de reporte -->
    <div class="report-template-grid">
      <article class="report-template-card">
        <div class="report-template-icon green"><i class="fas fa-users"></i></div>
        <div>
          <h3>Estudiantes</h3>
          <p>Lista completa con estado, riesgo y discapacidad.</p>
          <button class="primary-action report-template-action" @click="generarReporte('estudiantes')">Generar</button>
        </div>
      </article>
      <article class="report-template-card">
        <div class="report-template-icon blue"><i class="fas fa-hands-helping"></i></div>
        <div>
          <h3>Apoyos activos</h3>
          <p>Apoyos académicos, psicológicos y tecnológicos activos.</p>
          <button class="primary-action report-template-action" @click="generarReporte('apoyos')">Generar</button>
        </div>
      </article>
      <article class="report-template-card">
        <div class="report-template-icon purple"><i class="fas fa-tools"></i></div>
        <div>
          <h3>Adaptaciones</h3>
          <p>Adaptaciones curriculares registradas por estudiante.</p>
          <button class="primary-action report-template-action" @click="generarReporte('adaptaciones')">Generar</button>
        </div>
      </article>
      <article class="report-template-card">
        <div class="report-template-icon amber"><i class="fas fa-exclamation-triangle"></i></div>
        <div>
          <h3>Casos de riesgo</h3>
          <p>Estudiantes con nivel de riesgo Medio o Alto.</p>
          <button class="primary-action report-template-action" @click="generarReporte('riesgo')">Generar</button>
        </div>
      </article>
    </div>

    <!-- Filtros -->
    <section class="filters-section reports-filters" aria-label="Filtros del reporte">
      <div class="filter-field">
        <label for="fil-riesgo-rep">Nivel de riesgo</label>
        <select id="fil-riesgo-rep" v-model="filtroRiesgo" @change="alCambiarFiltro">
          <option value="">Todos</option>
          <option value="Alto">Alto</option>
          <option value="Medio">Medio</option>
          <option value="Bajo">Bajo</option>
        </select>
      </div>
      <div class="filter-field">
        <label for="fil-estado-rep">Estado estudiante</label>
        <select id="fil-estado-rep" v-model="filtroEstado" @change="alCambiarFiltro">
          <option value="">Todos</option>
          <option value="Activo">Activo</option>
          <option value="En seguimiento">En seguimiento</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>
      <button class="secondary-action" @click="limpiarFiltros" type="button" style="margin-top:24px; height:42px;">
        <i class="fas fa-eraser"></i> Limpiar filtros
      </button>
    </section>

    <!-- Vista previa del reporte -->
    <div id="reporte-area" v-if="tipoActual !== null">
      <div class="acciones-reporte" style="display:flex; justify-content:flex-end; gap:12px; margin-bottom:10px">
        <button class="secondary-action" @click="exportarCSV"><i class="fas fa-download"></i> Exportar CSV</button>
        <button class="primary-action" @click="imprimir"><i class="fas fa-print"></i> Imprimir</button>
      </div>

      <div class="reporte-preview">
        <h2 style="color:var(--uleam-green); text-align:center; margin-bottom:6px">{{ reporteTitulo }}</h2>
        <p class="subtitulo" style="color:#64748b; text-align:center; font-size:14px; margin-bottom:20px">
          Generado el {{ reporteFecha }} &mdash; {{ datosActuales.length }} registro{{ datosActuales.length !== 1 ? 's' : '' }}
        </p>

        <div v-if="datosActuales.length === 0" class="reporte-vacio" style="text-align:center; color:#94a3b8; padding:24px">
          <i class="fas fa-inbox" style="font-size:36px; margin-bottom:10px; display:block"></i>
          No hay datos que coincidan con los filtros seleccionados.
        </div>
        <div v-else style="overflow-x:auto">
          <table style="width:100%; border-collapse:collapse; font-size:13px">
            <thead>
              <tr>
                <th 
                  v-for="c in reporteColumnas" 
                  :key="c"
                  style="background:#f8fafc; color:#374151; font-weight:700; padding:8px 12px; text-align:left; border-bottom:1px solid #e5ebf2;"
                >
                  {{ c }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(row, rIdx) in datosActuales" 
                :key="rIdx"
              >
                <td 
                  v-for="(val, cIdx) in row" 
                  :key="cIdx"
                  style="padding:8px 12px; text-align:left; border-bottom:1px solid #e5ebf2;"
                >
                  {{ val }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { 
  obtenerEstudiantes, 
  obtenerApoyos, 
  obtenerAdaptaciones, 
  obtenerEstudiantePorId 
} from '../../services/storage.js';
import { showToast } from '../../services/toast.js';

const filtroRiesgo = ref('');
const filtroEstado = ref('');

const tipoActual = ref(null);
const reporteTitulo = ref('');
const reporteColumnas = ref([]);
const datosActuales = ref([]);
const reporteFecha = ref('');

function alCambiarFiltro() {
  if (tipoActual.value) {
    generarReporte(tipoActual.value);
  }
}

function limpiarFiltros() {
  filtroRiesgo.value = '';
  filtroEstado.value = '';
  if (tipoActual.value) {
    generarReporte(tipoActual.value);
  }
}

function generarReporte(tipo) {
  tipoActual.value = tipo;
  const riesgo = filtroRiesgo.value;
  const estado = filtroEstado.value;
  let filas = [], columnas = [], titulo = '';

  if (tipo === 'estudiantes') {
    titulo = 'Reporte General de Estudiantes';
    columnas = ['Nombre', 'Cédula', 'Carrera', 'Discapacidad', 'Riesgo', 'Estado'];
    filas = obtenerEstudiantes()
      .filter(e => (!riesgo || e.nivelRiesgo === riesgo) && (!estado || e.estado === estado))
      .map(e => [`${e.nombres} ${e.apellidos}`, e.cedula, e.carrera, e.tipoDiscapacidad || '—', e.nivelRiesgo || '—', e.estado]);
  } else if (tipo === 'apoyos') {
    titulo = 'Reporte de Apoyos Activos';
    columnas = ['Estudiante', 'Tipo apoyo', 'Descripción', 'Responsable', 'Inicio', 'Estado'];
    filas = obtenerApoyos().map(a => {
      const est = obtenerEstudiantePorId(a.estudianteId);
      if (riesgo && est && est.nivelRiesgo !== riesgo) return null;
      if (estado && est && est.estado !== estado) return null;
      return [
        est ? `${est.nombres} ${est.apellidos}` : '—', 
        a.tipo, 
        a.descripcion || '—', 
        a.responsable || '—', 
        a.fechaInicio || '—', 
        a.estado
      ];
    }).filter(Boolean);
  } else if (tipo === 'adaptaciones') {
    titulo = 'Reporte de Adaptaciones Curriculares';
    columnas = ['Estudiante', 'Tipo', 'Descripción', 'Vigencia', 'Observaciones'];
    filas = obtenerAdaptaciones().map(a => {
      const est = obtenerEstudiantePorId(a.estudianteId);
      if (riesgo && est && est.nivelRiesgo !== riesgo) return null;
      if (estado && est && est.estado !== estado) return null;
      return [
        est ? `${est.nombres} ${est.apellidos}` : '—', 
        a.tipo, 
        a.descripcion || '—', 
        a.vigencia || '—', 
        a.observaciones || '—'
      ];
    }).filter(Boolean);
  } else if (tipo === 'riesgo') {
    titulo = 'Reporte de Estudiantes en Riesgo';
    columnas = ['Nombre', 'Carrera', 'Discapacidad', 'Riesgo', 'Estado', 'Recomendaciones'];
    filas = obtenerEstudiantes()
      .filter(e => (e.nivelRiesgo === 'Alto' || e.nivelRiesgo === 'Medio') && (!estado || e.estado === estado))
      .map(e => [`${e.nombres} ${e.apellidos}`, e.carrera, e.tipoDiscapacidad || '—', e.nivelRiesgo, e.estado, e.recomendaciones || '—']);
  }

  datosActuales.value = filas;
  reporteTitulo.value = titulo;
  reporteColumnas.value = columnas;
  reporteFecha.value = new Date().toLocaleDateString('es-EC');
  
  showToast(`Reporte de ${titulo.toLowerCase()} generado.`);
}

function exportarCSV() {
  if (!datosActuales.value.length) {
    showToast('No hay datos para exportar.', 'info');
    return;
  }

  const header = reporteColumnas.value.map(c => `"${c}"`).join(',');
  const rows = datosActuales.value.map(f => f.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const csv = '\uFEFF' + header + '\n' + rows;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte_bienestar_${tipoActual.value}_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Archivo CSV descargado.');
}

function imprimir() {
  window.print();
}
</script>
