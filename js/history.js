import { requireAuth, getCurrentUser } from './auth.js';
import { showToast, debounce, formatDate, getInitials } from './utils.js';
import { getHistory } from './store.js';

let filteredAnalyses = [];
let currentPage = 1;
const itemsPerPage = 10;

document.addEventListener('DOMContentLoaded', () => {
    requireAuth('../pages/login.html');
    const currentUser = getCurrentUser();
    if (currentUser) {
        updateUserInfo(currentUser);
    }
    initializeHistoryPage();
});

function updateUserInfo(user) {
    const userName = document.getElementById('user-name');
    const userInitial = document.getElementById('user-initial');
    if (userName) userName.textContent = user.name || 'Pengguna';
    if (userInitial) userInitial.textContent = getInitials(user.name || 'U');
}

function initializeHistoryPage() {
    setupEventListeners();
    applyFiltersAndSort();
}

function setupEventListeners() {
    document.getElementById('search-history')?.addEventListener('input', debounce(applyFiltersAndSort, 300));
    document.getElementById('sentiment-filter')?.addEventListener('change', applyFiltersAndSort);
    document.getElementById('sort-by')?.addEventListener('change', applyFiltersAndSort);
    document.getElementById('prev-page')?.addEventListener('click', () => changePage(-1));
    document.getElementById('next-page')?.addEventListener('click', () => changePage(1));
}

function applyFiltersAndSort() {
    const allAnalyses = getHistory();
    const sentiment = document.getElementById('sentiment-filter').value;
    const searchQuery = document.getElementById('search-history').value.toLowerCase();
    const sortBy = document.getElementById('sort-by').value;
    
    let tempAnalyses = allAnalyses.filter(item => 
        (sentiment === 'all' || item.sentiment.type === sentiment) &&
        (item.text.toLowerCase().includes(searchQuery))
    );

    // [PERBAIKAN] Logika sorting sekarang membaca nilai dari dropdown
    tempAnalyses.sort((a, b) => {
        if (sortBy === 'oldest') {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }
        // Default adalah 'newest'
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    filteredAnalyses = tempAnalyses;
    currentPage = 1;
    renderTable();
    renderPagination();
}

function renderTable() {
    const tableBody = document.getElementById('history-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredAnalyses.slice(startIndex, startIndex + itemsPerPage);

    if (paginatedItems.length === 0) {
        const emptyStateRow = document.getElementById('empty-state');
        if (emptyStateRow) {
             tableBody.innerHTML = `<tr><td colspan="3" class="text-center py-12"><div class="flex flex-col items-center"><i class="fas fa-box-open text-4xl text-[var(--muted)]"></i><p class="mt-4 text-sm font-medium text-[var(--muted)]">Tidak ada riwayat ditemukan.</p></div></td></tr>`;
        }
    } else {
        const sentimentEmojis = {
            positif: '😊',
            negatif: '😠',
        };

        paginatedItems.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-[var(--bg-secondary)] transition-colors';
            row.innerHTML = `
                <td class="px-6 py-4"><div class="text-sm text-[var(--text)] line-clamp-2">${item.text}</div></td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="sentiment-tag ${item.sentiment.type}">
                        ${sentimentEmojis[item.sentiment.type] || ''} 
                        <span class="ml-1.5">${item.sentiment.type}</span>
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted)]">${formatDate(new Date(item.createdAt))}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}

function renderPagination() {
    const totalItems = filteredAnalyses.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('start-item').textContent = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    document.getElementById('end-item').textContent = Math.min(currentPage * itemsPerPage, totalItems);
    
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages;
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage);
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderTable();
        renderPagination();
    }
}
