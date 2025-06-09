/**
 * main.js
 * File ini adalah titik masuk utama untuk semua skrip JavaScript.
 * Ia akan menginisialisasi komponen UI yang ada di semua halaman
 * dan memuat skrip spesifik untuk halaman tertentu secara dinamis.
 */

// Menjalankan semua fungsi inisialisasi setelah DOM (halaman) selesai dimuat.
document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi komponen UI umum yang ada di semua halaman
    initializeMobileMenu();
    initializeThemeToggle();
    initializeNavLinks(); 
    initializeProfileDropdown(); 
    
    // Memuat skrip spesifik berdasarkan halaman yang sedang dibuka
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
 * Mengatur buka/tutup menu saat tombol diklik atau saat pengguna mengklik di luar area menu.
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
        if (mobileMenu && !mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenu.classList.add('hidden');
        }
    });
}

/**
 * [PERBAIKAN UTAMA 1] Menginisialisasi SEMUA tombol ganti tema.
 * Fungsi ini diperbaiki untuk mencari tombol berdasarkan kelas (`.theme-toggle-btn`),
 * sehingga dapat berfungsi baik di navigasi desktop maupun mobile.
 */
function initializeThemeToggle() {
    const themeToggles = document.querySelectorAll('.theme-toggle-btn');
    const sunIcons = document.querySelectorAll('.sun-icon');
    const moonIcons = document.querySelectorAll('.moon-icon');

    if (themeToggles.length === 0) return;

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        sunIcons.forEach(icon => icon.classList.toggle('hidden', theme === 'dark'));
        moonIcons.forEach(icon => icon.classList.toggle('hidden', theme === 'light'));
    };

    const switchTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', currentTheme);
        applyTheme(currentTheme);
    };

    themeToggles.forEach(button => button.addEventListener('click', switchTheme));

    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);
}

/**
 * [PERBAIKAN UTAMA 2] Menginisialisasi tautan navigasi secara cerdas.
 * Fungsi ini sekarang bisa menangani dua kasus:
 * 1. Menandai halaman aktif (misal: about.html).
 * 2. Menggunakan 'scroll-spy' untuk menandai bagian aktif saat pengguna scroll di halaman utama.
 */
function initializeNavLinks() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main section[id]');
    const currentPage = document.body.dataset.page;

    const activateLink = (targetId) => {
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            const cleanHref = linkHref.startsWith('#') ? linkHref.substring(1) : linkHref.split('.')[0];
            
            // Logika untuk halaman statis
            if (sections.length === 0) {
                 link.classList.toggle('active', cleanHref === currentPage);
            }
            // Logika untuk scroll-spy di halaman utama
            else {
                link.classList.toggle('active', cleanHref === targetId);
            }
        });
    };
    
    // Penanganan untuk halaman statis (bukan index.html)
    if (sections.length === 0) {
        activateLink(currentPage);
        return; 
    }

    // Penanganan untuk scroll-spy di halaman utama (index.html)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                activateLink(entry.target.getAttribute('id'));
            }
        });
    }, { rootMargin: "-40% 0px -60% 0px" }); // Memicu saat section berada di tengah layar

    sections.forEach(section => observer.observe(section));
}


/**
 * Menginisialisasi dropdown untuk menu profil dan tombol logout.
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
            console.log("Logout diklik!");
            // import('./auth.js').then(auth => auth.handleLogout());
            localStorage.clear(); 
            window.location.href = 'login.html';
        });
    }

    document.addEventListener('click', (e) => {
        if (logoutDropdown && profileBtn && !profileBtn.contains(e.target) && !logoutDropdown.contains(e.target)) {
            logoutDropdown.classList.add('hidden');
        }
    });
}
