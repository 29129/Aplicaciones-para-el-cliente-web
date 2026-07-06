<template>
  <div>
    <section class="page-heading">
      <div>
        <h2>Configuración del sistema</h2>
        <p>Ajusta parámetros institucionales, notificaciones, seguridad y catálogos.</p>
      </div>
      <button class="primary-action" @click="guardarConfiguracion" type="button">
        <i class="fas fa-save"></i> Guardar cambios
      </button>
    </section>

    <section class="settings-layout">
      <!-- Pestañas laterales -->
      <aside class="settings-tabs" aria-label="Secciones">
        <button 
          class="settings-tab" 
          :class="{ active: currentTab === 'general' }" 
          @click="currentTab = 'general'"
          type="button"
        >
          <i class="fas fa-sliders-h"></i> General
        </button>
        <button 
          class="settings-tab" 
          :class="{ active: currentTab === 'notif' }" 
          @click="currentTab = 'notif'"
          type="button"
        >
          <i class="fas fa-bell"></i> Notificaciones
        </button>
        <button 
          class="settings-tab" 
          :class="{ active: currentTab === 'seguridad' }" 
          @click="currentTab = 'seguridad'"
          type="button"
        >
          <i class="fas fa-shield-alt"></i> Seguridad
        </button>
        <button 
          class="settings-tab" 
          :class="{ active: currentTab === 'catalogos' }" 
          @click="currentTab = 'catalogos'"
          type="button"
        >
          <i class="fas fa-list"></i> Catálogos
        </button>
      </aside>

      <!-- Contenido de las pestañas -->
      <section class="settings-content">
        <!-- Tab General -->
        <article class="settings-card" v-show="currentTab === 'general'">
          <h2>Parámetros generales</h2>
          <div class="settings-grid">
            <label class="form-field">
              <span>Nombre del sistema</span>
              <input type="text" v-model="configData.nombreInstitucion">
            </label>
            <label class="form-field">
              <span>Correo de soporte</span>
              <input type="email" v-model="configData.correoSoporte">
            </label>
            <label class="form-field">
              <span>Periodo académico activo</span>
              <input type="text" v-model="configData.periodoActivo" placeholder="Ej: 2026-1">
            </label>
            <label class="form-field">
              <span>Tiempo de sesión (minutos)</span>
              <select v-model="configData.tiempoSesion">
                <option value="30">30 minutos</option>
                <option value="60">60 minutos</option>
                <option value="120">120 minutos</option>
              </select>
            </label>
          </div>
        </article>

        <!-- Tab Notificaciones -->
        <article class="settings-card" v-show="currentTab === 'notif'">
          <h2>Notificaciones</h2>
          <div class="toggle-list">
            <label class="setting-toggle">
              <div>
                <strong>Alertas de seguimiento vencido</strong>
                <small>Notificar cuando una cita supera la fecha programada.</small>
              </div>
              <input type="checkbox" v-model="configData.notifSeguimientoVencido">
            </label>
            <label class="setting-toggle">
              <div>
                <strong>Resumen semanal</strong>
                <small>Consolidado a administradores cada lunes.</small>
              </div>
              <input type="checkbox" v-model="configData.notifResumenSemanal">
            </label>
            <label class="setting-toggle">
              <div>
                <strong>Nuevos registros</strong>
                <small>Avisar cuando se registre un nuevo estudiante.</small>
              </div>
              <input type="checkbox" v-model="configData.notifNuevosRegistros">
            </label>
          </div>
        </article>

        <!-- Tab Seguridad -->
        <article class="settings-card" v-show="currentTab === 'seguridad'">
          <h2>Seguridad</h2>
          <div class="toggle-list">
            <label class="setting-toggle">
              <div>
                <strong>Requerir correo institucional</strong>
                <small>Solo permitir cuentas @uleam.edu.ec.</small>
              </div>
              <input type="checkbox" v-model="configData.segCorreoInstitucional">
            </label>
            <label class="setting-toggle">
              <div>
                <strong>Bloqueo por intentos fallidos</strong>
                <small>Bloquear temporalmente después de 5 intentos.</small>
              </div>
              <input type="checkbox" v-model="configData.segBloqueoIntentos">
            </label>
            <label class="setting-toggle">
              <div>
                <strong>Registro de actividad</strong>
                <small>Guardar acciones de usuarios administrativos.</small>
              </div>
              <input type="checkbox" v-model="configData.segRegistroActividad">
            </label>
          </div>

          <div class="danger-zone">
            <h3><i class="fas fa-exclamation-triangle" style="margin-right:6px"></i>Zona de riesgo</h3>
            <p>Reinicia todos los datos del sistema a su estado inicial (datos semilla). Esta acción eliminará todos los registros actuales y no se puede deshacer.</p>
            <button type="button" class="secondary-action" @click="confirmarReset = true" style="color:#b42335; border:1px solid #fecdd3; background:#fff1f2">
              <i class="fas fa-redo"></i> Restablecer datos de demostración
            </button>
          </div>
        </article>

        <!-- Tab Catálogos -->
        <article class="settings-card" v-show="currentTab === 'catalogos'">
          <h2>Catálogos editables</h2>
          <p style="color:#64748b; font-size:13px; margin-bottom:20px">
            Los catálogos se usan en los formularios de registro. Agrega o elimina valores según necesites.
          </p>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px">
            <!-- Facultades -->
            <div>
              <h3 style="color:#374151; font-size:14px; margin-bottom:10px">
                <i class="fas fa-university" style="color:var(--uleam-green); margin-right:6px"></i>Facultades
              </h3>
              <div class="tag-list">
                <span v-for="tag in configData.catalogos.facultades" :key="tag" class="tag-item">
                  {{ tag }}
                  <button type="button" class="tag-remove" @click="removerTag('facultades', tag)">&times;</button>
                </span>
              </div>
              <div class="tag-add-row">
                <input type="text" v-model="nuevoTag.facultades" placeholder="Nueva facultad..." @keydown.enter.prevent="agregarTag('facultades')">
                <button class="secondary-action" @click="agregarTag('facultades')" type="button"><i class="fas fa-plus"></i></button>
              </div>
            </div>

            <!-- Carreras -->
            <div>
              <h3 style="color:#374151; font-size:14px; margin-bottom:10px">
                <i class="fas fa-graduation-cap" style="color:var(--uleam-green); margin-right:6px"></i>Carreras
              </h3>
              <div class="tag-list">
                <span v-for="tag in configData.catalogos.carreras" :key="tag" class="tag-item">
                  {{ tag }}
                  <button type="button" class="tag-remove" @click="removerTag('carreras', tag)">&times;</button>
                </span>
              </div>
              <div class="tag-add-row">
                <input type="text" v-model="nuevoTag.carreras" placeholder="Nueva carrera..." @keydown.enter.prevent="agregarTag('carreras')">
                <button class="secondary-action" @click="agregarTag('carreras')" type="button"><i class="fas fa-plus"></i></button>
              </div>
            </div>

            <!-- Tipos Discapacidad -->
            <div>
              <h3 style="color:#374151; font-size:14px; margin-bottom:10px">
                <i class="fas fa-wheelchair" style="color:var(--uleam-green); margin-right:6px"></i>Tipos de discapacidad
              </h3>
              <div class="tag-list">
                <span v-for="tag in configData.catalogos.tiposDiscapacidad" :key="tag" class="tag-item">
                  {{ tag }}
                  <button type="button" class="tag-remove" @click="removerTag('tiposDiscapacidad', tag)">&times;</button>
                </span>
              </div>
              <div class="tag-add-row">
                <input type="text" v-model="nuevoTag.tiposDiscapacidad" placeholder="Nuevo tipo..." @keydown.enter.prevent="agregarTag('tiposDiscapacidad')">
                <button class="secondary-action" @click="agregarTag('tiposDiscapacidad')" type="button"><i class="fas fa-plus"></i></button>
              </div>
            </div>

            <!-- Tipos Apoyo -->
            <div>
              <h3 style="color:#374151; font-size:14px; margin-bottom:10px">
                <i class="fas fa-hands-helping" style="color:var(--uleam-green); margin-right:6px"></i>Tipos de apoyo
              </h3>
              <div class="tag-list">
                <span v-for="tag in configData.catalogos.tiposApoyo" :key="tag" class="tag-item">
                  {{ tag }}
                  <button type="button" class="tag-remove" @click="removerTag('tiposApoyo', tag)">&times;</button>
                </span>
              </div>
              <div class="tag-add-row">
                <input type="text" v-model="nuevoTag.tiposApoyo" placeholder="Nuevo tipo de apoyo..." @keydown.enter.prevent="agregarTag('tiposApoyo')">
                <button class="secondary-action" @click="agregarTag('tiposApoyo')" type="button"><i class="fas fa-plus"></i></button>
              </div>
            </div>
          </div>
        </article>
      </section>
    </section>

    <!-- Modal confirmar reset -->
    <div 
      v-if="confirmarReset" 
      class="modal-overlay visible" 
      @click.self="confirmarReset = false"
    >
      <div class="modal-box" style="max-width:440px">
        <div class="modal-header">
          <h3 style="color:#b42335">&#9888; Confirmar restablecimiento</h3>
          <button class="modal-close" @click="confirmarReset = false" aria-label="Cerrar"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <p style="color:#374151; font-size:14px; line-height:1.6">
            Esta acción eliminará <strong>todos los registros actuales</strong> (estudiantes, seguimientos, apoyos, adaptaciones, usuarios, reportes) y los reemplazará con los datos de demostración iniciales.<br><br>
            <strong style="color:#b42335">Esta operación no se puede deshacer.</strong>
          </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="secondary-action" @click="confirmarReset = false">Cancelar</button>
          <button type="button" @click="restablecerDatos" style="display:inline-flex; align-items:center; gap:8px; min-height:38px; padding:0 16px; border-radius:6px; border:none; background:#b42335; color:#fff; cursor:pointer">
            <i class="fas fa-redo"></i> Sí, restablecer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { obtenerConfig, guardarConfig } from '../../services/storage.js';
