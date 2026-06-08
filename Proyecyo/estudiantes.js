document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('student-search');
    const careerFilter = document.getElementById('career-filter');
    const disabilityFilter = document.getElementById('disability-filter');
    const statusFilter = document.getElementById('status-filter');
    const clearFilters = document.getElementById('clear-filters');
    const resultsCount = document.getElementById('results-count');
    const emptyState = document.getElementById('empty-state');
    const rows = Array.from(document.querySelectorAll('#students-table-body tr'));

    function normalize(value) {
        return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function filterStudents() {
        const search = normalize(searchInput.value.trim());
        const career = careerFilter.value;
        const disability = disabilityFilter.value;
        const status = statusFilter.value;
        let visibleCount = 0;

        rows.forEach(row => {
            const searchableText = normalize([
                row.dataset.name,
                row.dataset.id,
                row.dataset.email
            ].join(' '));
            const matchesSearch = !search || searchableText.includes(search);
            const matchesCareer = !career || row.dataset.career === career;
            const matchesDisability = !disability || row.dataset.disability === disability;
            const matchesStatus = !status || row.dataset.status === status;
            const isVisible = matchesSearch && matchesCareer && matchesDisability && matchesStatus;

            row.hidden = !isVisible;

            if (isVisible) {
                visibleCount += 1;
            }
        });

        resultsCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'registro' : 'registros'}`;
        emptyState.hidden = visibleCount !== 0;
    }

    [searchInput, careerFilter, disabilityFilter, statusFilter].forEach(control => {
        control.addEventListener('input', filterStudents);
        control.addEventListener('change', filterStudents);
    });

    clearFilters.addEventListener('click', function() {
        searchInput.value = '';
        careerFilter.value = '';
        disabilityFilter.value = '';
        statusFilter.value = '';
        filterStudents();
        searchInput.focus();
    });

    document.querySelectorAll('.action-btn.follow').forEach(button => {
        button.addEventListener('click', function() {
            const studentName = this.closest('tr').dataset.name;
            alert(`Registrar seguimiento para: ${studentName}`);
        });
    });

    filterStudents();
});
