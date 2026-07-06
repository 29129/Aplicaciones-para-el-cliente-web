/**
 * storage.js
 * Capa de persistencia del sistema ULEAM (carpeta Proyecyo).
 * Gestiona lectura/escritura en localStorage y datos semilla iniciales.
 */

const STORAGE_KEYS = {
    USUARIOS: 'uleam_usuarios',
    ESTUDIANTES: 'uleam_estudiantes',
    SEGUIMIENTO: 'uleam_seguimiento',
    APOYOS: 'uleam_apoyos',
    ADAPTACIONES: 'uleam_adaptaciones',
    SESION: 'uleam_sesion',
    CONFIG: 'uleam_config',
    REPORTES: 'uleam_reportes'
};

/** Roles permitidos en el sistema */
const ROLES = {
    ADMIN: 'administrador',
    DOCENTE: 'docente',
    BIENESTAR: 'bienestar'
};

/**
 * Lee y parsea un valor de localStorage de forma segura.
 */
function leerStorage(clave, valorPorDefecto = null) {
    try {
        const raw = localStorage.getItem(clave);
        if (raw === null) return valorPorDefecto;
        return JSON.parse(raw);
    } catch (error) {
        console.error(`Error al leer ${clave}:`, error);
        return valorPorDefecto;
    }
}

/** Guarda un objeto en localStorage. */
function guardarStorage(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
}

/** Genera un identificador único. */
function generarId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Usuarios de demostración para la fase 1. */
function obtenerUsuariosSemilla() {
    return [
        {
            id: 'usr-admin-001',
            nombres: 'Carlos',
            apellidos: 'Mendoza',
            correo: 'admin@uleam.edu.ec',
            contrasena: 'admin123',
            rol: ROLES.ADMIN,
            activo: true,
            fechaCreacion: '2026-01-15T08:00:00.000Z'
        },
        {
            id: 'usr-docente-001',
            nombres: 'María',
            apellidos: 'González',
            correo: 'docente@uleam.edu.ec',
            contrasena: 'docente123',
            rol: ROLES.DOCENTE,
            activo: true,
            asignaturas: ['Matemáticas', 'Estadística'],
            estudiantesAsignados: [],
            fechaCreacion: '2026-01-15T08:00:00.000Z'
        },
        {
            id: 'usr-bienestar-001',
            nombres: 'Ana',
            apellidos: 'López',
            correo: 'bienestar@uleam.edu.ec',
            contrasena: 'bienestar123',
            rol: ROLES.BIENESTAR,
            activo: true,
            fechaCreacion: '2026-01-15T08:00:00.000Z'
        }
    ];
}

/** Estudiantes de demostración. */
function obtenerEstudiantesSemilla() {
    return [
        {
            id: 'est-001',
            nombres: 'María José',
            apellidos: 'Mendoza',
            cedula: '1312456789',
            fechaNacimiento: '2002-05-14',
            genero: 'Femenino',
            telefono: '0991234567',
            correoInstitucional: 'mj.mendoza@uleam.edu.ec',
            direccion: 'Manta, Manabí',
            facultad: 'Ciencias de la Salud',
            carrera: 'Enfermería',
            semestre: 'Tercero',
            paralelo: 'A',
            jornada: 'Matutina',
            estadoAcademico: 'Activo',
            tipoDiscapacidad: 'Visual',
            gradoDiscapacidad: 45,
            certificado: 'Sí',
            institucionCertificadora: 'CONADIS',
            estado: 'Activo',
            nivelRiesgo: 'Bajo',
            fechaRegistro: '2026-03-10T10:00:00.000Z'
        },
        {
            id: 'est-002',
            nombres: 'Carlos Andrés',
            apellidos: 'López',
            cedula: '1312456790',
            fechaNacimiento: '2001-08-22',
            genero: 'Masculino',
            telefono: '0987654321',
            correoInstitucional: 'ca.lopez@uleam.edu.ec',
            direccion: 'Portoviejo, Manabí',
            facultad: 'Ingeniería',
            carrera: 'Ingeniería Civil',
            semestre: 'Cuarto',
            paralelo: 'B',
            jornada: 'Vespertina',
            estadoAcademico: 'Activo',
            tipoDiscapacidad: 'Motora',
            gradoDiscapacidad: 60,
            certificado: 'Sí',
            institucionCertificadora: 'MSP',
            estado: 'En seguimiento',
            nivelRiesgo: 'Medio',
            fechaRegistro: '2026-03-08T14:30:00.000Z'
        },
        {
            id: 'est-003',
            nombres: 'Ana Paula',
            apellidos: 'Solórzano',
            cedula: '1312456791',
            fechaNacimiento: '2003-01-10',
            genero: 'Femenino',
            telefono: '0976543210',
            correoInstitucional: 'ap.solorzano@uleam.edu.ec',
            direccion: 'Manta, Manabí',
            facultad: 'Ciencias Sociales',
            carrera: 'Psicología',
            semestre: 'Segundo',
            paralelo: 'A',
            jornada: 'Matutina',
            estadoAcademico: 'Activo',
            tipoDiscapacidad: 'Auditiva',
            gradoDiscapacidad: 70,
            certificado: 'Sí',
            institucionCertificadora: 'CONADIS',
            estado: 'Activo',
            nivelRiesgo: 'Bajo',
            fechaRegistro: '2026-03-05T09:15:00.000Z'
        }
    ];
}

