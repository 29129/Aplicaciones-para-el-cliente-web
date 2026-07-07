<template>
  <section class="dashboard-panel">
    <header class="page-heading">
      <div>
        <h2>{{ isEdit ? 'Editar estudiante' : 'Registro de estudiante' }}</h2>
        <p>Complete todos los pasos del formulario.</p>
      </div>
      <div class="register-actions">
        <button class="secondary-action" type="button" @click="cancelar">Cancelar</button>
      </div>
    </header>

    <section class="form-shell">
      <!-- Indicadores de paso -->
      <nav class="form-steps">
        <button
          v-for="(item, index) in pasos"
          :key="item"
          class="step-tab"
          :class="{
            active: paso === index,
            completed: paso > index,
            locked: !puedeIrAPaso(index)
          }"
          :disabled="!puedeIrAPaso(index)"
          @click="irAPaso(index)"
          type="button"
        >
          <span class="step-num">{{ index + 1 }}</span>
          {{ item }}
        </button>
      </nav>

      <!-- Paso 0: Datos personales -->
      <article v-show="paso === 0" class="form-card">
        <h2><i class="fas fa-user"></i> Datos personales</h2>
        <div class="form-grid four-columns">
          <label class="form-field" :class="{ 'is-invalid': errores.nombres }"><span>Nombres *</span><input v-model="form.nombres" type="text" placeholder="Ej: María José"><small class="form-error" v-if="errores.nombres">{{ errores.nombres }}</small></label>
          <label class="form-field" :class="{ 'is-invalid': errores.apellidos }"><span>Apellidos *</span><input v-model="form.apellidos" type="text" placeholder="Ej: González López"><small class="form-error" v-if="errores.apellidos">{{ errores.apellidos }}</small></label>
          <label class="form-field" :class="{ 'is-invalid': errores.cedula }"><span>Cédula *</span><input v-model="form.cedula" type="text" placeholder="1312345678" maxlength="10" inputmode="numeric"><small class="form-error" v-if="errores.cedula">{{ errores.cedula }}</small></label>
          <label class="form-field"><span>Fecha de nacimiento</span><input v-model="form.fechaNacimiento" type="date"></label>
          <label class="form-field"><span>Género</span>
            <select v-model="form.genero">
              <option value="">Seleccione</option>
              <option>Femenino</option>
              <option>Masculino</option>
              <option>Otro</option>
            </select>
          </label>
          <label class="form-field" :class="{ 'is-invalid': errores.telefono }"><span>Teléfono *</span><input v-model="form.telefono" type="text" placeholder="09XXXXXXXX" maxlength="10"><small class="form-error" v-if="errores.telefono">{{ errores.telefono }}</small></label>
          <label class="form-field" :class="{ 'is-invalid': errores.correoInstitucional }"><span>Correo institucional *</span><input v-model="form.correoInstitucional" type="email" placeholder="usuario@uleam.edu.ec"><small class="form-error" v-if="errores.correoInstitucional">{{ errores.correoInstitucional }}</small></label>
          <label class="form-field"><span>Dirección</span><input v-model="form.direccion" type="text" placeholder="Ciudad, provincia"></label>
        </div>
      </article>

      <!-- Paso 1: Datos académicos -->
      <article v-show="paso === 1" class="form-card">
        <h2><i class="fas fa-graduation-cap"></i> Datos académicos</h2>
        <div class="form-grid four-columns">
          <label class="form-field" :class="{ 'is-invalid': errores.facultad }"><span>Facultad *</span>
            <select v-model="form.facultad">
              <option value="">Seleccione</option>
              <option v-for="item in config.catalogos.facultades" :key="item">{{ item }}</option>
            </select>
            <small class="form-error" v-if="errores.facultad">{{ errores.facultad }}</small>
          </label>
          <label class="form-field" :class="{ 'is-invalid': errores.carrera }"><span>Carrera *</span>
            <select v-model="form.carrera">
              <option value="">Seleccione</option>
              <option v-for="item in config.catalogos.carreras" :key="item">{{ item }}</option>
            </select>
            <small class="form-error" v-if="errores.carrera">{{ errores.carrera }}</small>
          </label>
          <label class="form-field" :class="{ 'is-invalid': errores.semestre }"><span>Semestre / Nivel *</span><input v-model="form.semestre" type="text" placeholder="Ej: Tercero"><small class="form-error" v-if="errores.semestre">{{ errores.semestre }}</small></label>
          <label class="form-field"><span>Paralelo</span><input v-model="form.paralelo" type="text" placeholder="Ej: A"></label>
          <label class="form-field"><span>Jornada</span>
            <select v-model="form.jornada">
              <option>Matutina</option>
              <option>Vespertina</option>
              <option>Nocturna</option>
            </select>
          </label>
          <label class="form-field"><span>Estado académico</span>
            <select v-model="form.estadoAcademico">
              <option>Activo</option>
              <option>Retirado</option>
              <option>Egresado</option>
            </select>
          </label>
          <label class="form-field"><span>Período</span><input v-model="form.periodo" type="text" placeholder="Ej: 2026-1"></label>
        </div>
      </article>

      <!-- Paso 2: Discapacidad y apoyo -->
      <article v-show="paso === 2" class="form-card">
        <h2><i class="fas fa-wheelchair"></i> Discapacidad y apoyo</h2>
        <div class="form-grid four-columns">
          <label class="form-field" :class="{ 'is-invalid': errores.tipoDiscapacidad }"><span>Tipo de discapacidad *</span>
            <select v-model="form.tipoDiscapacidad">
              <option value="">Seleccione</option>
              <option v-for="item in config.catalogos.tiposDiscapacidad" :key="item">{{ item }}</option>
            </select>
            <small class="form-error" v-if="errores.tipoDiscapacidad">{{ errores.tipoDiscapacidad }}</small>
          </label>
          <label class="form-field"><span>Grado (%)</span><input v-model="form.gradoDiscapacidad" type="number" min="0" max="100"></label>
          <label class="form-field"><span>Certificado (CONADIS/MSP)</span>
            <select v-model="form.certificado">
              <option>Sí</option>
              <option>No</option>
            </select>
          </label>
          <label class="form-field"><span>Institución certificadora</span><input v-model="form.institucionCertificadora" type="text" placeholder="Ej: CONADIS, MSP"></label>
          <label class="form-field"><span>Tipo de apoyo</span>
            <select v-model="form.tipoApoyo">
              <option value="">Seleccione</option>
              <option v-for="item in config.catalogos.tiposApoyo" :key="item">{{ item }}</option>
            </select>
          </label>
          <label class="form-field"><span>Nivel de riesgo</span>
            <select v-model="form.nivelRiesgo">
              <option>Bajo</option>
              <option>Medio</option>
              <option>Alto</option>
            </select>
          </label>
          <label class="form-field" style="grid-column:1/-1"><span>Diagnóstico médico</span><input v-model="form.diagnostico" type="text" placeholder="Descripción del diagnóstico"></label>
        </div>
      </article>

      <!-- Paso 3: Tutor legal -->
      <article v-show="paso === 3" class="form-card">
        <h2><i class="fas fa-user-shield"></i> Datos del tutor legal</h2>
        <p style="color:#64748b; font-size:13px; margin-bottom:16px;">
          Complete esta sección si el estudiante tiene tutor legal o representante asignado.
        </p>
        <div class="form-grid four-columns">
          <label class="form-field"><span>Nombres del tutor</span><input v-model="form.tutorNombres" type="text" placeholder="Ej: Juan Carlos"></label>
          <label class="form-field"><span>Apellidos del tutor</span><input v-model="form.tutorApellidos" type="text" placeholder="Ej: Mendoza Vera"></label>
          <label class="form-field"><span>Cédula del tutor</span><input v-model="form.tutorCedula" type="text" placeholder="1312345678" maxlength="10"></label>
          <label class="form-field"><span>Parentesco</span>
            <select v-model="form.tutorParentesco">
              <option value="">Seleccione</option>
              <option>Padre</option>
              <option>Madre</option>
              <option>Hermano/a</option>
              <option>Cónyuge</option>
              <option>Tutor legal</option>
              <option>Otro</option>
            </select>
          </label>
          <label class="form-field"><span>Teléfono del tutor</span><input v-model="form.tutorTelefono" type="text" placeholder="09XXXXXXXX"></label>
          <label class="form-field"><span>Correo del tutor</span><input v-model="form.tutorCorreo" type="email" placeholder="correo@ejemplo.com"></label>
          <label class="form-field"><span>Dirección del tutor</span><input v-model="form.tutorDireccion" type="text" placeholder="Ciudad, provincia"></label>
          <label class="form-field"><span>Trabaja</span>
            <select v-model="form.tutorTrabaja">
              <option value="">Seleccione</option>
              <option>Sí</option>
              <option>No</option>
            </select>
          </label>
          <label class="form-field" style="grid-column:1/-1"><span>Observaciones del tutor</span>
            <textarea v-model="form.tutorObservaciones" rows="3" placeholder="Información relevante sobre el tutor o la relación con el estudiante..."></textarea>
          </label>
        </div>
      </article>

      <!-- Paso 4: Observaciones generales -->
      <article v-show="paso === 4" class="form-card">
        <h2><i class="fas fa-clipboard"></i> Observaciones generales</h2>
        <label class="form-field">
          <span>Observaciones del registro</span>
          <textarea v-model="form.observaciones" rows="6" placeholder="Añada cualquier observación relevante sobre el estudiante..."></textarea>
        </label>
      </article>

      <!-- Navegación entre pasos -->
      <div class="step-nav">
        <button
          class="secondary-action"
          type="button"
          @click="retrocederPaso"
          :disabled="paso === 0"
        >
          <i class="fas fa-arrow-left"></i> Anterior
        </button>
        <span class="step-indicator">Paso {{ paso + 1 }} de {{ pasos.length }}</span>
        <button
          class="primary-action"
          type="button"
          @click="siguientePaso"
          v-if="paso < pasos.length - 1"
        >
          Siguiente <i class="fas fa-arrow-right"></i>
        </button>
        <button
          class="primary-action"
          type="button"
          @click="guardar"
          v-else
        >
          <i class="fas fa-save"></i> {{ isEdit ? 'Actualizar' : 'Guardar' }}
        </button>
      </div>
    </section>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  actualizarEstudiante,
  crearEstudiante,
  obtenerConfig,
  obtenerEstudiantePorId
} from '../../services/storage.js';
import { showToast } from '../../services/toast.js';
import { Validaciones } from '../../services/validaciones.js';

