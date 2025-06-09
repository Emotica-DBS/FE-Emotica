/**
 * register.js
 * Skrip ini khusus untuk menangani fungsionalitas di halaman register.html.
 */
import { handleRegister, redirectIfAuthenticated } from './auth.js';
import { showToast, validateEmail, validatePassword } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Jika pengguna sudah login, alihkan langsung ke dasbor
    redirectIfAuthenticated();

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Ambil elemen dari form
            const nameInput = registerForm.querySelector('#name');
            const emailInput = registerForm.querySelector('#email-address');
            const passwordInput = registerForm.querySelector('#password');
            const confirmPasswordInput = registerForm.querySelector('#confirm-password');
            const errorMessageDiv = document.getElementById('error-message');

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            // Sembunyikan pesan error sebelumnya
            if (errorMessageDiv) {
                errorMessageDiv.classList.add('hidden');
                errorMessageDiv.textContent = '';
            }

            // Validasi input
            if (!name || !email || !password || !confirmPassword) {
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

            if (password !== confirmPassword) {
                if (errorMessageDiv) {
                    errorMessageDiv.textContent = 'Konfirmasi kata sandi tidak cocok.';
                    errorMessageDiv.classList.remove('hidden');
                } else {
                    showToast('Konfirmasi kata sandi tidak cocok.', 'warning');
                }
                return;
            }
            
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.isValid) {
                if (errorMessageDiv) {
                    errorMessageDiv.textContent = passwordValidation.message;
                    errorMessageDiv.classList.remove('hidden');
                } else {
                    showToast(passwordValidation.message, 'warning');
                }
                return;
            }
            
            // Tampilkan loading state pada tombol
            const submitButton = registerForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Membuat Akun...`;
            }

            // Panggil fungsi register dari auth.js
            await handleRegister(name, email, password);

            // Kembalikan state tombol ke semula jika gagal
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Buat Akun';
            }
        });
    }
});
