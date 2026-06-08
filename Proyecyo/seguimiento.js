document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('tracking-search');
    const priorityFilter = document.getElementById('priority-filter');
    const statusFilter = document.getElementById('tracking-status-filter');
    const clearButton = document.getElementById('clear-tracking-filters');
    const resultsCount = document.getElementById('tracking-results-count');
    const emptyState = document.getElementById('tracking-empty-state');
    const rows = Array.from(document.querySelectorAll('#tracking-table-body tr'));
    const newFollowupButton = document.getElementById('new-followup');

    function normalize(value) {
        return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function filterTracking() {
        const search = normalize(searchInput.value.trim());
        const priority = priorityFilter.value;
        const status = statusFilter.value;
        let visibleCount = 0;

        rows.forEach(row => {
            const searchableText = normalize([
                row.dataset.name,
                row.dataset.career,
                row.dataset.manager
            ].join(' '));
            const matchesSearch = !search || searchableText.includes(search);
            const matchesPriority = !priority || row.dataset.priority === priority;
            const matchesStatus = !status || row.dataset.status === status;
            const isVisible = matchesSearch && matchesPriority && matchesStatus;

            row.hidden = !isVisible;

            if (isVisible) {
                visibleCount += 1;
            }
        });

        resultsCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'caso' : 'casos'}`;
        emptyState.hidden = visibleCount !== 0;
    }

    [searchInput, priorityFilter, statusFilter].forEach(control => {
        control.addEventListener('input', filterTracking);
        control.addEventListener('change', filterTracking);
    });

    clearButton.addEventListener('click', function() {
        searchInput.value = '';
        priorityFilter.value = '';
        statusFilter.value = '';
        filterTracking();
        searchInput.focus();
    });

    document.querySelectorAll('.action-btn.follow').forEach(button => {
        button.addEventListener('click', function() {
            const studentName = this.closest('tr').dataset.name;
            alert(`Registrar avance de seguimiento para: ${studentName}`);
        });
    });

    newFollowupButton.addEventListener('click', function() {
        alert('Aquí se abrirá el formulario para crear un nuevo seguimiento.');
    });

    filterTracking();
});
