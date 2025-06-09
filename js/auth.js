/**
 * auth.js
 * Modul ini berisi semua fungsi inti terkait autentikasi.
 * Modul ini tidak berinteraksi langsung dengan DOM, hanya menyediakan
 * fungsi yang dapat digunakan oleh skrip lain.
 */
import { showToast } from './utils.js'; // Asumsikan utils.js ada

// Ganti dengan URL backend Anda yang sebenarnya
const API_BASE_URL = 'http://localhost:3000/api/v1';

/**
 * Memeriksa apakah pengguna sudah terautentikasi berdasarkan token.
 * @returns {boolean} True jika ada token, false jika tidak.
 */
export function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

/**
 * Mengalihkan pengguna ke halaman login jika mereka belum terautentikasi.
 * @param {string} redirectTo - Halaman tujuan jika tidak terautentikasi.
 */
export function requireAuth(redirectTo = 'login.html') {
    if (!isAuthenticated()) {
        window.location.href = redirectTo;
    }
}

/**
 * Mengalihkan pengguna ke dasbor jika mereka sudah terautentikasi.
 * Berguna untuk halaman login dan register.
 * @param {string} redirectTo - Halaman tujuan jika sudah terautentikasi.
 */
export function redirectIfAuthenticated(redirectTo = 'dashboard.html') {
    if (isAuthenticated()) {
        window.location.href = redirectTo;
    }
}

/**
 * Menyimpan data sesi pengguna ke localStorage.
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
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

/**
 * Menangani proses login dengan mengirim request ke API.
 * @param {string} email - Email pengguna.
 * @param {string} password - Kata sandi pengguna.
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

    } catch (error) {
        console.error('Login error:', error);
        showToast(error.message || 'Login gagal. Silakan coba lagi.', 'error');
    }
}

/**
 * Menangani proses registrasi dengan mengirim request ke API.
 * @param {string} name - Nama pengguna.
 * @param {string} email - Email pengguna.
 * @param {string} password - Kata sandi pengguna.
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

        showToast('Registrasi berhasil! Silakan login.', 'success');
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);

    } catch (error) {
        console.error('Registration error:', error);
        showToast(error.message || 'Registrasi gagal. Silakan coba lagi.', 'error');
    }
}

/**
 * Menangani proses logout.
 */
export function handleLogout() {
    clearUserSession();
    showToast('Berhasil logout', 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 1000);
}
