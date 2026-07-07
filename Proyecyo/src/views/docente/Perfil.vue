<template>
  <div>
    <section class="page-heading">
      <div>
        <h2>Mi perfil</h2>
        <p>Consulta y actualiza tus datos personales y contraseña.</p>
      </div>
    </section>

    <div class="perfil-layout">
      <!-- Tarjeta lateral -->
      <aside>
        <div class="perfil-card">
          <div class="perfil-avatar">{{ avatarInitials }}</div>
          <h3>{{ user.nombres }} {{ user.apellidos }}</h3>
          <p>{{ user.correo }}</p>
          <div class="perfil-badge docente"><i class="fas fa-chalkboard-teacher"></i> Docente</div>
          <div class="perfil-stat">
            <div class="perfil-stat-item">
              <strong>{{ statAsignados }}</strong>
              <span>Estudiantes</span>
            </div>
            <div class="perfil-stat-item">
              <strong>{{ statRegistros }}</strong>
              <span>Seguimientos</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Formularios -->
      <div class="perfil-main">
        <!-- Datos personales -->
        <div class="form-section">
          <div class="form-section-header">
            <i class="fas fa-user"></i>
            <h3>Datos personales</h3>
          </div>
          <div class="form-section-body">
            <form @submit.prevent="guardarDatosPersonales" novalidate>
              <div class="frm-grid">
                <div class="frm-field" :class="{ 'is-invalid': errors.nombres }">
                  <label for="inp-nombres">Nombres</label>
                  <input type="text" id="inp-nombres" v-model="formDatos.nombres" placeholder="Nombres">
                  <span class="frm-error" v-if="errors.nombres">{{ errors.nombres }}</span>
                </div>
                <div class="frm-field" :class="{ 'is-invalid': errors.apellidos }">
                  <label for="inp-apellidos">Apellidos</label>
                  <input type="text" id="inp-apellidos" v-model="formDatos.apellidos" placeholder="Apellidos">
                  <span class="frm-error" v-if="errors.apellidos">{{ errors.apellidos }}</span>
                </div>
                <div class="frm-field full">
                  <label for="inp-correo">Correo institucional</label>
                  <input type="email" id="inp-correo" :value="user.correo" disabled>
                </div>
              </div>
              <div class="form-section-actions">
                <button type="submit" class="primary-action">
                  <i class="fas fa-save"></i> Guardar datos
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Cambiar contraseña -->
        <div class="form-section">
          <div class="form-section-header">
            <i class="fas fa-lock"></i>
            <h3>Cambiar contraseña</h3>
          </div>
          <div class="form-section-body">
            <form @submit.prevent="cambiarContrasena" novalidate>
              <div class="frm-grid">
                <div class="frm-field full" :class="{ 'is-invalid': errors.actual }">
                  <label for="inp-pass-actual">Contraseña actual</label>
                  <div class="pass-wrap">
                    <input :type="showPassActual ? 'text' : 'password'" id="inp-pass-actual" v-model="formPass.actual" placeholder="Tu contraseña actual">
                    <button type="button" class="pass-toggle" @click="showPassActual = !showPassActual" aria-label="Mostrar">
                      <i class="fas" :class="showPassActual ? 'fa-eye-slash' : 'fa-eye'"></i>
                    </button>
                  </div>
                  <span class="frm-error" v-if="errors.actual">{{ errors.actual }}</span>
                </div>
                <div class="frm-field" :class="{ 'is-invalid': errors.nueva }">
                  <label for="inp-pass-nueva">Nueva contraseña</label>
                  <div class="pass-wrap">
                    <input :type="showPassNueva ? 'text' : 'password'" id="inp-pass-nueva" v-model="formPass.nueva" placeholder="Mínimo 6 caracteres">
                    <button type="button" class="pass-toggle" @click="showPassNueva = !showPassNueva" aria-label="Mostrar">
                      <i class="fas" :class="showPassNueva ? 'fa-eye-slash' : 'fa-eye'"></i>
                    </button>
                  </div>
                  <span class="frm-error" v-if="errors.nueva">{{ errors.nueva }}</span>
                </div>
                <div class="frm-field" :class="{ 'is-invalid': errors.confirmar }">
                  <label for="inp-pass-conf">Confirmar contraseña</label>
                  <div class="pass-wrap">
                    <input :type="showPassConf ? 'text' : 'password'" id="inp-pass-conf" v-model="formPass.confirmar" placeholder="Repite la nueva contraseña">
                    <button type="button" class="pass-toggle" @click="showPassConf = !showPassConf" aria-label="Mostrar">
                      <i class="fas" :class="showPassConf ? 'fa-eye-slash' : 'fa-eye'"></i>
                    </button>
                  </div>
                  <span class="frm-error" v-if="errors.confirmar">{{ errors.confirmar }}</span>
                </div>
              </div>
              <div class="form-section-actions">
                <button type="submit" class="primary-action">
                  <i class="fas fa-key"></i> Cambiar contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  obtenerSesion, 
  guardarSesion, 
  obtenerUsuarios, 
  actualizarUsuario, 
  obtenerSeguimientosPorDocente 
} from '../../services/storage.js';
import { obtenerIniciales } from '../../utils/helpers.js';
import { showToast } from '../../services/toast.js';
import { Validaciones } from '../../services/validaciones.js';