/** Inicializa localStorage con datos semilla si no existen. */
function inicializarStorage() {
    if (!leerStorage(STORAGE_KEYS.USUARIOS)) {
        guardarStorage(STORAGE_KEYS.USUARIOS, obtenerUsuariosSemilla());
    }

    if (!leerStorage(STORAGE_KEYS.ESTUDIANTES)) {
        const estudiantes = obtenerEstudiantesSemilla();
        guardarStorage(STORAGE_KEYS.ESTUDIANTES, estudiantes);

        const usuarios = leerStorage(STORAGE_KEYS.USUARIOS, []);
        const docente = usuarios.find((u) => u.rol === ROLES.DOCENTE);
        if (docente) {
            docente.estudiantesAsignados = estudiantes.map((e) => e.id);
            guardarStorage(STORAGE_KEYS.USUARIOS, usuarios);
        }
    }

    if (!leerStorage(STORAGE_KEYS.SEGUIMIENTO)) {
        guardarStorage(STORAGE_KEYS.SEGUIMIENTO, []);
    }

    if (!leerStorage(STORAGE_KEYS.APOYOS)) {
        guardarStorage(STORAGE_KEYS.APOYOS, []);
    }

    if (!leerStorage(STORAGE_KEYS.ADAPTACIONES)) {
        guardarStorage(STORAGE_KEYS.ADAPTACIONES, []);
    }

    if (!leerStorage(STORAGE_KEYS.CONFIG)) {
        guardarStorage(STORAGE_KEYS.CONFIG, {
            nombreInstitucion: 'Universidad Laica Eloy Alfaro de Manabí',
            periodoActivo: '2026-1',
            version: '1.0.0',
            correoSoporte: 'soporte@uleam.edu.ec',
            tiempoSesion: '60',
            notifSeguimientoVencido: true,
            notifResumenSemanal: true,
            notifNuevosRegistros: false,
            segCorreoInstitucional: true,
            segBloqueoIntentos: true,
            segRegistroActividad: true,
            catalogos: {
                facultades: ['Ciencias de la Salud', 'Ingeniería', 'Ciencias Sociales', 'Derecho', 'Ciencias de la Educación', 'Administración'],
                carreras:   ['Enfermería', 'Medicina', 'Ingeniería Civil', 'Ingeniería en Sistemas', 'Psicología', 'Derecho', 'Administración de Empresas', 'Trabajo Social'],
                tiposDiscapacidad: ['Visual', 'Auditiva', 'Motora', 'Física', 'Intelectual', 'Psicosocial', 'Múltiple'],
                tiposApoyo: ['Académico', 'Psicológico', 'Tecnológico', 'Físico', 'Social']
            }
        });
    }

    if (!leerStorage(STORAGE_KEYS.REPORTES)) {
        guardarStorage(STORAGE_KEYS.REPORTES, []);
    }
}

/* ===================== SESIÓN ===================== */

function obtenerSesion() {
    return leerStorage(STORAGE_KEYS.SESION);
}

function guardarSesion(usuario) {
    const { contrasena, ...sesionSegura } = usuario;
    guardarStorage(STORAGE_KEYS.SESION, {
        ...sesionSegura,
        fechaLogin: new Date().toISOString()
    });
}

function cerrarSesion() {
    localStorage.removeItem(STORAGE_KEYS.SESION);
}

function estaAutenticado() {
    return obtenerSesion() !== null;
}

/**
 * Rutas de dashboard según la estructura actual de Proyecyo.
 * Admin usa admin.html en la raíz; docente y bienestar en subcarpetas.
 */
function obtenerRutaDashboard(rol) {
    const rutas = {
        [ROLES.ADMIN]:      'pages/admin/admin.html',
        [ROLES.DOCENTE]:    'pages/docente/dashboard.html',
        [ROLES.BIENESTAR]:  'pages/bienestar/dashboard.html'
    };
    return rutas[rol] || 'inicio.html';
}

/**
 * Protege una página verificando sesión y rol.
 * @param {string[]} rolesPermitidos
 * @param {string} rutaBase - '../' para subcarpetas docente/bienestar
 */
function protegerPagina(rolesPermitidos = [], rutaBase = '') {
    inicializarStorage();
    const sesion = obtenerSesion();

    if (!sesion) {
        window.location.href = `${rutaBase}inicio.html`;
        return null;
    }

    if (rolesPermitidos.length && !rolesPermitidos.includes(sesion.rol)) {
        window.location.href = `${rutaBase}${obtenerRutaDashboard(sesion.rol)}`;
        return null;
    }

    return sesion;
}

/* ===================== USUARIOS ===================== */

function obtenerUsuarios() {
    return leerStorage(STORAGE_KEYS.USUARIOS, []);
}

