<template>
  <div>
    <section class="page-heading">
      <div>
        <h2>Gestión de usuarios</h2>
        <p>Administra cuentas, roles y accesos del personal autorizado.</p>
      </div>
      <button class="primary-action" @click="abrirNuevoUsuario" type="button">
        <i class="fas fa-user-plus"></i>
        Nuevo usuario
      </button>
    </section>

    <!-- Resumen de usuarios -->
    <section class="summary-grid users-summary" aria-label="Resumen de usuarios">
      <article class="summary-card user-summary-card">
        <span class="summary-label">Usuarios activos</span>
        <strong>{{ stats.activos }}</strong>
        <small>Con acceso al sistema</small>
      </article>
      <article class="summary-card user-summary-card">
        <span class="summary-label">Administradores</span>
        <strong>{{ stats.admins }}</strong>
        <small>Control total</small>
      </article>
      <article class="summary-card user-summary-card">
        <span class="summary-label">Docentes</span>
        <strong>{{ stats.docentes }}</strong>
        <small>Seguimiento académico</small>
      </article>
      <article class="summary-card user-summary-card">
        <span class="summary-label">Bienestar</span>
        <strong>{{ stats.bienestar }}</strong>
        <small>Atención y apoyo</small>
      </article>
    </section>

    <!-- Filtros -->
    <section class="filters-section users-filters" aria-label="Filtros de usuarios">
      <div class="search-field">
        <label for="user-search">Buscar usuario</label>
        <div class="input-with-icon">
          <i class="fas fa-search" aria-hidden="true"></i>
          <input 
            type="search" 
            id="user-search" 
            v-model="filtroBusqueda" 
            placeholder="Nombre o correo institucional"
          />
        </div>
      </div>
      <div class="filter-field">
        <label for="role-filter">Rol</label>
        <select id="role-filter" v-model="filtroRol">
          <option value="">Todos</option>
          <option value="administrador">Administrador</option>
          <option value="docente">Docente</option>
          <option value="bienestar">Bienestar</option>
        </select>
      </div>
      <div class="filter-field">
        <label for="status-filter">Estado</label>
        <select id="status-filter" v-model="filtroEstado">
          <option value="">Todos</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>
      <button class="secondary-action" @click="limpiarFiltros" type="button" style="margin-top: 24px; height: 42px;">
        <i class="fas fa-eraser"></i>
        Limpiar
      </button>
    </section>

    <!-- Layout principal: tabla + lateral -->
    <section class="users-layout">
      <article class="table-section users-table-section">
        <div class="section-title-row">
          <h2>Listado de usuarios</h2>
          <span>{{ usuariosFiltrados.length }} usuarios</span>
        </div>
        <div style="overflow-x:auto">
          <table class="students-table users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Área / Asignaturas</th>
                <th>Registro</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="usuariosFiltrados.length === 0">
                <td colspan="6" class="empty-row" style="text-align:center; padding: 20px;">
                  No se encontraron usuarios con esos filtros.
                </td>
              </tr>
              <tr 
                v-for="u in usuariosFiltrados" 
                :key="u.id"
              >
                <td>
                  <div style="display:flex; align-items:center; gap:10px">
                    <div class="ficha-avatar" style="width:36px; height:36px; font-size:12px; margin-bottom:0;">
                      {{ obtenerIniciales(u.nombres, u.apellidos) }}
                    </div>
                    <div>
                      <strong>{{ u.nombres }} {{ u.apellidos }}</strong>
                      <span style="display:block; font-size:11px; color:var(--text-muted);">{{ u.correo }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="role-badge" :class="claseRol(u.rol)">{{ etiquetaRol(u.rol) }}</span>
                </td>
                <td>
                  <span v-if="u.rol === 'docente'" style="font-size:12px;">
                    {{ u.asignaturas && u.asignaturas.length ? u.asignaturas.join(', ') : 'Asignaturas generales' }}
                    <small style="display:block; color:var(--text-muted);" v-if="u.estudiantesAsignados">
                      ({{ u.estudiantesAsignados.length }} estudiantes asignados)
                    </small>
                  </span>
                  <span v-else-if="u.rol === 'bienestar'">Atención Estudiantil</span>
                  <span v-else>Acceso de Administración</span>
                </td>
                <td>{{ formatearFecha(u.fechaCreacion) }}</td>
                <td>
                  <button 
                    class="status" 
                    :class="u.activo ? 'active' : 'inactive'" 
                    @click="cambiarEstadoActivo(u)"
                    :disabled="u.id === 'usr-admin-001' || u.id === usuarioActualId"
                    style="border:none; cursor:pointer;"
                    title="Haga clic para cambiar estado"
                  >
                    {{ u.activo ? 'Activo' : 'Inactivo' }}
                  </button>
                </td>
                <td>
                  <button class="action-btn view" @click="verDetalle(u)" title="Ver usuario"><i class="fas fa-eye"></i></button>
                  <button class="action-btn edit" @click="editarUsuario(u)" title="Editar usuario"><i class="fas fa-edit"></i></button>
                  <button 
                    class="action-btn delete" 
                    @click="confirmarEliminar(u)" 
                    :disabled="u.id === 'usr-admin-001' || u.id === usuarioActualId"
                    title="Eliminar usuario"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <!-- Panel lateral -->
      <aside class="users-side-panel">
        <article class="dashboard-panel">
          <h2>Roles del sistema</h2>
          <div class="role-list">
            <div style="margin-bottom:12px">
              <strong><span class="role-badge admin">Admin</span></strong>
              <span style="font-size:12px; display:block; color:#475569; margin-top:4px;">Control total: estudiantes, usuarios, reportes y configuración.</span>
            </div>
            <div style="margin-bottom:12px">
              <strong><span class="role-badge teacher">Docente</span></strong>
              <span style="font-size:12px; display:block; color:#475569; margin-top:4px;">Consulta estudiantes asignados y registra observaciones académicas.</span>
            </div>
            <div>
              <strong><span class="role-badge welfare">Bienestar</span></strong>
              <span style="font-size:12px; display:block; color:#475569; margin-top:4px;">Gestiona registros, seguimientos, apoyos y alertas de atención.</span>
            </div>
          </div>
        </article>
        <article class="dashboard-panel">
          <h2>Seguridad</h2>
          <div class="security-list" style="padding:10px 20px; display:flex; flex-direction:column; gap:8px; font-size:12px; color:#475569;">
            <span><i class="fas fa-check-circle" style="color:var(--uleam-green); margin-right:6px"></i> Verificación institucional (@uleam.edu.ec)</span>
            <span><i class="fas fa-check-circle" style="color:var(--uleam-green); margin-right:6px"></i> Acceso por roles y permisos</span>
            <span><i class="fas fa-shield-alt" style="color:var(--uleam-green); margin-right:6px"></i> El admin principal no puede eliminarse</span>
          </div>
        </article>
      </aside>
    </section>

    <!-- MODAL CREAR / EDITAR USUARIO -->
    <div 
      v-if="modalUserVisible" 
      class="modal-overlay visible" 
      @click.self="cerrarModalUser"
    >
      <div class="modal-box">
        <div class="modal-header">
          <h3>{{ formUser.id ? 'Editar usuario' : 'Nuevo usuario' }}</h3>
          <button class="modal-close" @click="cerrarModalUser" aria-label="Cerrar modal"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarUsuarioForm" novalidate>
            <div class="modal-form-grid">
              <div class="mf-field required" :class="{ 'is-invalid': errors.nombres }">
                <label>Nombres</label>
                <input type="text" v-model="formUser.nombres" placeholder="Ej: María José">
                <span class="mf-error" v-if="errors.nombres">{{ errors.nombres }}</span>
              </div>
              <div class="mf-field required" :class="{ 'is-invalid': errors.apellidos }">
                <label>Apellidos</label>
                <input type="text" v-model="formUser.apellidos" placeholder="Ej: González López">
                <span class="mf-error" v-if="errors.apellidos">{{ errors.apellidos }}</span>
              </div>
              <div class="mf-field required full" :class="{ 'is-invalid': errors.correo }">
                <label>Correo institucional</label>
                <input type="email" v-model="formUser.correo" placeholder="usuario@uleam.edu.ec" :disabled="formUser.id === 'usr-admin-001'">
                <span class="mf-error" v-if="errors.correo">{{ errors.correo }}</span>
              </div>
              <div class="mf-field required" :class="{ 'is-invalid': errors.rol }">
                <label>Rol</label>
                <select v-model="formUser.rol" :disabled="formUser.id === 'usr-admin-001'">
                  <option value="">Seleccionar rol</option>
                  <option value="administrador">Administrador</option>
                  <option value="docente">Docente</option>
                  <option value="bienestar">Bienestar Estudiantil</option>
                </select>
                <span class="mf-error" v-if="errors.rol">{{ errors.rol }}</span>
              </div>
              <div class="mf-field">
                <label>Estado</label>
                <select v-model="formUser.activo" :disabled="formUser.id === 'usr-admin-001' || formUser.id === usuarioActualId">
                  <option :value="true">Activo</option>
                  <option :value="false">Inactivo</option>
                </select>
              </div>
              <div class="mf-field full" :class="{ 'is-invalid': errors.contrasena }">
                <label>Contraseña {{ formUser.id ? '(Opcional, deje en blanco para no cambiar)' : '' }}</label>
                <div class="pass-wrap" style="position:relative;">
                  <input :type="showPass ? 'text' : 'password'" v-model="formUser.contrasena" placeholder="Mínimo 6 caracteres">
                  <button type="button" class="pass-toggle" @click="showPass = !showPass" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; color:#64748b; padding:4px;">
                    <i class="fas" :class="showPass ? 'fa-eye-slash' : 'fa-eye'"></i>
                  </button>
                </div>
                <span class="mf-error" v-if="errors.contrasena">{{ errors.contrasena }}</span>
              </div>

              <!-- Asignación de estudiantes a docente -->
              <div class="mf-field full assign-section" v-if="formUser.rol === 'docente'">
                <h4 style="font-size:14px; margin-bottom:8px; display:flex; align-items:center; gap:6px; color:var(--uleam-green)">
                  <i class="fas fa-users"></i> Estudiantes asignados
                </h4>
                <div class="checklist-students" style="max-height:160px; overflow-y:auto; border:1px solid #cfd8e3; border-radius:6px; padding:10px; display:flex; flex-direction:column; gap:6px;">
                  <span class="checklist-empty" v-if="estudiantes.length === 0" style="color:#94a3b8; font-size:12px;">No hay estudiantes registrados.</span>
                  <label v-for="e in estudiantes" :key="e.id" style="display:flex; align-items:center; gap:8px; font-size:13px; color:#374151; cursor:pointer;">
                    <input type="checkbox" :value="e.id" v-model="formUser.estudiantesAsignados">
                    <span>{{ e.nombres }} {{ e.apellidos }} ({{ e.cedula }})</span>
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="secondary-action" @click="cerrarModalUser">Cancelar</button>
          <button type="button" class="primary-action" @click="guardarUsuarioForm">
            <i class="fas fa-save"></i> Guardar
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL VER DETALLE DE USUARIO -->
    <div 
      v-if="modalVerVisible" 
      class="modal-overlay visible" 
      @click.self="modalVerVisible = false"
    >
      <div class="modal-box">
        <div class="modal-header">
          <h3>Detalle de usuario</h3>
          <button class="modal-close" @click="modalVerVisible = false" aria-label="Cerrar modal"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body" v-if="usuarioDetalle">
          <div class="ficha-header">
            <div class="ficha-avatar">
              {{ obtenerIniciales(usuarioDetalle.nombres, usuarioDetalle.apellidos) }}
            </div>
            <div>
              <strong>{{ usuarioDetalle.nombres }} {{ usuarioDetalle.apellidos }}</strong>
              <span>{{ usuarioDetalle.correo }}</span>
            </div>
          </div>
          <dl class="detalle-lista">
            <dt>Rol de sistema</dt>
            <dd><span class="role-badge" :class="claseRol(usuarioDetalle.rol)">{{ etiquetaRol(usuarioDetalle.rol) }}</span></dd>
            <dt>Estado de cuenta</dt>
            <dd><span class="status" :class="usuarioDetalle.activo ? 'active' : 'inactive'">{{ usuarioDetalle.activo ? 'Activo' : 'Inactivo' }}</span></dd>
            <dt>Fecha de registro</dt>
            <dd>{{ formatearFecha(usuarioDetalle.fechaCreacion) }}</dd>
            <dt v-if="usuarioDetalle.rol === 'docente'">Estudiantes a cargo</dt>
            <dd v-if="usuarioDetalle.rol === 'docente'">
              <div v-if="usuarioDetalle.estudiantesAsignados && usuarioDetalle.estudiantesAsignados.length">
                <ul style="padding-left: 20px; font-size:13px; color:#374151;">
                  <li v-for="estId in usuarioDetalle.estudiantesAsignados" :key="estId">
                    {{ getEstudianteNombreCompleto(estId) }}
                  </li>
                </ul>
              </div>
              <span v-else style="color:#94a3b8; font-style:italic; font-size:13px;">Sin estudiantes asignados</span>
            </dd>
          </dl>
        </div>
        <div class="modal-footer">
          <button type="button" class="secondary-action" @click="modalVerVisible = false">Cerrar</button>
          <button type="button" class="primary-action" @click="editarDesdeDetalle">
            <i class="fas fa-edit"></i> Editar
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL CONFIRMAR ELIMINAR -->
    <div 
      v-if="usuarioAEliminar" 
      class="modal-overlay visible" 
      @click.self="usuarioAEliminar = null"
    >
      <div class="modal-box modal-sm">
        <div class="modal-header">
          <h3>Confirmar eliminación</h3>
          <button class="modal-close" @click="usuarioAEliminar = null" aria-label="Cerrar modal"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="confirm-body">
            <div class="confirm-icon"><i class="fas fa-trash-alt"></i></div>
            <p>¿Está seguro que desea eliminar la cuenta de <strong>{{ usuarioAEliminar.nombres }} {{ usuarioAEliminar.apellidos }}</strong>?</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="secondary-action" @click="usuarioAEliminar = null">Cancelar</button>
          <button type="button" class="danger-action" @click="eliminarUsuarioConfirmado">
            <i class="fas fa-trash-alt"></i> Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  obtenerUsuarios, 
  obtenerEstadisticasUsuarios, 
  obtenerEstudiantes, 
  obtenerSesion, 
  crearUsuario, 
  actualizarUsuario, 
  eliminarUsuario, 
  toggleActivoUsuario 
} from '../../services/storage.js';
import { 
  formatearFecha, 
  normalizarTexto, 
  obtenerIniciales 
} from '../../utils/helpers.js';
import { showToast } from '../../services/toast.js';
import { Validaciones } from '../../services/validaciones.js';

