import { showToast } from './utils.js';

const API_BASE_URL = 'https://be-emotica.up.railway.app/api';

// --- Logika untuk Logout Otomatis Saat Tidak Aktif ---
let inactivityTimer;
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // Atur ke 30 menit

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        alert("Sesi Anda berakhir karena tidak ada aktivitas. Anda akan di-logout.");
        handleLogout();
    }, INACTIVITY_TIMEOUT_MS);
}

// Fungsi ini akan dipanggil di halaman yang memerlukan login (dasbor, riwayat).
export function startUserActivityDetector() {
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(event => {
        document.addEventListener(event, resetInactivityTimer, true);
    });
    resetInactivityTimer(); // Mulai timer saat halaman dimuat
}
// --- Akhir Logika Logout Otomatis ---

// Memeriksa apakah ada token di penyimpanan lokal.
export function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

// Jika belum login, alihkan ke halaman login.
export function requireAuth(redirectTo = '../pages/login.html') {
    if (!isAuthenticated()) {
        window.location.href = redirectTo;
    }
}

// Jika sudah login, alihkan ke dasbor.
export function redirectIfAuthenticated(redirectTo = '../pages/dashboard.html') {
    if (isAuthenticated()) {
        window.location.href = redirectTo;
    }
}

// Menyimpan token dan data pengguna setelah login.
function setUserSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

// Menghapus token dan data pengguna dari penyimpanan.
export function clearUserSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

// Mengambil data pengguna yang sedang login.
export function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        return null;
    }
}

// Membuat header otorisasi untuk setiap permintaan API.
export function getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Menangani proses login.
export async function handleLogin(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login gagal');
        setUserSession(data.token, data.user);
        showToast('Login berhasil! Mengalihkan...', 'success');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
        return true;
    } catch (error) {
        showToast(error.message, 'error');
        return false;
    }
}

// Menangani proses registrasi.
export async function handleRegister(name, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Registrasi gagal');
        showToast('Registrasi berhasil! Silakan login.', 'success');
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        return true;
    } catch (error) {
        showToast(error.message, 'error');
        return false;
    }
}

// Menangani proses logout.
export function handleLogout() {
    // Hentikan timer logout otomatis saat logout manual.
    clearTimeout(inactivityTimer);

    clearUserSession();
    showToast('Berhasil logout.', 'info');
    setTimeout(() => { window.location.href = 'login.html'; }, 1000);
}