const user = ref({ id: '', nombres: '', apellidos: '', correo: '', contrasena: '', rol: '' });
const statAsignados = ref(0);
const statRegistros = ref(0);

const formDatos = ref({ nombres: '', apellidos: '' });
const formPass = ref({ actual: '', nueva: '', confirmar: '' });

const errors = ref({ nombres: '', apellidos: '', actual: '', nueva: '', confirmar: '' });

const showPassActual = ref(false);
const showPassNueva = ref(false);
const showPassConf = ref(false);

onMounted(() => {
  cargarPerfil();
});

function cargarPerfil() {
  const sesion = obtenerSesion();
  if (sesion) {
    const list = obtenerUsuarios();
    const current = list.find(x => x.id === sesion.id);
    if (current) {
      user.value = current;
      formDatos.value.nombres = current.nombres;
      formDatos.value.apellidos = current.apellidos;
      statAsignados.value = (current.estudiantesAsignados || []).length;
      statRegistros.value = obtenerSeguimientosPorDocente(current.id).length;
    }
  }
}

const avatarInitials = computed(() => {
  return obtenerIniciales(user.value.nombres, user.value.apellidos);
});

function cleanErrors() {
  errors.value = { nombres: '', apellidos: '', actual: '', nueva: '', confirmar: '' };
}

function guardarDatosPersonales() {
  cleanErrors();
  let ok = true;
  if (!Validaciones.requerido(formDatos.value.nombres)) {
    errors.value.nombres = 'El nombre es obligatorio.';
    ok = false;
  }
  if (!Validaciones.requerido(formDatos.value.apellidos)) {
    errors.value.apellidos = 'El apellido es obligatorio.';
    ok = false;
  }
  if (!ok) return;

  const res = actualizarUsuario(user.value.id, {
    nombres: formDatos.value.nombres.trim(),
    apellidos: formDatos.value.apellidos.trim()
  });

  if (res.exito) {
    guardarSesion(res.usuario);
    cargarPerfil();
    showToast('Datos personales guardados correctamente.');
    window.location.reload();
  } else {
    showToast(res.mensaje, 'error');
  }
}

function cambiarContrasena() {
  cleanErrors();
  let ok = true;
  if (!formPass.value.actual) {
    errors.value.actual = 'Ingresa tu contraseña actual.';
    ok = false;
  } else if (user.value.contrasena !== formPass.value.actual) {
    errors.value.actual = 'Contraseña actual incorrecta.';
    ok = false;
  }

  if (!formPass.value.nueva) {
    errors.value.nueva = 'Ingresa la nueva contraseña.';
    ok = false;
  } else if (!Validaciones.contrasena(formPass.value.nueva)) {
    errors.value.nueva = 'Mínimo 6 caracteres.';
    ok = false;
  }

  if (formPass.value.nueva !== formPass.value.confirmar) {
    errors.value.confirmar = 'Las contraseñas no coinciden.';
    ok = false;
  }

  if (!ok) return;

  const res = actualizarUsuario(user.value.id, {
    contrasena: formPass.value.nueva
  });

  if (res.exito) {
    formPass.value = { actual: '', nueva: '', confirmar: '' };
    cargarPerfil();
    showToast('Contraseña cambiada correctamente.');
  } else {
    showToast(res.mensaje, 'error');
  }
}
</script>
