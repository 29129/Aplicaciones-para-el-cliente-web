<template>
  <div class="login-page">
    <section id="left">
      <div class="imagen"></div>
      <div class="logo"></div>
      <div class="contenedor1">
        <h1>Sistema de registro y</h1>
        <h1>seguimientos de personas con</h1>
        <h1>capacidades especiales</h1>
      </div>
      <div class="separador"></div>
      <div class="contenedor2">
        <p>Plataforma institucional para el registro, seguimiento</p>
        <p>y gestión integral de personas con capacidades</p>
        <p>especiales en la ULEAM</p>
      </div>
      <div class="imagen1"></div>
    </section>

    <section id="right">
      <h1 class="icono">👤</h1>
      <h1>Iniciar sesión</h1>
      <p>Ingrese sus credenciales</p>
      <div class="credenciales">
        <!-- Alerta global de error de autenticación -->
        <div v-if="globalError" class="alerta-login" role="alert">
          {{ globalError }}
        </div>

        <form @submit.prevent="handleLogin" novalidate>
          <div class="form-group">
            <label for="correo">📧 Correo Institucional</label>
            <input
              type="email"
              id="correo"
              v-model="correo"
              @blur="validateEmail"
              @input="clearErrors"
              :class="{ 'input-error': errors.correo }"
              required
              placeholder="usuario@uleam.edu.ec"
              autocomplete="username"
            />
            <span v-if="errors.correo" class="error-msg" role="alert">{{ errors.correo }}</span>
          </div>

          <div class="form-group">
            <label for="contrasena">🔐 Contraseña</label>
            <div class="password-wrapper">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="contrasena"
                v-model="contrasena"
                @blur="validatePassword"
                @input="clearErrors"
                :class="{ 'input-error': errors.contrasena }"
                required
                placeholder="Ingrese su contraseña"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                <span>{{ showPassword ? '🙈' : '👁️' }}</span>
              </button>
            </div>
            <span v-if="errors.contrasena" class="error-msg" role="alert">{{ errors.contrasena }}</span>
          </div>

          <div class="remember-container">
            <input type="checkbox" id="remember" v-model="rememberMe" />
            <label for="remember">Recuérdame</label>
          </div>

          <button class="login-button" type="submit" :disabled="loading">
            {{ loading ? 'Verificando...' : '🔓 Iniciar Sesión' }}
          </button>
        </form>
      </div>

      <div class="advertencia">
        <p><strong>⚠️ Acceso restringido</strong></p>
        <p>Sistema de uso exclusivo para personal autorizado de la ULEAM</p>
      </div>

      <details class="demo-credentials">
        <summary>Credenciales de demostración</summary>
        <p><strong>Admin:</strong> admin@uleam.edu.ec / admin123</p>
        <p><strong>Docente:</strong> docente@uleam.edu.ec / docente123</p>
        <p><strong>Bienestar:</strong> bienestar@uleam.edu.ec / bienestar123</p>
      </details>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { autenticarUsuario, guardarSesion, ROLES } from '../services/storage.js';
import { validarLogin } from '../services/validaciones.js';

const router = useRouter();

const correo = ref('');
const contrasena = ref('');
const rememberMe = ref(false);
const showPassword = ref(false);
const loading = ref(false);
const globalError = ref('');

const errors = ref({
  correo: '',
  contrasena: ''
});

const CLAVE_RECORDAR = 'uleam_recordar_correo';

onMounted(() => {
  // Cargar correo recordado si existe
  const correoGuardado = localStorage.getItem(CLAVE_RECORDAR);
  if (correoGuardado) {
    correo.value = correoGuardado;
    rememberMe.value = true;
  }
});

function validateEmail() {
  const result = validarLogin(correo.value, contrasena.value || '******');
  errors.value.correo = result.errores.correo || '';
}

function validatePassword() {
  const result = validarLogin(correo.value || 'x@uleam.edu.ec', contrasena.value);
  errors.value.contrasena = result.errores.contrasena || '';
}

function clearErrors() {
  errors.value.correo = '';
  errors.value.contrasena = '';
  globalError.value = '';
}

function handleLogin() {
  clearErrors();
  const validation = validarLogin(correo.value, contrasena.value);

  if (!validation.valido) {
    errors.value.correo = validation.errores.correo || '';
    errors.value.contrasena = validation.errores.contrasena || '';
    return;
  }

  loading.value = true;

  setTimeout(() => {
    const resultado = autenticarUsuario(correo.value, contrasena.value);
    loading.value = false;

    if (!resultado.exito) {
      globalError.value = resultado.mensaje;
      return;
    }

    // Guardar correo si "Recuérdame" está activo
    if (rememberMe.value) {
      localStorage.setItem(CLAVE_RECORDAR, correo.value.trim());
    } else {
      localStorage.removeItem(CLAVE_RECORDAR);
    }

    // Iniciar sesión y redirigir
    guardarSesion(resultado.usuario);

    const rol = resultado.usuario.rol;
    if (rol === ROLES.ADMIN) {
      router.push('/admin/dashboard');
    } else if (rol === ROLES.DOCENTE) {
      router.push('/docente/dashboard');
    } else if (rol === ROLES.BIENESTAR) {
      router.push('/bienestar/dashboard');
    }
  }, 800); // Pequeña demora para simular la verificación
}
</script>

<style src="../assets/css/inicio.css" scoped></style>
