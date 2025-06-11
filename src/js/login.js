/**
 * login.js
 * Skrip ini khusus untuk menangani fungsionalitas di halaman login.html.
 */
import { handleLogin, redirectIfAuthenticated } from './auth.js';
import { showToast, validateEmail } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Jika pengguna sudah login, alihkan langsung ke dasbor
    redirectIfAuthenticated();

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Ambil elemen dari form
            const emailInput = loginForm.querySelector('#email-address');
            const passwordInput = loginForm.querySelector('#password');
            const errorMessageDiv = document.getElementById('error-message');

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // Sembunyikan pesan error sebelumnya
            if (errorMessageDiv) {
                errorMessageDiv.classList.add('hidden');
                errorMessageDiv.textContent = '';
            }

            // Validasi input
            if (!email || !password) {
                if (errorMessageDiv) {
                    errorMessageDiv.textContent = 'Mohon isi semua kolom.';
                    errorMessageDiv.classList.remove('hidden');
                } else {
                    showToast('Mohon isi semua kolom.', 'warning');
                }
                return;
            }
            
            if (!validateEmail(email)) {
                 if (errorMessageDiv) {
                    errorMessageDiv.textContent = 'Silakan masukkan alamat email yang valid.';
                    errorMessageDiv.classList.remove('hidden');
                } else {
                    showToast('Silakan masukkan alamat email yang valid.', 'warning');
                }
                return;
            }
            
            // Tampilkan loading state pada tombol jika perlu
            const submitButton = loginForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Masuk...`;
            }

            // Panggil fungsi login dari auth.js
            await handleLogin(email, password);

            // Kembalikan state tombol ke semula jika login gagal
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Masuk';
            }
        });
    }
});