const router = useRouter();
const route = useRoute();
const paso = ref(0);
const ultimoPasoValidado = ref(0);
const isEdit = ref(false);
const editingId = ref(null);
const errores = ref({});

const config = ref({
  catalogos: { facultades: [], carreras: [], tiposDiscapacidad: [], tiposApoyo: [] },
  periodoActivo: '2026-1'
});

const pasos = ['Personales', 'Académicos', 'Discapacidad', 'Tutor legal', 'Observaciones'];

const form = ref({
  // Datos personales
  nombres: '', apellidos: '', cedula: '', fechaNacimiento: '', genero: '',
  telefono: '', correoInstitucional: '', direccion: '',
  // Datos académicos
  facultad: '', carrera: '', semestre: '', paralelo: '', jornada: 'Matutina',
  estadoAcademico: 'Activo', periodo: '2026-1',
  // Discapacidad
  tipoDiscapacidad: '', gradoDiscapacidad: 0, certificado: 'Sí',
  institucionCertificadora: '', tipoApoyo: '', diagnostico: '',
  estado: 'Activo', nivelRiesgo: 'Bajo',
  // Tutor legal
  tutorNombres: '', tutorApellidos: '', tutorCedula: '', tutorParentesco: '',
  tutorTelefono: '', tutorCorreo: '', tutorDireccion: '', tutorTrabaja: '',
  tutorObservaciones: '',
  // Observaciones
  observaciones: ''
});

