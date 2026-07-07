<template>
  <div class="admin-page" @click="cerrarPaneles">
    <aside id="sidebar" class="sidebar">
      <div class="sidebar-header">
        <img src="/assets/img/logo.png" alt="Logo ULEAM" class="logo-sidebar">
        <h2>Sistema ULEAM</h2>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <li><router-link to="/bienestar/dashboard" active-class="active"><i class="fas fa-home"></i> Inicio</router-link></li>
          <li><router-link to="/bienestar/estudiantes" active-class="active"><i class="fas fa-users"></i> Estudiantes</router-link></li>
          <li><router-link to="/bienestar/seguimiento" active-class="active"><i class="fas fa-chart-line"></i> Seguimiento</router-link></li>
          <li><router-link to="/bienestar/adaptaciones" active-class="active"><i class="fas fa-tools"></i> Adaptaciones</router-link></li>
          <li><router-link to="/bienestar/reportes" active-class="active"><i class="fas fa-file-alt"></i> Reportes</router-link></li>
          <li><router-link to="/bienestar/perfil" active-class="active"><i class="fas fa-user"></i> Mi perfil</router-link></li>
          <li><a href="#" @click.prevent="handleLogout"><i class="fas fa-sign-out-alt"></i> Cerrar sesión</a></li>
        </ul>
      </nav>
    </aside>

    <div class="main-content">
      <header class="header dashboard-topbar">
        <div class="header-left"></div>
        <div class="header-right">

          <!-- ── Campana de notificaciones ── -->
          <div class="notif-wrapper" @click.stop>
            <button
              class="notification-btn dashboard-notification"
              aria-label="Ver notificaciones"
              @click="toggleNotificaciones"
            >
              <i class="fas fa-bell"></i>
              <span class="notification-badge" v-if="notificaciones.length">{{ notificaciones.length }}</span>
            </button>

            <div class="notif-panel" v-if="panelNotifAbierto">
              <div class="notif-panel-header">
                <span>Notificaciones</span>
                <button class="notif-clear" @click="limpiarNotificaciones" v-if="notificaciones.length">
                  Limpiar todo
                </button>
              </div>
              <ul class="notif-list" v-if="notificaciones.length">
                <li
                  v-for="n in notificaciones"
                  :key="n.id"
                  class="notif-item"
                  :class="'notif-' + n.tipo"
                  @click="irNotificacion(n)"
                >
                  <i :class="n.icono"></i>
                  <div>
                    <strong>{{ n.titulo }}</strong>
                    <span>{{ n.mensaje }}</span>
                  </div>
                </li>
              </ul>
              <p class="notif-empty" v-else>Sin notificaciones pendientes.</p>
            </div>
          </div>

          <!-- ── Avatar + info usuario + menú chevron ── -->
          <div class="user-menu-wrapper" @click.stop>
            <div class="admin-avatar" aria-hidden="true"><i class="fas fa-user"></i></div>
            <div class="user-info" v-if="usuario">
              <span class="user-name">{{ usuario.nombres }} {{ usuario.apellidos }}</span>
              <span class="user-role">Rol: {{ usuario.rol }}</span>
            </div>
            <button
              class="topbar-chevron"
              :class="{ rotated: panelUserAbierto }"
              aria-label="Abrir menú de usuario"
              @click="toggleMenuUsuario"
            >
              <i class="fas fa-chevron-down"></i>
            </button>

            <div class="user-dropdown" v-if="panelUserAbierto">
              <router-link to="/bienestar/perfil" class="user-dd-item" @click="panelUserAbierto = false">
                <i class="fas fa-user-circle"></i> Mi perfil
              </router-link>
              <hr class="user-dd-divider">
              <button class="user-dd-item danger" @click="handleLogout">
                <i class="fas fa-sign-out-alt"></i> Cerrar sesión
              </button>
            </div>
          </div>

        </div>
      </header>
      <main class="dashboard admin-dashboard-view">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  obtenerSesion,
  cerrarSesion,
  obtenerEstudiantes,
  obtenerApoyos,
  obtenerNotificacionesDescartadas,
  descartarNotificacion,
  descartarTodasNotificaciones
} from '../../services/storage.js';

const router = useRouter();
const usuario = ref(null);
const panelNotifAbierto = ref(false);
const panelUserAbierto = ref(false);
const notifDescartadas = ref(obtenerNotificacionesDescartadas());

const notificaciones = computed(() => {
  const lista = [];
  const estudiantes = obtenerEstudiantes();
  const apoyos = obtenerApoyos().filter(a => a.estado === 'Activo');

  const riesgoAlto = estudiantes.filter(e => e.nivelRiesgo === 'Alto');
  if (riesgoAlto.length) {
    lista.push({
      id: 'n-riesgo',
      tipo: 'danger',
      icono: 'fas fa-exclamation-circle',
      titulo: `${riesgoAlto.length} estudiante${riesgoAlto.length > 1 ? 's' : ''} con riesgo alto`,
      mensaje: 'Requieren atención prioritaria.',
      ruta: '/bienestar/estudiantes'
    });
  }

  const enSeg = estudiantes.filter(e => e.estado === 'En seguimiento');
  if (enSeg.length) {
    lista.push({
      id: 'n-seg',
      tipo: 'warning',
      icono: 'fas fa-exclamation-triangle',
      titulo: `${enSeg.length} estudiante${enSeg.length > 1 ? 's' : ''} en seguimiento activo`,
      mensaje: 'Revisar avances del período.',
      ruta: '/bienestar/seguimiento'
    });
  }

  if (apoyos.length) {
    lista.push({
      id: 'n-apoyos',
      tipo: 'info',
      icono: 'fas fa-hands-helping',
      titulo: `${apoyos.length} apoyo${apoyos.length > 1 ? 's' : ''} activo${apoyos.length > 1 ? 's' : ''}`,
      mensaje: 'Apoyos en curso registrados.',
      ruta: '/bienestar/seguimiento'
    });
  }

  return lista.filter(n => !notifDescartadas.value.includes(n.id));
});

onMounted(() => {
  usuario.value = obtenerSesion();
});

function toggleNotificaciones() {
  panelNotifAbierto.value = !panelNotifAbierto.value;
  panelUserAbierto.value = false;
}

function toggleMenuUsuario() {
  panelUserAbierto.value = !panelUserAbierto.value;
  panelNotifAbierto.value = false;
}

function cerrarPaneles() {
  panelNotifAbierto.value = false;
  panelUserAbierto.value = false;
}

function limpiarNotificaciones() {
  descartarTodasNotificaciones(notificaciones.value.map(n => n.id));
  notifDescartadas.value = obtenerNotificacionesDescartadas();
  panelNotifAbierto.value = false;
}

function irNotificacion(n) {
  descartarNotificacion(n.id);
  notifDescartadas.value = obtenerNotificacionesDescartadas();
  panelNotifAbierto.value = false;
  if (n.ruta) router.push(n.ruta);
}

function handleLogout() {
  cerrarSesion();
  router.push('/login');
}
</script>

<style src="../../assets/css/admin.css"></style>
