document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('user-search');
    const roleFilter = document.getElementById('role-filter');
    const statusFilter = document.getElementById('user-status-filter');
    const clearButton = document.getElementById('clear-user-filters');
    const resultsCount = document.getElementById('user-results-count');
    const emptyState = document.getElementById('users-empty-state');
    const rows = Array.from(document.querySelectorAll('#users-table-body tr'));
    const inviteButton = document.getElementById('invite-user');

    function normalize(value) {
        return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function filterUsers() {
        const search = normalize(searchInput.value.trim());
        const role = roleFilter.value;
        const status = statusFilter.value;
        let visibleCount = 0;

        rows.forEach(row => {
            const searchableText = normalize([
                row.dataset.name,
                row.dataset.email,
                row.dataset.area
            ].join(' '));
            const matchesSearch = !search || searchableText.includes(search);
            const matchesRole = !role || row.dataset.role === role;
            const matchesStatus = !status || row.dataset.status === status;
            const isVisible = matchesSearch && matchesRole && matchesStatus;

            row.hidden = !isVisible;

            if (isVisible) {
                visibleCount += 1;
            }
        });

        resultsCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'usuario' : 'usuarios'}`;
        emptyState.hidden = visibleCount !== 0;
    }

    [searchInput, roleFilter, statusFilter].forEach(control => {
        control.addEventListener('input', filterUsers);
        control.addEventListener('change', filterUsers);
    });

    clearButton.addEventListener('click', function() {
        searchInput.value = '';
        roleFilter.value = '';
        statusFilter.value = '';
        filterUsers();
        searchInput.focus();
    });

    inviteButton.addEventListener('click', function() {
        alert('Aqui se abrira el formulario para crear o invitar un usuario.');
    });

    document.querySelectorAll('.action-btn.toggle-user').forEach(button => {
        button.addEventListener('click', function() {
            const userName = this.closest('tr').dataset.name;
            alert(`Cambiar estado de usuario: ${userName}`);
        });
    });

    filterUsers();
});
