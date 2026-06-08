document.addEventListener('DOMContentLoaded', function() {
    const tabs = Array.from(document.querySelectorAll('.step-tab'));
    const sections = Array.from(document.querySelectorAll('.form-card'));
    const previousButton = document.getElementById('previous-step');
    const nextButton = document.getElementById('next-step');
    const form = document.getElementById('student-register-form');
    let currentStep = 0;

    function showStep(index) {
        currentStep = Math.max(0, Math.min(index, tabs.length - 1));

        tabs.forEach((tab, tabIndex) => {
            tab.classList.toggle('active', tabIndex === currentStep);
        });

        sections.forEach((section, sectionIndex) => {
            section.hidden = sectionIndex !== currentStep;
        });

        previousButton.disabled = currentStep === 0;
        nextButton.innerHTML = currentStep === tabs.length - 1
            ? 'Finalizar <i class="fas fa-check"></i>'
            : 'Siguiente <i class="fas fa-chevron-right"></i>';
    }

    function getFieldLabel(field) {
        return field.closest('.form-field');
    }

    function clearFieldError(field) {
        const fieldLabel = getFieldLabel(field);

        if (!fieldLabel) {
            return;
        }

        fieldLabel.classList.remove('is-invalid');
        const error = fieldLabel.querySelector('.form-error');

        if (error) {
            error.remove();
        }
    }

    function showFieldError(field, message) {
        const fieldLabel = getFieldLabel(field);

        if (!fieldLabel) {
            return;
        }

        clearFieldError(field);
        fieldLabel.classList.add('is-invalid');

        const error = document.createElement('small');
        error.className = 'form-error';
        error.textContent = message;
        fieldLabel.appendChild(error);
    }

    function isEmpty(field) {
        return field.value.trim() === '';
    }

    function onlyDigits(value) {
        return value.replace(/\D/g, '');
    }

    function validateField(field) {
        clearFieldError(field);

        if (field.hasAttribute('required') && isEmpty(field)) {
            showFieldError(field, 'Este campo es obligatorio.');
            return false;
        }

        if (isEmpty(field)) {
            return true;
        }

        const value = field.value.trim();
        const name = field.name;

        if (name === 'cedula' && !/^\d{10}$/.test(value)) {
            showFieldError(field, 'La cedula debe tener exactamente 10 digitos.');
            return false;
        }

        if ((name === 'telefono' || name === 'telefono_emergencia') && !/^\d{7,10}$/.test(onlyDigits(value))) {
            showFieldError(field, 'Ingrese un telefono valido de 7 a 10 digitos.');
            return false;
        }

        if (name === 'correo_institucional' && !/^[^\s@]+@uleam\.edu\.ec$/i.test(value)) {
            showFieldError(field, 'Use un correo institucional terminado en @uleam.edu.ec.');
            return false;
        }

        if (name === 'correo_personal' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            showFieldError(field, 'Ingrese un correo personal valido.');
            return false;
        }

        if ((name === 'fecha_nacimiento' || name === 'fecha_ingreso') && new Date(value) > new Date()) {
            showFieldError(field, 'La fecha no puede ser futura.');
            return false;
        }

        if (name === 'grado_discapacidad') {
            const percentage = Number(value);

            if (Number.isNaN(percentage) || percentage < 0 || percentage > 100) {
                showFieldError(field, 'El porcentaje debe estar entre 0 y 100.');
                return false;
            }
        }

        return true;
    }

    function validateCertificateFields(section) {
        const certificateSelect = section.querySelector('[name="certificado"]');

        if (!certificateSelect) {
            return true;
        }

        const institutionField = section.querySelector('[name="institucion_certifica"]');
        const certificateNumberField = section.querySelector('[name="numero_certificado"]');

        if (certificateSelect.selectedIndex !== 1) {
            if (institutionField) {
                clearFieldError(institutionField);
            }

            if (certificateNumberField) {
                clearFieldError(certificateNumberField);
            }

            return true;
        }

        let isValid = true;

        if (institutionField && isEmpty(institutionField)) {
            showFieldError(institutionField, 'Ingrese la institucion que certifica.');
            isValid = false;
        }

        if (certificateNumberField && isEmpty(certificateNumberField)) {
            showFieldError(certificateNumberField, 'Ingrese el numero de certificado.');
            isValid = false;
        }

        return isValid;
    }

    function validateSection(index) {
        const section = sections[index];
        const fields = Array.from(section.querySelectorAll('input, select, textarea'));
        let isValid = true;

        fields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        if (!validateCertificateFields(section)) {
            isValid = false;
        }

        return isValid;
    }

    function validateAllSections() {
        let firstInvalidStep = -1;

        sections.forEach((section, index) => {
            if (!validateSection(index) && firstInvalidStep === -1) {
                firstInvalidStep = index;
            }
        });

        if (firstInvalidStep !== -1) {
            showStep(firstInvalidStep);
            const firstInvalidField = sections[firstInvalidStep].querySelector('.is-invalid input, .is-invalid select, .is-invalid textarea');

            if (firstInvalidField) {
                firstInvalidField.focus();
            }

            return false;
        }

        return true;
    }

    function canMoveToStep(targetStep) {
        if (targetStep <= currentStep) {
            return true;
        }

        for (let index = currentStep; index < targetStep; index += 1) {
            if (!validateSection(index)) {
                showStep(index);
                const firstInvalidField = sections[index].querySelector('.is-invalid input, .is-invalid select, .is-invalid textarea');

                if (firstInvalidField) {
                    firstInvalidField.focus();
                }

                return false;
            }
        }

        return true;
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', function() {
            if (canMoveToStep(index)) {
                showStep(index);
            }
        });
    });

    previousButton.addEventListener('click', function() {
        showStep(currentStep - 1);
    });

    nextButton.addEventListener('click', function() {
        if (!validateSection(currentStep)) {
            const firstInvalidField = sections[currentStep].querySelector('.is-invalid input, .is-invalid select, .is-invalid textarea');

            if (firstInvalidField) {
                firstInvalidField.focus();
            }

            return;
        }

        if (currentStep === tabs.length - 1) {
            form.requestSubmit();
            return;
        }

        showStep(currentStep + 1);
    });

    form.addEventListener('input', function(event) {
        if (event.target.matches('input, textarea')) {
            validateField(event.target);
        }
    });

    form.addEventListener('change', function(event) {
        if (event.target.matches('select, input')) {
            validateField(event.target);

            if (event.target.name === 'certificado') {
                validateCertificateFields(event.target.closest('.form-card'));
            }
        }
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        if (!validateAllSections()) {
            return;
        }

        alert('Registro guardado correctamente. Luego se puede conectar con almacenamiento o backend.');
    });

    showStep(0);
});