const usuarios = ref([]);
const estudiantes = ref([]);
const stats = ref({ total:0, activos:0, admins:0, docentes:0, bienestar:0 });
const usuarioActualId = ref(null);

const filtroBusqueda = ref('');
const filtroRol = ref('');
const filtroEstado = ref('');

// Modales
const modalUserVisible = ref(false);
const showPass = ref(false);
const modalVerVisible = ref(false);
const usuarioDetalle = ref(null);
const usuarioAEliminar = ref(null);

const formUser = ref({
  id: '',
  nombres: '',
  apellidos: '',
  correo: '',
  rol: '',
  activo: true,
  contrasena: '',
  estudiantesAsignados: []
});

const errors = ref({
  nombres: '',
  apellidos: '',
  correo: '',
  rol: '',
  contrasena: ''
});

onMounted(() => {
  const sesion = obtenerSesion();
  if (sesion) {
    usuarioActualId.value = sesion.id;
  }
  cargarTodo();
});

function cargarTodo() {
  usuarios.value = obtenerUsuarios();
  estudiantes.value = obtenerEstudiantes();
  stats.value = obtenerEstadisticasUsuarios();
}

function etiquetaRol(rol) {
  const map = {
    administrador: 'Administrador',
    docente: 'Docente',
    bienestar: 'Bienestar'
  };
  return map[rol] || rol;
}

