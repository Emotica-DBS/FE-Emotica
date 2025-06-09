import { requireAuth } from './auth.js';
import { showToast, debounce } from './utils.js';

// Global state untuk halaman riwayat
let allAnalyses = [];
let filteredAnalyses = [];
let currentPage = 1;
const itemsPerPage = 10;

// Fungsi utama yang dijalankan saat halaman riwayat dimuat
function initializeHistoryPage() {
    requireAuth('../pages/login.html'); // Pastikan pengguna sudah login
    
    setupEventListeners();
    loadAnalyses();
}

// Menambahkan semua event listener yang dibutuhkan
function setupEventListeners() {
    const searchInput = document.getElementById('search-history');
    const sentimentFilter = document.getElementById('sentiment-filter');
    const sortBy = document.getElementById('sort-by');
    
    // Gunakan debounce untuk input pencarian agar tidak memanggil fungsi terus-menerus
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            applyFiltersAndSort();
        }, 300));
    }
    
    if (sentimentFilter) sentimentFilter.addEventListener('change', applyFiltersAndSort);
    if (sortBy) sortBy.addEventListener('change', applyFiltersAndSort);
    
    // Paginasi
    document.getElementById('prev-page')?.addEventListener('click', () => changePage(-1));
    document.getElementById('next-page')?.addEventListener('click', () => changePage(1));
}

// Memuat semua data riwayat dari API (atau data dummy)
async function loadAnalyses() {
    try {
        // NOTE: Di dunia nyata, Anda akan melakukan fetch ke backend di sini
        // const token = localStorage.getItem('token');
        // const response = await fetch(`${API_BASE_URL}/history`, { 
        //     headers: { 'Authorization': `Bearer ${token}` } 
        // });
        // if (!response.ok) throw new Error('Gagal memuat data');
        // allAnalyses = await response.json();
        
        // Untuk sekarang, kita gunakan data dummy yang representatif
        allAnalyses = generateDummyData(34);
        applyFiltersAndSort();

    } catch (error) {
        showToast('Gagal memuat riwayat analisis.', 'error');
        renderTable(); // Tampilkan tabel kosong jika gagal
        renderPagination();
    }
}

// Menerapkan filter dan pengurutan ke data, lalu merender ulang
function applyFiltersAndSort() {
    const sentiment = document.getElementById('sentiment-filter').value;
    const searchQuery = document.getElementById('search-history').value.toLowerCase();
    const sortBySelect = document.getElementById('sort-by').value;
    
    // 1. Proses Filter
    let tempAnalyses = allAnalyses.filter(item => {
        const matchesSentiment = sentiment === 'all' || item.sentiment.type === sentiment;
        const matchesSearch = item.text.toLowerCase().includes(searchQuery);
        return matchesSentiment && matchesSearch;
    });

    // 2. Proses Pengurutan
    tempAnalyses.sort((a, b) => {
        if (sortBySelect === 'oldest') {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }
        // Default (newest)
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    filteredAnalyses = tempAnalyses;
    currentPage = 1; // Selalu reset ke halaman pertama setelah filter/sort
    
    renderTable();
    renderPagination();
}

// Merender data ke dalam tabel HTML
function renderTable() {
    const tableBody = document.getElementById('history-table-body');
    const emptyStateRow = document.querySelector('#history-table-body tr.hidden'); 
    if (!tableBody) return;

    tableBody.innerHTML = ''; // Kosongkan tabel
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredAnalyses.slice(startIndex, endIndex);

    if (paginatedItems.length === 0) {
        if(emptyStateRow) {
            const newEmptyRow = emptyStateRow.cloneNode(true);
            newEmptyRow.classList.remove('hidden');
            tableBody.appendChild(newEmptyRow);
        }
    } else {
        paginatedItems.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-[var(--bg-secondary)] transition-colors';
            row.innerHTML = `
                <td class="px-6 py-4">
                    <div class="text-sm text-[var(--text)] line-clamp-2">${item.text}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="sentiment-tag ${item.sentiment.type}">${item.sentiment.type}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted)]">
                    ${new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" class="text-[var(--accent)] hover:underline">Detail</a>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Merender dan memperbarui kontrol paginasi
function renderPagination() {
    const totalItems = filteredAnalyses.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('start-item').textContent = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    document.getElementById('end-item').textContent = Math.min(currentPage * itemsPerPage, totalItems);
    
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages;
}

// Fungsi untuk berpindah halaman
function changePage(direction) {
    const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage);
    const newPage = currentPage + direction;

    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderTable();
        renderPagination();
    }
}

// Fungsi untuk membuat data dummy (hanya untuk development)
function generateDummyData(count) {
    const data = [];
    const sentiments = ['positive', 'negative', 'neutral'];
    const texts = [
        "Presentasinya luar biasa, semua orang terkesan!",
        "Saya rasa ada beberapa hal yang perlu kita perbaiki dari proyek ini.",
        "Jadwal meeting telah dikirimkan melalui email.",
        "Sangat kecewa dengan kualitas produk yang diterima.",
        "Terima kasih atas kerja kerasnya, tim!",
        "Laporan kuartal ini menunjukkan performa yang stabil."
    ];

    for (let i = 0; i < count; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
            id: `id_${i}`,
            text: texts[i % texts.length] + ` (contoh ${i+1})`,
            sentiment: { type: sentiments[i % sentiments.length] },
            createdAt: date.toISOString()
        });
    }
    return data;
}

// Jalankan inisialisasi halaman saat dokumen siap
document.addEventListener('DOMContentLoaded', initializeHistoryPage);