function guardarUsuarios(usuarios) {
    guardarStorage(STORAGE_KEYS.USUARIOS, usuarios);
}

function autenticarUsuario(correo, contrasena) {
    const usuarios = obtenerUsuarios();
    const usuario = usuarios.find(
        (u) => u.correo.toLowerCase() === correo.toLowerCase().trim()
    );

    if (!usuario) {
        return { exito: false, mensaje: 'Correo institucional no registrado.' };
    }

    if (!usuario.activo) {
        return { exito: false, mensaje: 'Su cuenta está desactivada. Contacte al administrador.' };
    }

    if (usuario.contrasena !== contrasena) {
        return { exito: false, mensaje: 'Contraseña incorrecta.' };
    }

    return { exito: true, mensaje: 'Inicio de sesión exitoso.', usuario };
}

/**
 * Crea un nuevo usuario (solo Docente o Bienestar desde la UI).
 * @param {object} datos - Campos del usuario
 * @returns {{ exito: boolean, mensaje: string, usuario?: object }}
 */
function crearUsuario(datos) {
    const usuarios = obtenerUsuarios();

    // Verificar correo único
    const correoExistente = usuarios.find(
        (u) => u.correo.toLowerCase() === datos.correo.toLowerCase().trim()
    );
    if (correoExistente) {
        return { exito: false, mensaje: 'Ya existe un usuario con ese correo institucional.' };
    }

    const usuario = {
        id: generarId(),
        nombres: datos.nombres.trim(),
        apellidos: datos.apellidos.trim(),
        correo: datos.correo.toLowerCase().trim(),
        contrasena: datos.contrasena,
        rol: datos.rol,
        activo: datos.activo !== undefined ? datos.activo : true,
        estudiantesAsignados: datos.rol === ROLES.DOCENTE ? (datos.estudiantesAsignados || []) : undefined,
        fechaCreacion: new Date().toISOString()
    };

    // Eliminar campo undefined para docentes que no lo necesitan
    if (usuario.rol !== ROLES.DOCENTE) {
        delete usuario.estudiantesAsignados;
    }

    usuarios.push(usuario);
    guardarUsuarios(usuarios);
    return { exito: true, mensaje: 'Usuario creado correctamente.', usuario };
}

/**
 * Actualiza un usuario existente por ID.
 * No permite cambiar el rol de admin ni modificar al usuario admin semilla.
 */
function actualizarUsuario(id, datos) {
    const usuarios = obtenerUsuarios();
    const indice = usuarios.findIndex((u) => u.id === id);

    if (indice === -1) {
        return { exito: false, mensaje: 'Usuario no encontrado.' };
    }

    // Proteger usuario admin semilla
    if (usuarios[indice].id === 'usr-admin-001' && datos.rol && datos.rol !== ROLES.ADMIN) {
        return { exito: false, mensaje: 'No se puede cambiar el rol del administrador principal.' };
    }

    // Verificar correo único (excepto el mismo usuario)
    const correoExistente = usuarios.find(
        (u) => u.correo.toLowerCase() === (datos.correo || '').toLowerCase().trim() && u.id !== id
    );
    if (datos.correo && correoExistente) {
        return { exito: false, mensaje: 'Ya existe otro usuario con ese correo institucional.' };
    }

    // Construir objeto actualizado conservando campos no editables
    const actualizado = { ...usuarios[indice] };
    if (datos.nombres) actualizado.nombres = datos.nombres.trim();
    if (datos.apellidos) actualizado.apellidos = datos.apellidos.trim();
    if (datos.correo) actualizado.correo = datos.correo.toLowerCase().trim();
    if (datos.contrasena) actualizado.contrasena = datos.contrasena;
    if (datos.rol !== undefined) actualizado.rol = datos.rol;
    if (datos.activo !== undefined) actualizado.activo = datos.activo;

    // Gestionar campo estudiantesAsignados según rol
    if (actualizado.rol === ROLES.DOCENTE) {
        actualizado.estudiantesAsignados = datos.estudiantesAsignados || actualizado.estudiantesAsignados || [];
    } else {
        delete actualizado.estudiantesAsignados;
    }

    usuarios[indice] = actualizado;
    guardarUsuarios(usuarios);
    return { exito: true, mensaje: 'Usuario actualizado correctamente.', usuario: actualizado };
}

/**
 * Elimina un usuario por ID.
 * No permite eliminar al admin semilla ni al usuario en sesión activa.
 */
function eliminarUsuario(id) {
    const sesion = obtenerSesion();

    if (id === 'usr-admin-001') {
        return { exito: false, mensaje: 'No se puede eliminar al administrador principal del sistema.' };
    }

    if (sesion && sesion.id === id) {
        return { exito: false, mensaje: 'No puedes eliminar tu propia cuenta mientras tienes sesión activa.' };
    }

    const usuarios = obtenerUsuarios().filter((u) => u.id !== id);
    guardarUsuarios(usuarios);
    return { exito: true, mensaje: 'Usuario eliminado correctamente.' };
}

