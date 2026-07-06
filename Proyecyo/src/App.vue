<template>
  <router-view />
  
  <!-- Toast global del sistema -->
  <div 
    v-if="visible" 
    class="toast-notificacion toast-visible" 
    :class="'toast-' + type"
  >
    {{ message }}
  </div>
</template>

<script setup>
import { toastState } from './services/toast.js';

const { visible, message, type } = toastState;
</script>

<style>
/* Estilos globales para notificaciones Toast */
.toast-notificacion {
  position: fixed;
  bottom: 28px;
  right: 28px;
  min-width: 260px;
  max-width: 380px;
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18);
  z-index: 9999;
  transition: opacity 0.3s, transform 0.3s;
}
.toast-success {
  background: #18794e;
  color: #fff;
}
.toast-error {
  background: #b42335;
  color: #fff;
}
.toast-info {
  background: #0756bd;
  color: #fff;
}
</style>