onMounted(() => {
  config.value = obtenerConfig();
  form.value.periodo = config.value.periodoActivo || form.value.periodo;

  const id = route.query.id;
  if (id) {
    const est = obtenerEstudiantePorId(id);
    if (est) {
      isEdit.value = true;
      editingId.value = id;
      form.value = { ...form.value, ...est };
      ultimoPasoValidado.value = pasos.length - 1;
    }
  }
});

function limpiarErrores() {
  errores.value = {};
}

function puedeIrAPaso(index) {
  if (isEdit.value) return true;
  return index <= ultimoPasoValidado.value;
}

function irAPaso(index) {
  if (index === paso.value) return;
  if (!puedeIrAPaso(index)) {
    showToast('Complete los pasos anteriores antes de avanzar.', 'error');
    return;
  }
  limpiarErrores();
  paso.value = index;
}

function retrocederPaso() {
  if (paso.value > 0) {
    limpiarErrores();
    paso.value--;
  }
}

function siguientePaso() {
  if (!validarPaso(paso.value)) return;
  limpiarErrores();
  if (paso.value < pasos.length - 1) {
    paso.value++;
    ultimoPasoValidado.value = Math.max(ultimoPasoValidado.value, paso.value);
  }
}

/** Validaciones por paso del formulario */
function validarPaso(indice) {
  limpiarErrores();
  let valido = true;

  if (indice === 0) {
    if (!Validaciones.requerido(form.value.nombres)) {
      errores.value.nombres = 'El nombre es obligatorio.';
      valido = false;
    }
    if (!Validaciones.requerido(form.value.apellidos)) {
      errores.value.apellidos = 'Los apellidos son obligatorios.';
      valido = false;
    }
    const cedula = String(form.value.cedula).trim();
    if (!Validaciones.cedula(cedula)) {
      errores.value.cedula = 'La cédula debe tener exactamente 10 dígitos.';
      valido = false;
    }
    const telefono = String(form.value.telefono).trim();
    if (!Validaciones.requerido(telefono)) {
      errores.value.telefono = 'El teléfono es obligatorio.';
      valido = false;
    } else if (!Validaciones.telefono(telefono)) {
      errores.value.telefono = 'Ingrese un teléfono válido (10 dígitos, inicia con 0).';
      valido = false;
    }
    const correo = String(form.value.correoInstitucional).trim();
    if (!Validaciones.requerido(correo)) {
      errores.value.correoInstitucional = 'El correo institucional es obligatorio.';
      valido = false;
    } else if (!Validaciones.correo(correo)) {
      errores.value.correoInstitucional = 'Ingrese un correo electrónico válido.';
      valido = false;
    }
  }

  if (indice === 1) {
    if (!Validaciones.requerido(form.value.facultad)) {
      errores.value.facultad = 'Seleccione una facultad.';
      valido = false;
    }
    if (!Validaciones.requerido(form.value.carrera)) {
      errores.value.carrera = 'Seleccione una carrera.';
      valido = false;
    }
    if (!Validaciones.requerido(form.value.semestre)) {
      errores.value.semestre = 'Indique el semestre o nivel.';
      valido = false;
    }
  }

  if (indice === 2) {
    if (!Validaciones.requerido(form.value.tipoDiscapacidad)) {
      errores.value.tipoDiscapacidad = 'Seleccione el tipo de discapacidad.';
      valido = false;
    }
  }

  if (indice === 3) {
    const hayDatosTutor = [
      form.value.tutorNombres,
      form.value.tutorApellidos,
      form.value.tutorCedula,
      form.value.tutorTelefono,
      form.value.tutorCorreo
    ].some(v => Validaciones.requerido(v));

    if (hayDatosTutor) {
      if (!Validaciones.requerido(form.value.tutorNombres)) {
        errores.value.tutorNombres = 'Ingrese los nombres del tutor.';
        valido = false;
      }
      if (!Validaciones.requerido(form.value.tutorApellidos)) {
        errores.value.tutorApellidos = 'Ingrese los apellidos del tutor.';
        valido = false;
      }
      const cedulaTutor = String(form.value.tutorCedula).trim();
      if (cedulaTutor && !Validaciones.cedula(cedulaTutor)) {
        errores.value.tutorCedula = 'La cédula del tutor debe tener 10 dígitos.';
        valido = false;
      }
    }
  }

  if (!valido) {
    showToast('Complete los campos obligatorios antes de continuar.', 'error');
  }

  return valido;
}