/**
 * Activa o desactiva la cuenta de un usuario (toggle).
 * No permite desactivar al admin semilla ni al usuario en sesión.
 */
function toggleActivoUsuario(id) {
    const sesion = obtenerSesion();

    if (id === 'usr-admin-001') {
        return { exito: false, mensaje: 'No se puede desactivar al administrador principal.' };
    }

    if (sesion && sesion.id === id) {
        return { exito: false, mensaje: 'No puedes desactivar tu propia cuenta activa.' };
    }

    const usuarios = obtenerUsuarios();
    const indice = usuarios.findIndex((u) => u.id === id);

    if (indice === -1) {
        return { exito: false, mensaje: 'Usuario no encontrado.' };
    }

    usuarios[indice].activo = !usuarios[indice].activo;
    guardarUsuarios(usuarios);

    const estado = usuarios[indice].activo ? 'activado' : 'desactivado';
    return { exito: true, mensaje: `Usuario ${estado} correctamente.`, activo: usuarios[indice].activo };
}

/**
 * Estadísticas de usuarios para las tarjetas de resumen del módulo.
 */
function obtenerEstadisticasUsuarios() {
    const usuarios = obtenerUsuarios();
    return {
        total: usuarios.length,
        activos: usuarios.filter((u) => u.activo).length,
        admins: usuarios.filter((u) => u.rol === ROLES.ADMIN).length,
        docentes: usuarios.filter((u) => u.rol === ROLES.DOCENTE).length,
        bienestar: usuarios.filter((u) => u.rol === ROLES.BIENESTAR).length
    };
}

/* ===================== ESTUDIANTES ===================== */

function obtenerEstudiantes() {
    return leerStorage(STORAGE_KEYS.ESTUDIANTES, []);
}

function guardarEstudiantes(estudiantes) {
    guardarStorage(STORAGE_KEYS.ESTUDIANTES, estudiantes);
}

function obtenerEstudiantePorId(id) {
    return obtenerEstudiantes().find((e) => e.id === id) || null;
}

function obtenerEstudiantePorCedula(cedula) {
    return obtenerEstudiantes().find((e) => e.cedula === cedula) || null;
}

/**
 * Crea un nuevo estudiante en localStorage.
 * @param {object} datos - Objeto estudiante
 * @returns {{ exito: boolean, mensaje: string, estudiante?: object }}
 */
function crearEstudiante(datos) {
    const estudiantes = obtenerEstudiantes();

    if (obtenerEstudiantePorCedula(datos.cedula)) {
        return { exito: false, mensaje: 'Ya existe un estudiante con esa cédula.' };
    }

    const estudiante = {
        id: generarId(),
        ...datos,
        fechaRegistro: new Date().toISOString()
    };

    estudiantes.push(estudiante);
    guardarEstudiantes(estudiantes);
    return { exito: true, mensaje: 'Estudiante registrado correctamente.', estudiante };
}

/**
 * Actualiza un estudiante existente.
 */
function actualizarEstudiante(id, datos) {
    const estudiantes = obtenerEstudiantes();
    const indice = estudiantes.findIndex((e) => e.id === id);

    if (indice === -1) {
        return { exito: false, mensaje: 'Estudiante no encontrado.' };
    }

    const cedulaDuplicada = estudiantes.find(
        (e) => e.cedula === datos.cedula && e.id !== id
    );
    if (cedulaDuplicada) {
        return { exito: false, mensaje: 'Ya existe otro estudiante con esa cédula.' };
    }

    estudiantes[indice] = { ...estudiantes[indice], ...datos, id };
    guardarEstudiantes(estudiantes);
    return { exito: true, mensaje: 'Estudiante actualizado correctamente.', estudiante: estudiantes[indice] };
}

/**
 * Elimina un estudiante por ID.
 */
function eliminarEstudiante(id) {
    const estudiantes = obtenerEstudiantes().filter((e) => e.id !== id);
    guardarEstudiantes(estudiantes);

    // Limpiar seguimientos, apoyos y adaptaciones asociados
    guardarSeguimientos(obtenerSeguimientos().filter((s) => s.estudianteId !== id));
    guardarApoyos(obtenerApoyos().filter((a) => a.estudianteId !== id));
    guardarAdaptaciones(obtenerAdaptaciones().filter((a) => a.estudianteId !== id));

    return { exito: true, mensaje: 'Estudiante eliminado correctamente.' };
}

/**
 * Estadísticas generales de estudiantes para el dashboard.
 */
function obtenerEstadisticasEstudiantes() {
    const estudiantes = obtenerEstudiantes();
    return {
        total: estudiantes.length,
        activos: estudiantes.filter((e) => e.estado === 'Activo').length,
        enSeguimiento: estudiantes.filter((e) => e.estado === 'En seguimiento').length,
        inactivos: estudiantes.filter((e) => e.estado === 'Inactivo').length
    };
}

/**
 * Cuenta estudiantes agrupados por tipo de discapacidad.
 */
