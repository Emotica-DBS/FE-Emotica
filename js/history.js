import { requireAuth, getCurrentUser } from './auth.js';
import { showToast, debounce, formatDate, getInitials } from './utils.js';
// [PERBAIKAN] Impor data dari store.js
import { getHistory } from './store.js';

let filteredAnalyses = [];
let currentPage = 1;
const itemsPerPage = 10;

document.addEventListener('DOMContentLoaded', () => {
    requireAuth('login.html');
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
    applyFiltersAndSort(); // Langsung filter dan render data dari store saat halaman dimuat
}

function setupEventListeners() {
    document.getElementById('search-history')?.addEventListener('input', debounce(applyFiltersAndSort, 300));
    document.getElementById('sentiment-filter')?.addEventListener('change', applyFiltersAndSort);
    document.getElementById('sort-by')?.addEventListener('change', applyFiltersAndSort);
    document.getElementById('prev-page')?.addEventListener('click', () => changePage(-1));
    document.getElementById('next-page')?.addEventListener('click', () => changePage(1));
}

function applyFiltersAndSort() {
    const allAnalyses = getHistory(); // Selalu ambil data terbaru dari store
    const sentiment = document.getElementById('sentiment-filter').value;
    const searchQuery = document.getElementById('search-history').value.toLowerCase();
    const sortBy = document.getElementById('sort-by').value;
    
    let tempAnalyses = allAnalyses.filter(item => 
        (sentiment === 'all' || item.sentiment.type === sentiment) &&
        (item.text.toLowerCase().includes(searchQuery))
    );

    tempAnalyses.sort((a, b) => 
        sortBy === 'oldest' ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    filteredAnalyses = tempAnalyses;
    currentPage = 1;
    renderTable();
    renderPagination();
}

function renderTable() {
    const tableBody = document.getElementById('history-table-body');
    const emptyStateRow = document.getElementById('empty-state');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredAnalyses.slice(startIndex, startIndex + itemsPerPage);

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
                <td class="px-6 py-4"><div class="text-sm text-[var(--text)] line-clamp-2">${item.text}</div></td>
                <td class="px-6 py-4 whitespace-nowrap"><span class="sentiment-tag ${item.sentiment.type}">${item.sentiment.type}</span></td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted)]">${formatDate(item.createdAt)}</td>
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
