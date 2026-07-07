document.addEventListener('DOMContentLoaded', function () {

    /* ---------------------------------------------------------
       0) Auth state — starts as GUEST (no account) by default.
          This is a front-end mock only: no real backend/auth,
          state simply lives in memory for this page session.
    --------------------------------------------------------- */
    let currentUser = null; // null = guest

    const guestBadgeWrap = document.getElementById('guestBadgeWrap');
    const navAuthGuest    = document.getElementById('navAuthGuest');
    const navAuthUser     = document.getElementById('navAuthUser');
    const navUserInitials = document.getElementById('navUserInitials');
    const navUserName     = document.getElementById('navUserName');

    const sidebarProfileGuest  = document.getElementById('sidebarProfileGuest');
    const sidebarProfileUser   = document.getElementById('sidebarProfileUser');
    const sidebarUserInitials  = document.getElementById('sidebarUserInitials');
    const sidebarUserName      = document.getElementById('sidebarUserName');

    const loginModalEl  = document.getElementById('loginModal');
    const signupModalEl = document.getElementById('signupModal');
    const loginModal    = loginModalEl ? bootstrap.Modal.getOrCreateInstance(loginModalEl) : null;
    const signupModal   = signupModalEl ? bootstrap.Modal.getOrCreateInstance(signupModalEl) : null;

    function getInitials(name) {
        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join('');
    }

    function updateAuthUI() {
        const loggedIn = !!currentUser;

        if (guestBadgeWrap) guestBadgeWrap.classList.toggle('d-none', loggedIn);
        if (navAuthGuest)   navAuthGuest.classList.toggle('d-none', loggedIn);
        if (navAuthUser)    navAuthUser.classList.toggle('d-none', !loggedIn);

        if (sidebarProfileGuest) sidebarProfileGuest.classList.toggle('d-none', loggedIn);
        if (sidebarProfileUser)  sidebarProfileUser.classList.toggle('d-none', !loggedIn);

        if (loggedIn) {
            const initials = getInitials(currentUser.name);
            if (navUserInitials) navUserInitials.textContent = initials;
            if (navUserName)     navUserName.textContent = currentUser.name.split(' ')[0];
            if (sidebarUserInitials) sidebarUserInitials.textContent = initials;
            if (sidebarUserName)     sidebarUserName.textContent = currentUser.name;
        }
    }

    function loginUser(name) {
        currentUser = { name: name || 'Pengguna' };
        updateAuthUI();
    }

    function logoutUser() {
        currentUser = null;
        updateAuthUI();
    }

    // Login form (mock: any valid email/password "logs in")
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const namePart = email.split('@')[0].replace(/[._]/g, ' ') || 'Pengguna';
            loginUser(namePart.replace(/\b\w/g, (c) => c.toUpperCase()));
            loginForm.reset();
            if (loginModal) loginModal.hide();
        });
    }

    // Signup form (mock)
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('signupName').value.trim();
            loginUser(name);
            signupForm.reset();
            if (signupModal) signupModal.hide();
        });
    }

    // Switch between login <-> signup modals
    const goToSignup = document.getElementById('goToSignup');
    if (goToSignup && loginModal && signupModal) {
        goToSignup.addEventListener('click', function (e) {
            e.preventDefault();
            loginModal.hide();
            signupModal.show();
        });
    }

    const goToLogin = document.getElementById('goToLogin');
    if (goToLogin && loginModal && signupModal) {
        goToLogin.addEventListener('click', function (e) {
            e.preventDefault();
            signupModal.hide();
            loginModal.show();
        });
    }

    // Logout (navbar dropdown + sidebar)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);

    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
    if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', logoutUser);

    // Gate booking actions behind login — guests get prompted to sign in first
    document.querySelectorAll('.js-require-auth').forEach((el) => {
        el.addEventListener('click', function (e) {
            if (!currentUser) {
                e.preventDefault();
                if (loginModal) loginModal.show();
                return;
            }
            if (this.dataset.authAction === 'confirm') {
                e.preventDefault();
                window.alert('Terima kasih, ' + currentUser.name + '! Tim kami akan menghubungi kamu lewat WhatsApp untuk konfirmasi jadwal booking.');
            }
            // otherwise let the anchor scroll normally
        });
    });

    updateAuthUI(); // initialize as guest

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