function contarPorDiscapacidad() {
    const estudiantes = obtenerEstudiantes();
    const conteo = {};

    estudiantes.forEach((e) => {
        const tipo = e.tipoDiscapacidad || 'Sin especificar';
        conteo[tipo] = (conteo[tipo] || 0) + 1;
    });

    return conteo;
}

/**
 * Obtiene los últimos estudiantes registrados.
 */
function obtenerUltimosEstudiantes(limite = 4) {
    return [...obtenerEstudiantes()]
        .sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
        .slice(0, limite);
}

/**
 * Fecha del último seguimiento de un estudiante (o null).
 */
function obtenerFechaUltimoSeguimiento(estudianteId) {
    const seguimientos = obtenerSeguimientos()
        .filter((s) => s.estudianteId === estudianteId)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    return seguimientos.length ? seguimientos[0].fecha : null;
}

/* ===================== SEGUIMIENTO / APOYOS / ADAPTACIONES ===================== */

function obtenerSeguimientos() {
    return leerStorage(STORAGE_KEYS.SEGUIMIENTO, []);
}

function guardarSeguimientos(registros) {
    guardarStorage(STORAGE_KEYS.SEGUIMIENTO, registros);
}

function obtenerApoyos() {
    return leerStorage(STORAGE_KEYS.APOYOS, []);
}

function guardarApoyos(apoyos) {
    guardarStorage(STORAGE_KEYS.APOYOS, apoyos);
}

function obtenerAdaptaciones() {
    return leerStorage(STORAGE_KEYS.ADAPTACIONES, []);
}

function guardarAdaptaciones(adaptaciones) {
    guardarStorage(STORAGE_KEYS.ADAPTACIONES, adaptaciones);
}

/* ===================== CRUD SEGUIMIENTO ACADÉMICO ===================== */

/**
 * Crea un nuevo registro de seguimiento académico.
 * Campos: estudianteId, docenteId, asignatura, periodo,
 *         nota, asistencia (%), observaciones, estadoAcademico,
 *         comentarios, fecha, creadoPor (rol)
 */
function crearSeguimiento(datos) {
    const registros = obtenerSeguimientos();
    const nuevo = {
        id: generarId(),
        estudianteId:    datos.estudianteId,
        docenteId:       datos.docenteId    || null,
        asignatura:      datos.asignatura   || '',
        periodo:         datos.periodo      || '',
        nota:            datos.nota         !== undefined ? Number(datos.nota) : null,
        asistencia:      datos.asistencia   !== undefined ? Number(datos.asistencia) : null,
        observaciones:   datos.observaciones || '',
        estadoAcademico: datos.estadoAcademico || 'Regular',
        comentarios:     datos.comentarios  || '',
        creadoPor:       datos.creadoPor    || ROLES.ADMIN,
        fecha:           new Date().toISOString()
    };
    registros.push(nuevo);
    guardarSeguimientos(registros);
    return { exito: true, mensaje: 'Seguimiento registrado correctamente.', seguimiento: nuevo };
}

/**
 * Actualiza un registro de seguimiento por ID.
 */
function actualizarSeguimiento(id, datos) {
    const registros = obtenerSeguimientos();
    const idx = registros.findIndex(s => s.id === id);
    if (idx === -1) return { exito: false, mensaje: 'Registro no encontrado.' };
    registros[idx] = { ...registros[idx], ...datos, id, fechaActualizacion: new Date().toISOString() };
    guardarSeguimientos(registros);
    return { exito: true, mensaje: 'Seguimiento actualizado correctamente.', seguimiento: registros[idx] };
}

/**
 * Elimina un registro de seguimiento por ID.
 */
function eliminarSeguimiento(id) {
    guardarSeguimientos(obtenerSeguimientos().filter(s => s.id !== id));
    return { exito: true, mensaje: 'Seguimiento eliminado correctamente.' };
}

/**
 * Obtiene todos los seguimientos de un estudiante ordenados por fecha desc.
 */
