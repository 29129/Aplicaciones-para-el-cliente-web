<template>
  <div>
    <section class="page-heading">
      <div>
        <h2>Mi perfil</h2>
        <p>Gestiona tus datos personales y acceso al sistema.</p>
      </div>
    </section>

    <div class="perfil-layout">
      <!-- Tarjeta lateral -->
      <aside>
        <div class="perfil-card">
          <div class="perfil-avatar">{{ avatarInitials }}</div>
          <h3>{{ user.nombres }} {{ user.apellidos }}</h3>
          <p>{{ user.correo }}</p>
          <div class="perfil-badge admin"><i class="fas fa-shield-alt"></i> Administrador</div>
          <div class="perfil-stat">
            <div class="perfil-stat-item">
              <strong>{{ statEstudiantes }}</strong><span>Estudiantes</span>
            </div>
            <div class="perfil-stat-item">
              <strong>{{ statUsuarios }}</strong><span>Usuarios</span>
            </div>
            <div class="perfil-stat-item">
              <strong>{{ statReportes }}</strong><span>Reportes</span>
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
                  <label for="i-nombres">Nombres</label>
                  <input type="text" id="i-nombres" v-model="formDatos.nombres">
                  <span class="frm-error" v-if="errors.nombres">{{ errors.nombres }}</span>
                </div>
                <div class="frm-field" :class="{ 'is-invalid': errors.apellidos }">
                  <label for="i-apellidos">Apellidos</label>
                  <input type="text" id="i-apellidos" v-model="formDatos.apellidos">
                  <span class="frm-error" v-if="errors.apellidos">{{ errors.apellidos }}</span>
                </div>
                <div class="frm-field full">
                  <label for="i-correo">Correo institucional</label>
                  <input type="email" id="i-correo" :value="user.correo" disabled>
                </div>
                <div class="frm-field full">
                  <label for="i-rol">Rol</label>
                  <input type="text" id="i-rol" value="Administrador" disabled>
                </div>
              </div>
              <div class="form-section-actions">
                <button type="submit" class="primary-action"><i class="fas fa-save"></i> Guardar datos</button>
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
                  <label for="i-actual">Contraseña actual</label>
                  <div class="pass-wrap">
                    <input :type="showPassActual ? 'text' : 'password'" id="i-actual" v-model="formPass.actual" placeholder="Tu contraseña actual">
                    <button type="button" class="pass-toggle" @click="showPassActual = !showPassActual" aria-label="Mostrar">
                      <i class="fas" :class="showPassActual ? 'fa-eye-slash' : 'fa-eye'"></i>
                    </button>
                  </div>
                  <span class="frm-error" v-if="errors.actual">{{ errors.actual }}</span>
                </div>
                <div class="frm-field" :class="{ 'is-invalid': errors.nueva }">
                  <label for="i-nueva">Nueva contraseña</label>
                  <div class="pass-wrap">
                    <input :type="showPassNueva ? 'text' : 'password'" id="i-nueva" v-model="formPass.nueva" placeholder="Mínimo 6 caracteres">
                    <button type="button" class="pass-toggle" @click="showPassNueva = !showPassNueva" aria-label="Mostrar">
                      <i class="fas" :class="showPassNueva ? 'fa-eye-slash' : 'fa-eye'"></i>
                    </button>
                  </div>
                  <span class="frm-error" v-if="errors.nueva">{{ errors.nueva }}</span>
                </div>
                <div class="frm-field" :class="{ 'is-invalid': errors.confirmar }">
                  <label for="i-conf">Confirmar contraseña</label>
                  <div class="pass-wrap">
                    <input :type="showPassConf ? 'text' : 'password'" id="i-conf" v-model="formPass.confirmar" placeholder="Repite la nueva contraseña">
                    <button type="button" class="pass-toggle" @click="showPassConf = !showPassConf" aria-label="Mostrar">
                      <i class="fas" :class="showPassConf ? 'fa-eye-slash' : 'fa-eye'"></i>
                    </button>
                  </div>
                  <span class="frm-error" v-if="errors.confirmar">{{ errors.confirmar }}</span>
                </div>
              </div>
              <div class="form-section-actions">
                <button type="submit" class="primary-action"><i class="fas fa-key"></i> Cambiar contraseña</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Actividad reciente -->
        <div class="form-section">
          <div class="form-section-header">
            <i class="fas fa-history"></i>
            <h3>Actividad reciente del sistema</h3>
          </div>
          <div class="form-section-body">
            <div class="actividad-list">
              <p v-if="actividades.length === 0" class="actividad-empty">Sin actividad reciente.</p>
              <div 
                v-for="(a, idx) in actividades" 
                :key="idx" 
                class="actividad-item"
              >
                <i class="fas" :class="'fa-' + a.ico"></i>
                <div>
                  <span class="actividad-item-text">{{ a.txt }}</span>
                  <span class="actividad-item-date">{{ formatearFecha(a.fecha) }}</span>
                </div>
              </div>
            </div>
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
  obtenerEstudiantes, 
  obtenerReportes, 
  obtenerUltimosEstudiantes 
} from '../../services/storage.js';
import { 
  obtenerIniciales, 
  formatearFecha 
} from '../../utils/helpers.js';
import { showToast } from '../../services/toast.js';
import { Validaciones } from '../../services/validaciones.js';

const user = ref({ id: '', nombres: '', apellidos: '', correo: '', contrasena: '', rol: '' });
const statEstudiantes = ref(0);
const statUsuarios = ref(0);
const statReportes = ref(0);
const actividades = ref([]);

const formDatos = ref({ nombres: '', apellidos: '' });
const formPass = ref({ actual: '', nueva: '', confirmar: '' });

const errors = ref({ nombres: '', apellidos: '', actual: '', nueva: '', confirmar: '' });

const showPassActual = ref(false);
const showPassNueva = ref(false);
const showPassConf = ref(false);

onMounted(() => {
  cargarPerfil();
  cargarActividades();
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
    }
  }
  statEstudiantes.value = obtenerEstudiantes().length;
  statUsuarios.value = obtenerUsuarios().length;
  statReportes.value = obtenerReportes().length;
}

function cargarActividades() {
  const list = [];
  // Mapear últimos estudiantes
  obtenerUltimosEstudiantes(3).forEach(e => {
    list.push({
      ico: 'user-plus',
      txt: `Estudiante registrado: ${e.nombres} ${e.apellidos}`,
      fecha: e.fechaRegistro
    });
  });
  // Mapear reportes
  obtenerReportes().slice(0, 2).forEach(r => {
    list.push({
      ico: 'file-alt',
      txt: `Reporte generado: ${r.nombre}`,
      fecha: r.fecha
    });
  });
  // Ordenar por fecha desc
  list.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  actividades.value = list.slice(0, 5);
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
    // Actualizar sesión activa
    guardarSesion(res.usuario);
    cargarPerfil();
    showToast('Datos personales guardados correctamente.');
    // Actualizar nombre en sidebar/header indirectamente mediante evento o refresco local
    window.location.reload(); // Recarga simple para propagar cambios de sesión
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
