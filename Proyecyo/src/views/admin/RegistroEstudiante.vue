<template>
  <section class="dashboard-panel">
    <header class="page-heading">
      <div>
        <h2>{{ isEdit ? 'Editar estudiante' : 'Registro de estudiante' }}</h2>
        <p>Formulario multistep con catálogos de configuración.</p>
      </div>
      <div class="register-actions">
        <button class="secondary-action" type="button" @click="cancelar">Cancelar</button>
        <button class="primary-action" type="button" @click="guardar">{{ isEdit ? 'Actualizar' : 'Guardar' }}</button>
      </div>
    </header>

    <section class="form-shell">
      <nav class="form-steps">
        <button v-for="(item, index) in pasos" :key="item" class="step-tab" :class="{ active: paso===index }" @click="paso=index" type="button">{{ index + 1 }}. {{ item }}</button>
      </nav>

      <article v-show="paso===0" class="form-card"><h2>Datos personales</h2><div class="form-grid four-columns">
        <label class="form-field"><span>Nombres</span><input v-model="form.nombres" type="text"></label>
        <label class="form-field"><span>Apellidos</span><input v-model="form.apellidos" type="text"></label>
        <label class="form-field"><span>Cédula</span><input v-model="form.cedula" type="text"></label>
        <label class="form-field"><span>Fecha nacimiento</span><input v-model="form.fechaNacimiento" type="date"></label>
        <label class="form-field"><span>Género</span><select v-model="form.genero"><option value="">Seleccione</option><option>Femenino</option><option>Masculino</option><option>Otro</option></select></label>
        <label class="form-field"><span>Teléfono</span><input v-model="form.telefono" type="text"></label>
        <label class="form-field"><span>Correo institucional</span><input v-model="form.correoInstitucional" type="email"></label>
        <label class="form-field"><span>Dirección</span><input v-model="form.direccion" type="text"></label>
      </div></article>

      <article v-show="paso===1" class="form-card"><h2>Datos académicos</h2><div class="form-grid four-columns">
        <label class="form-field"><span>Facultad</span><select v-model="form.facultad"><option value="">Seleccione</option><option v-for="item in config.catalogos.facultades" :key="item">{{ item }}</option></select></label>
        <label class="form-field"><span>Carrera</span><select v-model="form.carrera"><option value="">Seleccione</option><option v-for="item in config.catalogos.carreras" :key="item">{{ item }}</option></select></label>
        <label class="form-field"><span>Semestre</span><input v-model="form.semestre" type="text"></label>
        <label class="form-field"><span>Jornada</span><select v-model="form.jornada"><option>Matutina</option><option>Vespertina</option><option>Nocturna</option></select></label>
        <label class="form-field"><span>Estado académico</span><select v-model="form.estadoAcademico"><option>Activo</option><option>Retirado</option><option>Egresado</option></select></label>
        <label class="form-field"><span>Periodo</span><input v-model="form.periodo" type="text"></label>
      </div></article>

      <article v-show="paso===2" class="form-card"><h2>Discapacidad y apoyo</h2><div class="form-grid four-columns">
        <label class="form-field"><span>Tipo discapacidad</span><select v-model="form.tipoDiscapacidad"><option value="">Seleccione</option><option v-for="item in config.catalogos.tiposDiscapacidad" :key="item">{{ item }}</option></select></label>
        <label class="form-field"><span>Grado (%)</span><input v-model="form.gradoDiscapacidad" type="number" min="0" max="100"></label>
        <label class="form-field"><span>Certificado</span><select v-model="form.certificado"><option>Sí</option><option>No</option></select></label>
        <label class="form-field"><span>Tipo de apoyo</span><select v-model="form.tipoApoyo"><option value="">Seleccione</option><option v-for="item in config.catalogos.tiposApoyo" :key="item">{{ item }}</option></select></label>
        <label class="form-field" style="grid-column:1/-1"><span>Diagnóstico</span><input v-model="form.diagnostico" type="text"></label>
      </div></article>

      <article v-show="paso===3" class="form-card"><h2>Observaciones</h2><label class="form-field"><span>Observaciones</span><textarea v-model="form.observaciones" rows="5"></textarea></label></article>
    </section>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { actualizarEstudiante, crearEstudiante, guardarConfig, guardarEstudiantes, obtenerConfig, obtenerEstudiantePorId } from '../../services/storage.js';
import { showToast } from '../../services/toast.js';

const router = useRouter();
const route = useRoute();
const paso = ref(0);
const isEdit = ref(false);
const editingId = ref(null);
const config = ref({ catalogos: { facultades: [], carreras: [], tiposDiscapacidad: [], tiposApoyo: [] }, periodoActivo: '2026-1' });
const pasos = ['Personales', 'Académicos', 'Discapacidad', 'Observaciones'];
const form = ref({ nombres:'', apellidos:'', cedula:'', fechaNacimiento:'', genero:'', telefono:'', correoInstitucional:'', direccion:'', facultad:'', carrera:'', semestre:'', jornada:'', estadoAcademico:'Activo', periodo:'2026-1', tipoDiscapacidad:'', gradoDiscapacidad:0, certificado:'Sí', tipoApoyo:'', diagnostico:'', observaciones:'', estado:'Activo', nivelRiesgo:'Bajo' });

onMounted(() => {
  config.value = obtenerConfig();
  form.value.periodo = config.value.periodoActivo || form.value.periodo;
  const id = route.query.id;
  if (id) { const est = obtenerEstudiantePorId(id); if (est) { isEdit.value = true; editingId.value = id; form.value = { ...form.value, ...est }; } }
});

function guardar() {
  const payload = { ...form.value, estado: form.value.estadoAcademico === 'Retirado' ? 'Inactivo' : 'Activo' };
  const res = isEdit.value ? actualizarEstudiante(editingId.value, payload) : crearEstudiante(payload);
  if (res.exito) { showToast(res.mensaje); router.push('/admin/estudiantes'); } else { showToast(res.mensaje, 'error'); }
}
function cancelar() { router.push('/admin/estudiantes'); }
</script>
