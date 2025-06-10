/**
 * auth.js
 * Modul ini berisi semua fungsi inti terkait autentikasi.
 * Fungsi-fungsi di sini akan melakukan panggilan API ke backend.
 */
import { showToast } from './utils.js';

// Pastikan ini sesuai dengan alamat backend Flask Anda
const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Memeriksa apakah pengguna sudah terautentikasi berdasarkan token di localStorage.
 * @returns {boolean} True jika ada token, false jika tidak.
 */
export function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

/**
 * Mengalihkan pengguna ke halaman login jika mereka mencoba mengakses halaman terproteksi tanpa login.
 * @param {string} redirectTo - Halaman tujuan jika tidak terautentikasi.
 */
export function requireAuth(redirectTo = '../pages/login.html') {
    if (!isAuthenticated()) {
        window.location.href = redirectTo;
    }
}

/**
 * Mengalihkan pengguna ke dasbor jika mereka mencoba mengakses halaman login/register padahal sudah login.
 * @param {string} redirectTo - Halaman tujuan jika sudah terautentikasi.
 */
export function redirectIfAuthenticated(redirectTo = '../pages/dashboard.html') {
    if (isAuthenticated()) {
        window.location.href = redirectTo;
    }
}

/**
 * Menyimpan data sesi pengguna (token dan data user) ke localStorage.
 * @param {string} token - JWT token dari backend.
 * @param {object} user - Objek data pengguna.
 */
function setUserSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Menghapus data sesi pengguna dari localStorage.
 */
export function clearUserSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

/**
 * Mendapatkan data pengguna yang sedang login dari localStorage.
 * @returns {object|null} Objek data pengguna atau null.
 */
export function getCurrentUser() {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (e) {
        console.error("Gagal parse data pengguna:", e);
        return null;
    }
}

/**
 * Menangani proses login dengan mengirim request ke API.
 * @param {string} email - Email pengguna.
 * @param {string} password - Kata sandi pengguna.
 * @returns {Promise<boolean>} - True jika login berhasil, false jika gagal.
 */
export async function handleLogin(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Login gagal');
        }

        setUserSession(data.token, data.user);
        showToast('Login berhasil! Mengalihkan...', 'success');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
        return true;

    } catch (error) {
        console.error('Login error:', error);
        showToast(error.message, 'error');
        return false;
    }
}

/**
 * Menangani proses registrasi dengan mengirim request ke API.
 * @param {string} name - Nama pengguna.
 * @param {string} email - Email pengguna.
 * @param {string} password - Kata sandi pengguna.
 * @returns {Promise<boolean>} - True jika registrasi berhasil, false jika gagal.
 */
export async function handleRegister(name, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Registrasi gagal');
        }

        showToast('Registrasi berhasil! Anda akan dialihkan ke halaman login.', 'success');
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        return true;

    } catch (error) {
        console.error('Registration error:', error);
        showToast(error.message, 'error');
        return false;
    }
}

/**
 * Menangani proses logout.
 */
export function handleLogout() {
    clearUserSession();
    showToast('Berhasil logout.', 'info');
    setTimeout(() => { window.location.href = 'login.html'; }, 1000);
}
