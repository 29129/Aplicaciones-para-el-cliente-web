document.addEventListener('DOMContentLoaded', function() {
    const tabs = Array.from(document.querySelectorAll('.settings-tab'));
    const panels = Array.from(document.querySelectorAll('.settings-card'));
    const saveButton = document.getElementById('save-settings');

    function showSettingsPanel(targetId) {
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.settingsTarget === targetId);
        });

        panels.forEach(panel => {
            panel.hidden = panel.id !== targetId;
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            showSettingsPanel(this.dataset.settingsTarget);
        });
    });

    document.querySelectorAll('.catalog-action').forEach(button => {
        button.addEventListener('click', function() {
            const catalogName = this.closest('.catalog-card').querySelector('strong').textContent;
            alert(`Aqui se gestionara el catalogo: ${catalogName}`);
        });
    });

    saveButton.addEventListener('click', function() {
        alert('Configuracion guardada correctamente.');
    });
});
