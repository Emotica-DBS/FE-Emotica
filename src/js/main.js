/**
 * main.js
 * File ini adalah titik masuk utama untuk semua skrip JavaScript.
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
 */
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu') || document.getElementById('sidebar'); 
    
    if (!mobileMenuBtn || !mobileMenu) return;

    mobileMenuBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        if(mobileMenu.id === 'sidebar'){
            mobileMenu.classList.toggle('-translate-x-full');
        } else {
            mobileMenu.classList.toggle('hidden');
        }
    });

    document.addEventListener('click', (e) => {
        if (mobileMenu && !mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
             if(mobileMenu.id === 'sidebar'){
                mobileMenu.classList.add('-translate-x-full');
            } else {
                mobileMenu.classList.add('hidden');
            }
        }
    });
}

/**
 * Menginisialisasi SEMUA tombol ganti tema.
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
 * [DISSEMPURNAKAN] Menandai tautan navigasi yang aktif secara konsisten.
 * Fungsi ini sekarang hanya memeriksa 'data-page' di body dan mencocokkannya
 * dengan href tautan. Logika scroll-spy yang kompleks telah dihapus.
 */
function initializeNavLinks() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = document.body.dataset.page; 

    navLinks.forEach(link => {
        link.classList.remove('active');
        // Mendapatkan nama halaman dari atribut href (misal: "about.html" -> "about")
        const linkPage = link.getAttribute('href').split('.')[0];
        
        // Menangani kasus khusus untuk index.html ('home') dan halaman lainnya
        if (currentPage === 'home' && (linkPage === 'index' || linkPage === '')) {
             link.classList.add('active');
        } else if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
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
            console.log("Logout diklik!");
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


// Add password toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    // Find all password toggle buttons
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            // Find the associated password input
            const passwordInput = toggle.previousElementSibling;
            const icon = toggle.querySelector('i');
            
            // Toggle password visibility
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
});