function claseRol(rol) {
  const map = {
    administrador: 'admin',
    docente: 'teacher',
    bienestar: 'welfare'
  };
  return map[rol] || 'reader';
}

function getEstudianteNombreCompleto(id) {
  const est = estudiantes.value.find(e => e.id === id);
  return est ? `${est.nombres} ${est.apellidos}` : 'Desconocido';
}

// Filtros
const usuariosFiltrados = computed(() => {
  let list = usuarios.value;
  const busq = normalizarTexto(filtroBusqueda.value.trim());
  const rol = filtroRol.value;
  const estado = filtroEstado.value;

  return list.filter(u => {
    const texto = normalizarTexto([u.nombres, u.apellidos, u.correo].join(' '));
    const coincideBusqueda = !busq || texto.includes(busq);
    const coincideRol = !rol || u.rol === rol;
    const coincideEstado = !estado || 
      (estado === 'activo' ? u.activo : !u.activo);

    return coincideBusqueda && coincideRol && coincideEstado;
  });
});

function limpiarFiltros() {
  filtroBusqueda.value = '';
  filtroRol.value = '';
  filtroEstado.value = '';
}

// Activar / Desactivar
function cambiarEstadoActivo(user) {
  if (user.id === 'usr-admin-001' || user.id === usuarioActualId.value) {
    return;
  }
  const res = toggleActivoUsuario(user.id);
  if (res.exito) {
    showToast(res.mensaje);
    cargarTodo();
  } else {
    showToast(res.mensaje, 'error');
  }
}