function obtenerSeguimientosPorEstudiante(estudianteId) {
    return obtenerSeguimientos()
        .filter(s => s.estudianteId === estudianteId)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

/**
 * Obtiene todos los seguimientos registrados por un docente.
 */
function obtenerSeguimientosPorDocente(docenteId) {
    return obtenerSeguimientos()
        .filter(s => s.docenteId === docenteId)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

/**
 * Genera datos de semilla de seguimiento para pruebas.
 * Solo se llama si no existen registros y hay estudiantes.
 */
function generarSeguimientosSemilla() {
    const estudiantes = obtenerEstudiantes();
    const docente = obtenerUsuarios().find(u => u.rol === ROLES.DOCENTE);
    if (!estudiantes.length || !docente) return [];

    const periodoActivo = '2026-1';
    const asignaturas = ['Matemáticas', 'Programación', 'Estadística', 'Comunicación'];
    const semilla = [];

    estudiantes.forEach((est, i) => {
        // 2 registros por estudiante con fechas distintas
        semilla.push({
            id: `seg-semilla-${est.id}-1`,
            estudianteId:    est.id,
            docenteId:       docente.id,
            asignatura:      asignaturas[i % asignaturas.length],
            periodo:         periodoActivo,
            nota:            (7 + i) % 11,        // 7-10
            asistencia:      80 + (i * 5) % 20,   // 80-95
            observaciones:   'Estudiante con buen desempeño, requiere apoyo en evaluaciones orales.',
            estadoAcademico: i === 1 ? 'En riesgo' : 'Regular',
            comentarios:     'Se coordina con bienestar para adaptaciones.',
            creadoPor:       ROLES.DOCENTE,
            fecha:           new Date(Date.now() - (i + 1) * 7 * 24 * 3600 * 1000).toISOString()
        });
        semilla.push({
            id: `seg-semilla-${est.id}-2`,
            estudianteId:    est.id,
            docenteId:       docente.id,
            asignatura:      asignaturas[(i + 1) % asignaturas.length],
            periodo:         periodoActivo,
            nota:            (8 + i) % 11,
            asistencia:      75 + (i * 3) % 25,
            observaciones:   'Asistencia irregular durante las últimas semanas.',
            estadoAcademico: 'Regular',
            comentarios:     '',
            creadoPor:       ROLES.DOCENTE,
            fecha:           new Date(Date.now() - (i + 3) * 5 * 24 * 3600 * 1000).toISOString()
        });
    });
    return semilla;
}

/* ===================== CRUD APOYOS (Bienestar) ===================== */

/**
 * Tipos válidos de apoyo: 'Académico' | 'Psicológico' | 'Tecnológico' | 'Físico' | 'Social'
 * Campos: estudianteId, tipo, descripcion, responsable, fechaInicio, fechaFin, estado, creadoPor
 */
function crearApoyo(datos) {
    const lista = obtenerApoyos();
    const nuevo = {
        id:           generarId(),
        estudianteId: datos.estudianteId,
        tipo:         datos.tipo         || 'Académico',
        descripcion:  datos.descripcion  || '',
        responsable:  datos.responsable  || '',
        fechaInicio:  datos.fechaInicio  || new Date().toISOString().split('T')[0],
        fechaFin:     datos.fechaFin     || '',
        estado:       datos.estado       || 'Activo',
        creadoPor:    datos.creadoPor    || ROLES.BIENESTAR,
        fecha:        new Date().toISOString()
    };
    lista.push(nuevo);
    guardarApoyos(lista);
    return { exito: true, mensaje: 'Apoyo registrado correctamente.', apoyo: nuevo };
}

function actualizarApoyo(id, datos) {
    const lista = obtenerApoyos();
    const idx   = lista.findIndex(a => a.id === id);
    if (idx === -1) return { exito: false, mensaje: 'Apoyo no encontrado.' };
    lista[idx] = { ...lista[idx], ...datos, id };
    guardarApoyos(lista);
    return { exito: true, mensaje: 'Apoyo actualizado correctamente.', apoyo: lista[idx] };
}

function eliminarApoyo(id) {
    guardarApoyos(obtenerApoyos().filter(a => a.id !== id));
    return { exito: true, mensaje: 'Apoyo eliminado correctamente.' };
}

function obtenerApoyosPorEstudiante(estudianteId) {
    return obtenerApoyos()
        .filter(a => a.estudianteId === estudianteId)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

/* ===================== CRUD ADAPTACIONES (Bienestar → Docentes leen) ===================== */

/**
 * Campos: estudianteId, tipo, descripcion, vigencia, observaciones, creadoPor
 * Tipos: 'Tiempo extra' | 'Material adaptado' | 'Evaluación oral' | 'Intérprete' | 'Recursos tecnológicos' | 'Otro'
 */
function crearAdaptacion(datos) {
    const lista = obtenerAdaptaciones();
    const nueva = {
        id:           generarId(),
        estudianteId: datos.estudianteId,
        tipo:         datos.tipo         || 'Tiempo extra',
        descripcion:  datos.descripcion  || '',
        vigencia:     datos.vigencia     || '',
        observaciones:datos.observaciones|| '',
        creadoPor:    datos.creadoPor    || ROLES.BIENESTAR,
        fecha:        new Date().toISOString()
    };
    lista.push(nueva);
    guardarAdaptaciones(lista);
    return { exito: true, mensaje: 'Adaptación registrada correctamente.', adaptacion: nueva };
}

function actualizarAdaptacion(id, datos) {
    const lista = obtenerAdaptaciones();
    const idx   = lista.findIndex(a => a.id === id);
    if (idx === -1) return { exito: false, mensaje: 'Adaptación no encontrada.' };
    lista[idx] = { ...lista[idx], ...datos, id };
    guardarAdaptaciones(lista);
    return { exito: true, mensaje: 'Adaptación actualizada correctamente.', adaptacion: lista[idx] };
}

function eliminarAdaptacion(id) {
    guardarAdaptaciones(obtenerAdaptaciones().filter(a => a.id !== id));
    return { exito: true, mensaje: 'Adaptación eliminada correctamente.' };
}

function obtenerAdaptacionesPorEstudiante(estudianteId) {
    return obtenerAdaptaciones()
        .filter(a => a.estudianteId === estudianteId)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

/* ===================== OBSERVACIONES SOCIALES / PSICOLÓGICAS ===================== */

/** Clave de localStorage para observaciones de bienestar */
const STORAGE_KEYS_OBS = 'uleam_observaciones';

function obtenerObservaciones() {
    return leerStorage(STORAGE_KEYS_OBS, []);
}

function guardarObservaciones(lista) {
    guardarStorage(STORAGE_KEYS_OBS, lista);
}

/**
 * Campos: estudianteId, tipo ('Social'|'Psicológica'|'Académica'|'Familiar'),
 *         contenido, nivelRiesgo ('Bajo'|'Medio'|'Alto'), creadoPor, fecha
 */
function crearObservacion(datos) {
    const lista = obtenerObservaciones();
    const nueva = {
        id:           generarId(),
        estudianteId: datos.estudianteId,
        tipo:         datos.tipo      || 'Social',
        contenido:    datos.contenido || '',
        nivelRiesgo:  datos.nivelRiesgo || 'Bajo',
        creadoPor:    datos.creadoPor || ROLES.BIENESTAR,
        fecha:        new Date().toISOString()
    };
    lista.push(nueva);
    guardarObservaciones(lista);
    return { exito: true, mensaje: 'Observación registrada.', observacion: nueva };
}

function eliminarObservacion(id) {
    guardarObservaciones(obtenerObservaciones().filter(o => o.id !== id));
    return { exito: true, mensaje: 'Observación eliminada.' };
}

function actualizarObservacion(id, datos) {
    const lista = obtenerObservaciones();
    const idx = lista.findIndex(o => o.id === id);
    if (idx === -1) return { exito: false, mensaje: 'Observación no encontrada.' };
    lista[idx] = { ...lista[idx], ...datos, id };
    guardarObservaciones(lista);
    return { exito: true, mensaje: 'Observación actualizada.', observacion: lista[idx] };
}

function obtenerObservacionesPorEstudiante(estudianteId) {
    return obtenerObservaciones()
        .filter(o => o.estudianteId === estudianteId)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

/**
 * Actualiza estado y nivelRiesgo del estudiante y agrega recomendaciones.
 */
function actualizarEstadoEstudiante(id, estado, nivelRiesgo, recomendaciones) {
    const estudiantes = obtenerEstudiantes();
    const idx = estudiantes.findIndex(e => e.id === id);
    if (idx === -1) return { exito: false, mensaje: 'Estudiante no encontrado.' };
    if (estado)          estudiantes[idx].estado          = estado;
    if (nivelRiesgo)     estudiantes[idx].nivelRiesgo     = nivelRiesgo;
    if (recomendaciones !== undefined) estudiantes[idx].recomendaciones = recomendaciones;
    guardarEstudiantes(estudiantes);
    return { exito: true, mensaje: 'Estado del estudiante actualizado.' };
}

/* ===================== SEMILLAS BIENESTAR ===================== */

function generarSemillasBienestar() {
    const estudiantes = obtenerEstudiantes();
    if (!estudiantes.length) return;

    // Apoyos semilla
    if (!obtenerApoyos().length) {
        const tiposApoyo = ['Académico', 'Psicológico', 'Tecnológico'];
        const apoyosSemilla = estudiantes.map((est, i) => ({
            id:           `apo-semilla-${est.id}`,
            estudianteId: est.id,
            tipo:         tiposApoyo[i % tiposApoyo.length],
            descripcion:  'Apoyo inicial asignado al inicio del ciclo académico.',
            responsable:  'Bienestar Estudiantil',
            fechaInicio:  '2026-03-01',
            fechaFin:     '2026-07-31',
            estado:       'Activo',
            creadoPor:    ROLES.BIENESTAR,
            fecha:        new Date(Date.now() - (i + 2) * 10 * 24 * 3600 * 1000).toISOString()
        }));
        guardarApoyos(apoyosSemilla);
    }

    // Adaptaciones semilla
    if (!obtenerAdaptaciones().length) {
        const tiposAdapt = ['Tiempo extra', 'Material adaptado', 'Recursos tecnológicos'];
        const adaptSemilla = estudiantes.map((est, i) => ({
            id:           `ada-semilla-${est.id}`,
            estudianteId: est.id,
            tipo:         tiposAdapt[i % tiposAdapt.length],
            descripcion:  'Se requiere adaptación en las evaluaciones parciales y finales.',
            vigencia:     '2026-07-31',
            observaciones:'Coordinado con el docente titular.',
            creadoPor:    ROLES.BIENESTAR,
            fecha:        new Date(Date.now() - (i + 1) * 8 * 24 * 3600 * 1000).toISOString()
        }));
        guardarAdaptaciones(adaptSemilla);
    }

    // Observaciones semilla
    if (!obtenerObservaciones().length) {
        const tiposObs = ['Psicológica', 'Social', 'Familiar'];
        const obsSemilla = estudiantes.map((est, i) => ({
            id:           `obs-semilla-${est.id}`,
            estudianteId: est.id,
            tipo:         tiposObs[i % tiposObs.length],
            contenido:    'Estudiante muestra avances en su proceso de adaptación académica. Se recomienda seguimiento mensual.',
            nivelRiesgo:  i === 1 ? 'Medio' : 'Bajo',
            creadoPor:    ROLES.BIENESTAR,
            fecha:        new Date(Date.now() - (i + 2) * 6 * 24 * 3600 * 1000).toISOString()
        }));
        guardarObservaciones(obsSemilla);
    }
}

/**
 * storage.js — fin de la sección de semillas
 * Garantiza que haya datos de prueba suficientes para todos los módulos.
 */

// Semillas de seguimientos académicos y bienestar
(function inicializarSemillasCompletas() {
    // Inicializar almacén principal
    inicializarStorage();

    // Seguimientos
    if (!leerStorage(STORAGE_KEYS.SEGUIMIENTO) || obtenerSeguimientos().length === 0) {
        const semilla = generarSeguimientosSemilla();
        if (semilla.length) guardarSeguimientos(semilla);
    }
    // Bienestar (apoyos, adaptaciones, observaciones)
    generarSemillasBienestar();
    // Asignar todos los estudiantes al docente semilla si no tiene asignados
    const usuarios = obtenerUsuarios();
    const docente = usuarios.find(u => u.rol === ROLES.DOCENTE);
    if (docente && (!docente.estudiantesAsignados || !docente.estudiantesAsignados.length)) {
        const idsEst = obtenerEstudiantes().map(e => e.id);
        if (idsEst.length) {
            docente.estudiantesAsignados = idsEst;
            guardarUsuarios(usuarios);
        }
    }
})();

/* ===================== CONFIG ===================== */

function obtenerConfig() {
    return leerStorage(STORAGE_KEYS.CONFIG, {});
}

function guardarConfig(config) {
    guardarStorage(STORAGE_KEYS.CONFIG, config);
}

/* ===================== CRUD REPORTES (Admin) ===================== */

function obtenerReportes() {
    return leerStorage(STORAGE_KEYS.REPORTES, []);
}

function guardarReportes(lista) {
    guardarStorage(STORAGE_KEYS.REPORTES, lista);
}

/**
 * Guarda un reporte generado en el historial de localStorage.
 * @param {object} datos - { tipo, nombre, descripcion, formato, generadoPor, columnas, filas }
 */
function crearReporte(datos) {
    const lista = obtenerReportes();
    const nuevo = {
        id:          generarId(),
        tipo:        datos.tipo        || 'General',
        nombre:      datos.nombre      || 'Reporte',
        descripcion: datos.descripcion || '',
        formato:     datos.formato     || 'CSV',
        generadoPor: datos.generadoPor || 'Administrador',
        columnas:    datos.columnas    || [],
        filas:       datos.filas       || [],
        fecha:       new Date().toISOString(),
        estado:      'Listo'
    };
    lista.unshift(nuevo);  // más reciente primero
    guardarReportes(lista);
    return { exito: true, mensaje: 'Reporte generado correctamente.', reporte: nuevo };
}

function eliminarReporte(id) {
    guardarReportes(obtenerReportes().filter(r => r.id !== id));
    return { exito: true, mensaje: 'Reporte eliminado correctamente.' };
}

export {
    STORAGE_KEYS,
    ROLES,
    leerStorage,
    guardarStorage,
    generarId,
    inicializarStorage,
    obtenerSesion,
    guardarSesion,
    cerrarSesion,
    estaAutenticado,
    obtenerRutaDashboard,
    protegerPagina,
    obtenerUsuarios,
    guardarUsuarios,
    autenticarUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    toggleActivoUsuario,
    obtenerEstadisticasUsuarios,
    obtenerEstudiantes,
    guardarEstudiantes,
    obtenerEstudiantePorId,
    obtenerEstudiantePorCedula,
    crearEstudiante,
    actualizarEstudiante,
    eliminarEstudiante,
    obtenerEstadisticasEstudiantes,
    contarPorDiscapacidad,
    obtenerUltimosEstudiantes,
    obtenerFechaUltimoSeguimiento,
    obtenerSeguimientos,
    guardarSeguimientos,
    obtenerApoyos,
    guardarApoyos,
    obtenerAdaptaciones,
    guardarAdaptaciones,
    crearSeguimiento,
    actualizarSeguimiento,
    eliminarSeguimiento,
    obtenerSeguimientosPorEstudiante,
    obtenerSeguimientosPorDocente,
    crearApoyo,
    actualizarApoyo,
    eliminarApoyo,
    obtenerApoyosPorEstudiante,
    crearAdaptacion,
    actualizarAdaptacion,
    eliminarAdaptacion,
    obtenerAdaptacionesPorEstudiante,
    obtenerObservaciones,
    guardarObservaciones,
    crearObservacion,
    actualizarObservacion,
    eliminarObservacion,
    obtenerObservacionesPorEstudiante,
    actualizarEstadoEstudiante,
    obtenerConfig,
    guardarConfig,
    obtenerReportes,
    guardarReportes,
    crearReporte,
    eliminarReporte
};
