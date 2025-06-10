/**
 * store.js
 * Bertindak sebagai "single source of truth" atau database sementara di frontend.
 * [PERBAIKAN] Sekarang menggunakan localStorage untuk menyimpan data secara persisten
 * di antara sesi dan halaman.
 */

// Kunci untuk menyimpan data di localStorage
const HISTORY_KEY = 'emotica_history';
const STATS_KEY = 'emotica_stats';

// --- DATA INITIALIZATION ---

// Fungsi untuk membuat data awal jika tidak ada di localStorage
function getInitialHistory() {
    return [
        { id: 'hist_3', text: "Sangat puas dengan pelayanannya, cepat dan ramah!", sentiment: { type: 'positive', score: 0.9 }, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
        { id: 'hist_2', text: "Baterai perangkat ini cepat sekali habis, sedikit mengecewakan.", sentiment: { type: 'negative', score: 0.8 }, createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
        { id: 'hist_1', text: "Laporan mingguan sudah saya kirimkan via email.", sentiment: { type: 'neutral', score: 0.5 }, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    ];
}

function getInitialStats() {
    return {
        totalAnalyses: 3,
        sentimentDistribution: { positive: 1, neutral: 1, negative: 1 }
    };
}

// Coba ambil data dari localStorage. Jika tidak ada, buat data awal.
let currentHistory = JSON.parse(localStorage.getItem(HISTORY_KEY)) || getInitialHistory();
let currentStats = JSON.parse(localStorage.getItem(STATS_KEY)) || getInitialStats();

// --- FUNGSI EKSPOR ---

/**
 * Mengambil data riwayat terbaru dari state.
 */
export function getHistory() {
    // Mengubah string tanggal kembali menjadi objek Date agar sorting berfungsi
    return currentHistory.map(item => ({...item, createdAt: new Date(item.createdAt)}));
}

/**
 * Mengambil data statistik terbaru dari state.
 */
export function getStats() {
    return currentStats;
}

/**
 * Fungsi untuk menambahkan analisis baru dan menyimpannya ke localStorage.
 * @param {object} newAnalysis - Objek analisis baru yang akan disimpan.
 */
export function addAnalysis(newAnalysis) {
    // 1. Tambahkan ke awal array riwayat di memori
    currentHistory.unshift(newAnalysis); 
    
    // 2. Perbarui statistik di memori
    currentStats.totalAnalyses++;
    currentStats.sentimentDistribution[newAnalysis.sentiment.type]++;
    
    // 3. Simpan state terbaru ke localStorage
    localStorage.setItem(HISTORY_KEY, JSON.stringify(currentHistory));
    localStorage.setItem(STATS_KEY, JSON.stringify(currentStats));
}