// Crear / Editar
function abrirNuevoUsuario() {
  formUser.value = {
    id: '',
    nombres: '',
    apellidos: '',
    correo: '',
    rol: '',
    activo: true,
    contrasena: '',
    estudiantesAsignados: []
  };
  errors.value = { nombres: '', apellidos: '', correo: '', rol: '', contrasena: '' };
  showPass.value = false;
  modalUserVisible.value = true;
}

function cerrarModalUser() {
  modalUserVisible.value = false;
}

function editarUsuario(user) {
  formUser.value = {
    id: user.id,
    nombres: user.nombres,
    apellidos: user.apellidos,
    correo: user.correo,
    rol: user.rol,
    activo: user.activo,
    contrasena: '', // se deja en blanco para no cambiar
    estudiantesAsignados: user.estudiantesAsignados ? [...user.estudiantesAsignados] : []
  };
  errors.value = { nombres: '', apellidos: '', correo: '', rol: '', contrasena: '' };
  showPass.value = false;
  modalUserVisible.value = true;
}

function validarFormUser() {
  let valido = true;
  errors.value = { nombres: '', apellidos: '', correo: '', rol: '', contrasena: '' };

  if (!Validaciones.requerido(formUser.value.nombres)) {
    errors.value.nombres = 'Nombres obligatorios.';
    valido = false;
  }
  if (!Validaciones.requerido(formUser.value.apellidos)) {
    errors.value.apellidos = 'Apellidos obligatorios.';
    valido = false;
  }
  if (!Validaciones.requerido(formUser.value.correo)) {
    errors.value.correo = 'Correo obligatorio.';
    valido = false;
  } else if (!Validaciones.correoInstitucional(formUser.value.correo)) {
    errors.value.correo = 'Debe ingresar un correo institucional (@uleam.edu.ec).';
    valido = false;
  }
  if (!Validaciones.requerido(formUser.value.rol)) {
    errors.value.rol = 'El rol es obligatorio.';
    valido = false;
  }

  // Contraseña requerida solo para usuarios nuevos
  if (!formUser.value.id) {
    if (!Validaciones.requerido(formUser.value.contrasena)) {
      errors.value.contrasena = 'La contraseña es obligatoria.';
      valido = false;
    } else if (!Validaciones.contrasena(formUser.value.contrasena)) {
      errors.value.contrasena = 'Debe tener al menos 6 caracteres.';
      valido = false;
    }
  } else if (formUser.value.contrasena) {
    // Si edita y pone contraseña
    if (!Validaciones.contrasena(formUser.value.contrasena)) {
      errors.value.contrasena = 'Debe tener al menos 6 caracteres.';
      valido = false;
    }
  }

  return valido;
}

