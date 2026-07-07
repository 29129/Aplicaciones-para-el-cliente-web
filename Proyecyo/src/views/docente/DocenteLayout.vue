<template>
  <div class="admin-page" @click="cerrarPaneles">
    <aside id="sidebar" class="sidebar">
      <div class="sidebar-header">
        <img src="/assets/img/logo.png" alt="Logo ULEAM" class="logo-sidebar">
        <h2>Sistema ULEAM</h2>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <li><router-link to="/docente/dashboard" active-class="active"><i class="fas fa-home"></i> Inicio</router-link></li>
          <li><router-link to="/docente/estudiantes" active-class="active"><i class="fas fa-users"></i> Mis estudiantes</router-link></li>
          <li><router-link to="/docente/seguimiento" active-class="active"><i class="fas fa-chart-line"></i> Seguimiento</router-link></li>
          <li><router-link to="/docente/historial" active-class="active"><i class="fas fa-history"></i> Historial</router-link></li>
          <li><router-link to="/docente/perfil" active-class="active"><i class="fas fa-user"></i> Mi perfil</router-link></li>
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
                <button class="notif-clear" @click="limpiarNotificaciones" v-if="notificaciones.length">Limpiar todo</button>
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
              <router-link to="/docente/perfil" class="user-dd-item" @click="panelUserAbierto = false">
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
  obtenerSeguimientos,
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
  const sesion = obtenerSesion();
  if (!sesion) return lista;

  const seguimientos = obtenerSeguimientos().filter(s => s.docenteId === sesion.id);
  const enRiesgo = seguimientos.filter(s => s.estadoAcademico === 'En riesgo');
  const idsRiesgo = [...new Set(enRiesgo.map(s => s.estudianteId))];

  if (idsRiesgo.length) {
    lista.push({
      id: 'n-riesgo',
      tipo: 'danger',
      icono: 'fas fa-exclamation-circle',
      titulo: `${idsRiesgo.length} estudiante${idsRiesgo.length > 1 ? 's' : ''} en riesgo académico`,
      mensaje: 'Revisa el módulo de seguimiento.',
      ruta: '/docente/seguimiento'
    });
  }

  const hace48h = Date.now() - 48 * 3600 * 1000;
  const recientes = seguimientos.filter(s => new Date(s.fecha).getTime() > hace48h);
  if (recientes.length) {
    lista.push({
      id: 'n-recientes',
      tipo: 'info',
      icono: 'fas fa-clipboard-list',
      titulo: `${recientes.length} seguimiento${recientes.length > 1 ? 's' : ''} registrado${recientes.length > 1 ? 's' : ''}`,
      mensaje: 'En las últimas 48 horas.',
      ruta: '/docente/seguimiento'
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
