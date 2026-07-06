/**
 * helpers.js
 * Funciones de utilidad compartidas para formateo, normalización y badges CSS.
 */

export function formatearFecha(fechaISO) {
    if (!fechaISO) return '—';
    const fecha = new Date(fechaISO);
    if (Number.isNaN(fecha.getTime())) return '—';
    return fecha.toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function obtenerIniciales(nombres, apellidos) {
    const n = (nombres || '').trim()[0] || '';
    const a = (apellidos || '').trim()[0] || '';
    return (n + a).toUpperCase() || '??';
}

export function nombreCompleto(estudiante) {
    if (!estudiante) return '';
    return `${estudiante.nombres} ${estudiante.apellidos}`.trim();
}

export function claseEstado(estado) {
    const mapa = {
        Activo: 'active',
        Inactivo: 'inactive',
        'En seguimiento': 'tracking'
    };
    return mapa[estado] || 'active';
}

export function claseDiscapacidad(tipo) {
    const mapa = {
        Motora: 'physical',
        Física: 'physical',
        Visual: 'visual',
        Auditiva: 'hearing',
        Intelectual: 'intellectual',
        Psicosocial: 'psychosocial'
    };
    return mapa[tipo] || 'physical';
}

export function etiquetaDiscapacidad(tipo) {
    const mapa = {
        Motora: 'Física',
        Física: 'Física',
        Visual: 'Visual',
        Auditiva: 'Auditiva',
        Intelectual: 'Intelectual',
        Psicosocial: 'Psicosocial'
    };
    return mapa[tipo] || tipo;
}

export function normalizarTexto(valor) {
    return String(valor || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

export function claseNivelRiesgo(nivel) {
    const mapa = {
        Alto: 'high',
        Medio: 'medium',
        Bajo: 'low'
    };
    return mapa[nivel] || 'low';
}