import { showToast } from '../../services/toast.js';

const currentTab = ref('general');
const confirmarReset = ref(false);

const configData = ref({
  nombreInstitucion: 'Universidad Laica Eloy Alfaro de Manabí',
  correoSoporte: 'soporte@uleam.edu.ec',
  periodoActivo: '2026-1',
  tiempoSesion: '60',
  notifSeguimientoVencido: true,
  notifResumenSemanal: true,
  notifNuevosRegistros: false,
  segCorreoInstitucional: true,
  segBloqueoIntentos: true,
  segRegistroActividad: true,
  catalogos: {
    facultades: [],
    carreras: [],
    tiposDiscapacidad: [],
    tiposApoyo: []
  }
});

const nuevoTag = ref({
  facultades: '',
  carreras: '',
  tiposDiscapacidad: '',
  tiposApoyo: ''
});

onMounted(() => {
  const cfg = obtenerConfig();
  if (cfg) {
    configData.value = { ...configData.value, ...cfg };
    // Asegurar estructura de catálogos
    if (!configData.value.catalogos) configData.value.catalogos = {};
    if (!configData.value.catalogos.facultades) configData.value.catalogos.facultades = [];
    if (!configData.value.catalogos.carreras) configData.value.catalogos.carreras = [];
    if (!configData.value.catalogos.tiposDiscapacidad) configData.value.catalogos.tiposDiscapacidad = [];
    if (!configData.value.catalogos.tiposApoyo) configData.value.catalogos.tiposApoyo = [];
  }
});

function agregarTag(cat) {
  const val = nuevoTag.value[cat].trim();
  if (!val) return;

  if (configData.value.catalogos[cat].includes(val)) {
    showToast(`"${val}" ya existe en el catálogo.`, 'error');
    return;
  }

  configData.value.catalogos[cat].push(val);
  nuevoTag.value[cat] = '';
  showToast('Item agregado.');
}

function removerTag(cat, val) {
  configData.value.catalogos[cat] = configData.value.catalogos[cat].filter(x => x !== val);
  showToast('Item eliminado.');
}

function guardarConfiguracion() {
  guardarConfig(configData.value);
  showToast('Configuración guardada correctamente.');
}

function restablecerDatos() {
  // Limpiar localStorage completamente y reiniciar para re-semillar
  localStorage.clear();
  confirmarReset.value = false;
  showToast('Datos restablecidos. Recargando la aplicación...', 'info');
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}
</script>
