document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('report-search');
    const typeFilter = document.getElementById('report-type-filter');
    const statusFilter = document.getElementById('report-status-filter');
    const clearButton = document.getElementById('clear-report-filters');
    const resultsCount = document.getElementById('report-results-count');
    const emptyState = document.getElementById('reports-empty-state');
    const rows = Array.from(document.querySelectorAll('#reports-table-body tr'));
    const generateButtons = document.querySelectorAll('#generate-report, .report-template-action');

    function normalize(value) {
        return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function filterReports() {
        const search = normalize(searchInput.value.trim());
        const type = typeFilter.value;
        const status = statusFilter.value;
        let visibleCount = 0;

        rows.forEach(row => {
            const searchableText = normalize([
                row.dataset.name,
                row.dataset.type,
                row.dataset.manager
            ].join(' '));
            const matchesSearch = !search || searchableText.includes(search);
            const matchesType = !type || row.dataset.type === type;
            const matchesStatus = !status || row.dataset.status === status;
            const isVisible = matchesSearch && matchesType && matchesStatus;

            row.hidden = !isVisible;

            if (isVisible) {
                visibleCount += 1;
            }
        });

        resultsCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'reporte' : 'reportes'}`;
        emptyState.hidden = visibleCount !== 0;
    }

    [searchInput, typeFilter, statusFilter].forEach(control => {
        control.addEventListener('input', filterReports);
        control.addEventListener('change', filterReports);
    });

    clearButton.addEventListener('click', function() {
        searchInput.value = '';
        typeFilter.value = '';
        statusFilter.value = '';
        filterReports();
        searchInput.focus();
    });

    generateButtons.forEach(button => {
        button.addEventListener('click', function() {
            alert('Aqui se generara el reporte seleccionado.');
        });
    });

    document.querySelectorAll('.action-btn.download').forEach(button => {
        button.addEventListener('click', function() {
            const reportName = this.closest('tr').dataset.name;
            alert(`Descargar reporte: ${reportName}`);
        });
    });

    filterReports();
});
