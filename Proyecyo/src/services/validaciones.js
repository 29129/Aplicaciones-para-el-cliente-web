const Validaciones = {
    requerido(valor) {
        return valor !== null && valor !== undefined && String(valor).trim() !== '';
    },

    correo(correo) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(correo).trim());
    },

    correoInstitucional(correo) {
        return this.correo(correo) && correo.toLowerCase().endsWith('@uleam.edu.ec');
    },

    cedula(cedula) {
        return /^\d{10}$/.test(String(cedula).trim());
    },

    telefono(telefono) {
        if (!telefono || String(telefono).trim() === '') return true;
        return /^0\d{9}$/.test(String(telefono).trim());
    },

    contrasena(contrasena, minimo = 6) {
        return String(contrasena).length >= minimo;
    },

    rango(valor, min, max) {
        const num = Number(valor);
        return !Number.isNaN(num) && num >= min && num <= max;
    },

    soloLetras(texto) {
        return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(String(texto).trim());
    },

    mayorDeEdad(fecha, edadMinima = 16) {
        if (!fecha) return false;
        const nacimiento = new Date(fecha);
        const hoy = new Date();
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
        return edad >= edadMinima;
    }
};

function validarLogin(correo, contrasena) {
    const errores = {};

    if (!Validaciones.requerido(correo)) {
        errores.correo = 'El correo institucional es obligatorio.';
    } else if (!Validaciones.correoInstitucional(correo)) {
        errores.correo = 'Ingrese un correo válido con dominio @uleam.edu.ec';
    }

    if (!Validaciones.requerido(contrasena)) {
        errores.contrasena = 'La contraseña es obligatoria.';
    } else if (!Validaciones.contrasena(contrasena)) {
        errores.contrasena = 'La contraseña debe tener al menos 6 caracteres.';
    }

    return { valido: Object.keys(errores).length === 0, errores };
}

export {
    Validaciones,
    validarLogin
};
