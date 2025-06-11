

import { getAuthHeaders } from './auth.js';
import { showToast } from './utils.js';

// 'state' adalah tempat penyimpanan data terpusat di frontend
let state = {
    analyses: [], // Ini adalah array yang akan kita isi dari database
};

/**
 * [FUNGSI BARU] Mengambil seluruh riwayat dari backend dan menyimpannya di state.
 * Ini adalah fungsi kunci untuk menyelesaikan masalah Anda.
 */
export async function fetchAndSetHistory() {
    const headers = getAuthHeaders();
    if (!headers) {
        // Jika tidak ada token, tidak perlu lanjut
        return;
    }

    try {
        const response = await fetch('https://be-emotica.up.railway.app/api/history', {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal mengambil data dari server.');
        }

        const historyFromServer = await response.json();

        // Memformat data dari server agar konsisten dengan format frontend
        state.analyses = historyFromServer.map(item => ({
            id: item._id, // Gunakan _id dari database
            text: item.text,
            sentiment: {
                type: item.sentiment.toLowerCase(), // Pastikan formatnya konsisten
                score: item.confidence,
            },
            createdAt: item.createdAt,
        }));
        
        console.log('Riwayat berhasil diambil dari server:', state.analyses);

    } catch (error) {
        showToast(error.message, 'error');
        state.analyses = []; // Kosongkan jika gagal
    }
}

/**
 * Mengembalikan semua riwayat yang ada di state.
 */
export function getHistory() {
    return state.analyses;
}

/**
 * Menambahkan satu hasil analisis baru ke depan array.
 */
export function addAnalysis(newAnalysisData) {
    state.analyses.unshift(newAnalysisData);
}

/**
 * Menghitung statistik berdasarkan data di state.
 */
export function getStats() {
    const totalAnalyses = state.analyses.length;
    const sentimentDistribution = state.analyses.reduce((acc, curr) => {
        const type = curr.sentiment.type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    return { totalAnalyses, sentimentDistribution };
}