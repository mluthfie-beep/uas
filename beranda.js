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

});