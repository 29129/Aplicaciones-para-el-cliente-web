import { createRouter, createWebHistory } from 'vue-router';
import { obtenerSesion, ROLES } from '../services/storage.js';

import Login from '../views/Login.vue';

// Layouts
import AdminLayout from '../views/admin/AdminLayout.vue';
import DocenteLayout from '../views/docente/DocenteLayout.vue';
import BienestarLayout from '../views/bienestar/BienestarLayout.vue';

// Vistas admin
import AdminDashboard from '../views/admin/Dashboard.vue';
import AdminEstudiantes from '../views/admin/Estudiantes.vue';
import AdminRegistroEstudiante from '../views/admin/RegistroEstudiante.vue';
import AdminSeguimiento from '../views/admin/Seguimiento.vue';
import AdminReportes from '../views/admin/Reportes.vue';
import AdminUsuarios from '../views/admin/Usuarios.vue';
import AdminConfiguracion from '../views/admin/Configuracion.vue';
import AdminPerfil from '../views/admin/Perfil.vue';

// Vistas docente
import DocenteDashboard from '../views/docente/Dashboard.vue';
import DocenteEstudiantes from '../views/docente/Estudiantes.vue';
import DocenteSeguimiento from '../views/docente/Seguimiento.vue';
import DocenteHistorial from '../views/docente/Historial.vue';
import DocentePerfil from '../views/docente/Perfil.vue';

// Vistas bienestar
import BienestarDashboard from '../views/bienestar/Dashboard.vue';
import BienestarEstudiantes from '../views/bienestar/Estudiantes.vue';
import BienestarSeguimiento from '../views/bienestar/Seguimiento.vue';
import BienestarAdaptaciones from '../views/bienestar/Adaptaciones.vue';
import BienestarReportes from '../views/bienestar/Reportes.vue';
import BienestarPerfil from '../views/bienestar/Perfil.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'AdminDashboard', component: AdminDashboard },
      { path: 'estudiantes', name: 'AdminEstudiantes', component: AdminEstudiantes },
      { path: 'registro-estudiante', name: 'AdminRegistroEstudiante', component: AdminRegistroEstudiante },
      { path: 'seguimiento', name: 'AdminSeguimiento', component: AdminSeguimiento },
      { path: 'reportes', name: 'AdminReportes', component: AdminReportes },
      { path: 'usuarios', name: 'AdminUsuarios', component: AdminUsuarios },
      { path: 'configuracion', name: 'AdminConfiguracion', component: AdminConfiguracion },
      { path: 'perfil', name: 'AdminPerfil', component: AdminPerfil }
    ]
  },
  {
    path: '/docente',
    component: DocenteLayout,
    meta: { requiresAuth: true, roles: [ROLES.DOCENTE] },
    children: [
      { path: '', redirect: '/docente/dashboard' },
      { path: 'dashboard', name: 'DocenteDashboard', component: DocenteDashboard },
      { path: 'estudiantes', name: 'DocenteEstudiantes', component: DocenteEstudiantes },
      { path: 'seguimiento', name: 'DocenteSeguimiento', component: DocenteSeguimiento },
      { path: 'historial', name: 'DocenteHistorial', component: DocenteHistorial },
      { path: 'perfil', name: 'DocentePerfil', component: DocentePerfil }
    ]
  },
  {
    path: '/bienestar',
    component: BienestarLayout,
    meta: { requiresAuth: true, roles: [ROLES.BIENESTAR] },
    children: [
      { path: '', redirect: '/bienestar/dashboard' },
      { path: 'dashboard', name: 'BienestarDashboard', component: BienestarDashboard },
      { path: 'estudiantes', name: 'BienestarEstudiantes', component: BienestarEstudiantes },
      { path: 'seguimiento', name: 'BienestarSeguimiento', component: BienestarSeguimiento },
      { path: 'adaptaciones', name: 'BienestarAdaptaciones', component: BienestarAdaptaciones },
      { path: 'reportes', name: 'BienestarReportes', component: BienestarReportes },
      { path: 'perfil', name: 'BienestarPerfil', component: BienestarPerfil }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guard de navegación para proteger rutas
router.beforeEach((to, from, next) => {
  const sesion = obtenerSesion();
  if (to.meta.requiresAuth) {
    if (!sesion) {
      next('/login');
    } else if (to.meta.roles && !to.meta.roles.includes(sesion.rol)) {
      // Redirigir a su propio dashboard
      if (sesion.rol === ROLES.ADMIN) next('/admin/dashboard');
      else if (sesion.rol === ROLES.DOCENTE) next('/docente/dashboard');
      else if (sesion.rol === ROLES.BIENESTAR) next('/bienestar/dashboard');
      else next('/login');
    } else {
      next();
    }
  } else {
    // Si ya tiene sesión activa y va a login, redirigir a su panel
    if (to.path === '/login' && sesion) {
      if (sesion.rol === ROLES.ADMIN) next('/admin/dashboard');
      else if (sesion.rol === ROLES.DOCENTE) next('/docente/dashboard');
      else if (sesion.rol === ROLES.BIENESTAR) next('/bienestar/dashboard');
    } else {
      next();
    }
  }
});

export default router;
