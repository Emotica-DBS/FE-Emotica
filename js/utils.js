/**
 * utils.js
 * Modul ini berisi berbagai fungsi bantuan (utility) yang bisa digunakan
 * di seluruh bagian aplikasi Emotica.
 */

/**
 * Menampilkan notifikasi toast yang muncul di sudut layar.
 * @param {string} message - Pesan yang akan ditampilkan.
 * @param {string} type - Tipe notifikasi ('success', 'error', 'warning', 'info').
 * @param {number} duration - Durasi tampilan notifikasi dalam milidetik.
 */
export function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `p-4 mb-4 rounded-md shadow-lg flex items-start transition-all duration-300 transform translate-x-full opacity-0`;
    
    const colors = {
        success: { bg: 'bg-green-500', icon: 'fa-check-circle' },
        error:   { bg: 'bg-red-500',   icon: 'fa-times-circle' },
        warning: { bg: 'bg-yellow-500',icon: 'fa-exclamation-triangle' },
        info:    { bg: 'bg-blue-500',  icon: 'fa-info-circle' }
    };

    const config = colors[type] || colors.info;
    toast.classList.add(config.bg, 'text-white');

    toast.innerHTML = `
        <i class="fas ${config.icon} mr-3 mt-1"></i>
        <div class="flex-1">${message}</div>
        <button class="ml-4 -mr-1 p-1 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white">
            <i class="fas fa-times text-sm"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);

    // Memicu animasi masuk
    setTimeout(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
    }, 100);

    const closeButton = toast.querySelector('button');
    
    const removeToast = () => {
        toast.classList.add('opacity-0', 'translate-x-full');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    };

    closeButton.addEventListener('click', removeToast);

    // Hapus otomatis setelah durasi tertentu
    setTimeout(removeToast, duration);
}

/**
 * Membuat container untuk menampung notifikasi toast jika belum ada.
 */
function createToastContainer() {
    let container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-5 right-5 z-[100] w-full max-w-xs space-y-2';
    document.body.appendChild(container);
    return container;
}


/**
 * Fungsi debounce untuk membatasi frekuensi pemanggilan sebuah fungsi.
 * Berguna untuk event seperti 'input' atau 'resize'.
 * @param {Function} func - Fungsi yang akan di-debounce.
 * @param {number} wait - Waktu tunggu dalam milidetik.
 * @returns {Function} - Fungsi yang sudah di-debounce.
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Memformat tanggal menjadi string yang mudah dibaca.
 * @param {Date|string} date - Objek tanggal atau string tanggal.
 * @returns {string} - String tanggal yang sudah diformat.
 */
export function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Mengambil inisial dari sebuah nama.
 * @param {string} name - Nama lengkap.
 * @returns {string} - Inisial nama (maksimal 2 huruf).
 */
export function getInitials(name) {
    if (!name || typeof name !== 'string') return 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
}

/**
 * Memvalidasi format alamat email.
 * @param {string} email - Email yang akan divalidasi.
 * @returns {boolean} - True jika email valid, false jika tidak.
 */
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Memvalidasi kekuatan sebuah kata sandi.
 * @param {string} password - Kata sandi yang akan divalidasi.
 * @returns {{isValid: boolean, message: string}} - Objek hasil validasi.
 */
export function validatePassword(password) {
    if (password.length < 8) {
        return { 
            isValid: false, 
            message: 'Kata sandi minimal harus 8 karakter.' 
        };
    }
    if (!/[A-Z]/.test(password)) {
        return { 
            isValid: false, 
            message: 'Kata sandi harus mengandung setidaknya satu huruf kapital.' 
        };
    }
    if (!/[a-z]/.test(password)) {
        return { 
            isValid: false, 
            message: 'Kata sandi harus mengandung setidaknya satu huruf kecil.' 
        };
    }
    if (!/[0-9]/.test(password)) {
        return { 
            isValid: false, 
            message: 'Kata sandi harus mengandung setidaknya satu angka.' 
        };
    }
    return { isValid: true, message: 'Kata sandi valid.' };
}
