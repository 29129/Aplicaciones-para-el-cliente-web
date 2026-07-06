<template>
  <div class="admin-page">
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
          <button class="notification-btn dashboard-notification" aria-label="Ver notificaciones">
            <i class="fas fa-bell"></i>
            <span class="notification-badge">2</span>
          </button>
          <div class="admin-avatar" aria-hidden="true"><i class="fas fa-user"></i></div>
          <div class="user-info" v-if="usuario">
            <span class="user-name">{{ usuario.nombres }} {{ usuario.apellidos }}</span>
            <span class="user-role">Rol: {{ usuario.rol }}</span>
          </div>
          <button class="topbar-chevron" aria-label="Abrir menú de usuario"><i class="fas fa-chevron-down"></i></button>
        </div>
      </header>
      <main class="dashboard admin-dashboard-view">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { obtenerSesion, cerrarSesion } from '../../services/storage.js';

const router = useRouter();
const usuario = ref(null);

onMounted(() => {
  usuario.value = obtenerSesion();
});

function handleLogout() {
  cerrarSesion();
  router.push('/login');
}
</script>

<style src="../../assets/css/admin.css"></style>