function guardarUsuarioForm() {
  if (!validarFormUser()) {
    showToast('Corrija los errores del formulario.', 'error');
    return;
  }

  let res;
  if (formUser.value.id) {
    // Editar
    const datosModificados = { ...formUser.value };
    if (!datosModificados.contrasena) {
      delete datosModificados.contrasena; // no cambia
    }
    res = actualizarUsuario(formUser.value.id, datosModificados);
  } else {
    // Crear
    res = crearUsuario(formUser.value);
  }

  if (res.exito) {
    showToast(res.mensaje);
    cerrarModalUser();
    cargarTodo();
  } else {
    showToast(res.mensaje, 'error');
  }
}

// Ver Detalle
function verDetalle(user) {
  usuarioDetalle.value = user;
  modalVerVisible.value = true;
}

function editarDesdeDetalle() {
  modalVerVisible.value = false;
  if (usuarioDetalle.value) {
    editarUsuario(usuarioDetalle.value);
  }
}

// Eliminar
function confirmarEliminar(user) {
  if (user.id === 'usr-admin-001' || user.id === usuarioActualId.value) {
    return;
  }
  usuarioAEliminar.value = user;
}

function eliminarUsuarioConfirmado() {
  if (usuarioAEliminar.value) {
    const res = eliminarUsuario(usuarioAEliminar.value.id);
    if (res.exito) {
      showToast(res.mensaje);
      usuarioAEliminar.value = null;
      cargarTodo();
    } else {
      showToast(res.mensaje, 'error');
    }
  }
}
</script>