function validarFormularioCompleto() {
  const pasosObligatorios = [0, 1, 2, 3];
  for (const indice of pasosObligatorios) {
    if (!validarPaso(indice)) {
      paso.value = indice;
      ultimoPasoValidado.value = Math.min(ultimoPasoValidado.value, indice);
      return false;
    }
  }
  return true;
}

function guardar() {
  if (!validarFormularioCompleto()) return;

  const payload = {
    ...form.value,
    cedula: String(form.value.cedula).trim(),
    telefono: String(form.value.telefono).trim(),
    correoInstitucional: String(form.value.correoInstitucional).trim(),
    tutorCedula: String(form.value.tutorCedula || '').trim(),
    estado: form.value.estadoAcademico === 'Retirado' ? 'Inactivo' : 'Activo'
  };

  const res = isEdit.value
    ? actualizarEstudiante(editingId.value, payload)
    : crearEstudiante(payload);

  if (res.exito) {
    showToast(res.mensaje);
    router.push('/admin/estudiantes');
  } else {
    showToast(res.mensaje, 'error');
  }
}

function cancelar() {
  router.push('/admin/estudiantes');
}
</script>

<style scoped>
.step-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0 8px;
  gap: 12px;
}

.step-indicator {
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
}

.step-tab {
  display: flex;
  align-items: center;
  gap: 6px;
}

.step-tab .step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  font-size: 12px;
  font-weight: 700;
}

.step-tab.completed .step-num {
  background: rgba(255,255,255,0.5);
}

.step-tab.locked {
  opacity: 0.45;
  cursor: not-allowed;
}

.step-tab:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
