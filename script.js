document.addEventListener('DOMContentLoaded', function () {

    /* ---------------------------------------------------------
       1) Navbar shadow on scroll
    --------------------------------------------------------- */
    const navbar = document.getElementById('mainNavbar');
    if (navbar) {
        const toggleNavbarShadow = () => {
            if (window.scrollY > 10) {
                navbar.classList.add('shadow');
            } else {
                navbar.classList.remove('shadow');
            }
        };
        toggleNavbarShadow();
        window.addEventListener('scroll', toggleNavbarShadow);
    }

    /* ---------------------------------------------------------
       2) Auto-close the offcanvas sidebar after a link is clicked
    --------------------------------------------------------- */
    const sidebar = document.getElementById('sidebarMenu');
    if (sidebar && window.bootstrap) {
        const offcanvasInstance = bootstrap.Offcanvas.getOrCreateInstance(sidebar);
        sidebar.querySelectorAll('a[href]').forEach((link) => {
            link.addEventListener('click', () => {
                offcanvasInstance.hide();
            });
        });
    }

    /* ---------------------------------------------------------
       3) Animated stat counters (runs once, when scrolled into view)
    --------------------------------------------------------- */
    const counters = document.querySelectorAll('.stat-number[data-count]');

    const animateCounter = (el) => {
        const target = parseInt(el.getAttribute('data-count'), 10) || 0;
        const duration = 900; // ms
        const startTime = performance.now();

        const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const value = Math.floor(progress * target);
            el.textContent = value;
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target;
            }
        };
        requestAnimationFrame(step);
    };

    if (counters.length) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach((counter) => observer.observe(counter));
    }

    /* ---------------------------------------------------------
       4) Require login when guest clicks a "Pesan" / booking button
    --------------------------------------------------------- */
    // Ganti nilai ini menjadi true begitu sistem login sungguhan aktif,
    // atau sambungkan ke status sesi/token pengguna yang sebenarnya.
    const isLoggedIn = false;

    const authAlertEl = document.getElementById('authAlertModal');
    const authAlertModal = authAlertEl && window.bootstrap
        ? bootstrap.Modal.getOrCreateInstance(authAlertEl)
        : null;

    document.querySelectorAll('.js-require-auth').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            if (!isLoggedIn) {
                e.preventDefault();
                e.stopPropagation();

                if (authAlertModal) authAlertModal.show();
            }
            // Jika sudah login, biarkan tombol berjalan normal (scroll ke #booking, dll.)
        });
    });

    // Saat tombol OK di alert ditekan: arahkan ke halaman login.html
    const authAlertOkBtn = document.getElementById('authAlertOkBtn');
    if (authAlertOkBtn) {
        authAlertOkBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }

});

document.getElementById('sidebarLogoutBtn').addEventListener('click', function() {
    window.location.href = 'index.html'; // Ganti dengan halaman tujuan
});