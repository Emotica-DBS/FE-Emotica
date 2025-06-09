/**
 * main.js
 * File ini adalah titik masuk utama untuk semua skrip JavaScript.
 */

// Menjalankan semua fungsi inisialisasi setelah DOM (halaman) selesai dimuat.
document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi komponen yang ada di semua halaman
    initializeMobileMenu();
    initializeThemeToggle();
    initializeNavLinks(); // <-- FUNGSI DIPERBARUI untuk menangani scroll & halaman aktif
    initializeProfileDropdown(); 
    
    // Logika untuk memuat skrip spesifik per halaman (jika ada)
    const page = document.body.dataset.page;
    if (page === 'dashboard') {
        import('./dashboard.js');
    } else if (page === 'history') {
        import('./history.js');
    } else if (page === 'login') {
        import('./login.js');
    } else if (page === 'register') {
        import('./register.js');
    }
});

/**
 * Menginisialisasi fungsionalitas untuk menu mobile (hamburger menu).
 */
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (!mobileMenuBtn || !mobileMenu) return;

    mobileMenuBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        mobileMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenu.classList.add('hidden');
        }
    });
}

/**
 * Menginisialisasi fungsionalitas untuk tombol ganti tema (light/dark mode).
 */
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');

    if (!themeToggle || !sunIcon || !moonIcon) return;

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
    };

    const switchTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', currentTheme);
        applyTheme(currentTheme);
    };

    themeToggle.addEventListener('click', switchTheme);

    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);
}

/**
 * [DISSEMPURNAKAN] Menginisialisasi tautan navigasi.
 * Menangani halaman aktif dan juga menyorot tautan berdasarkan bagian (section) yang terlihat saat scrolling.
 */
function initializeNavLinks() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main section[id]');

    // Tandai halaman aktif saat pertama kali dimuat
    const currentPage = document.body.dataset.page;
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('.')[0];
        link.classList.toggle('active', linkPage === currentPage || (currentPage === 'home' && (linkPage === 'index' || linkPage === '')));
    });

    // Hanya jalankan IntersectionObserver jika ada sections (di halaman utama)
    if (sections.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}` || (id === 'home' && link.getAttribute('href') === 'index.html')) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { rootMargin: "-50% 0px -50% 0px", threshold: 0.1 });

    sections.forEach(section => {
        observer.observe(section);
    });
}


/**
 * Menginisialisasi dropdown untuk menu profil dan logout.
 */
function initializeProfileDropdown() {
    const profileBtn = document.getElementById('profile-btn');
    const logoutDropdown = document.getElementById('logout-dropdown');
    const logoutBtn = document.getElementById('logout-btn');

    if (profileBtn && logoutDropdown) {
        profileBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            logoutDropdown.classList.toggle('hidden');
        });
    }

    if(logoutBtn){
        logoutBtn.addEventListener('click', () => {
            // NOTE: Di sini Anda akan memanggil fungsi logout dari auth.js
            // import('./auth.js').then(auth => auth.handleLogout());
            console.log("Logout diklik!");
            localStorage.clear(); // Contoh sederhana
            window.location.href = 'login.html';
        });
    }

    document.addEventListener('click', (e) => {
        if (logoutDropdown && profileBtn && !profileBtn.contains(e.target) && !logoutDropdown.contains(e.target)) {
            logoutDropdown.classList.add('hidden');
        }
    });
}
