// admin.js - JavaScript compartido para las pantallas administrativas

document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }

    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768 && sidebar && sidebarToggle) {
            if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
                sidebar.classList.remove('show');
            }
        }
    });

    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            alert('Funcionalidad de notificaciones próximamente');
        });
    }

    const actionButtons = document.querySelectorAll('.action-btn:not(.follow):not(.download):not(.toggle-user)');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.classList.contains('view')
                ? 'Ver'
                : this.classList.contains('delete')
                    ? 'Eliminar'
                    : 'Editar';
            const row = this.closest('tr');
            const studentName = row?.dataset.name || row?.querySelector('td:nth-child(2)')?.textContent.trim() || row?.querySelector('td:first-child')?.textContent.trim() || 'estudiante';
            alert(`${action} estudiante: ${studentName}`);
        });
    });

    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const href = this.getAttribute('href');

            if (href && href !== '#') {
                return;
            }

            event.preventDefault();
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
        });
    });

    function handleResize() {
        if (window.innerWidth > 768 && sidebar) {
            sidebar.classList.remove('show');
        }
    }

    window.addEventListener('resize', handleResize);
});
