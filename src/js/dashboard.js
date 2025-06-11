import { requireAuth, getCurrentUser, getAuthHeaders, startUserActivityDetector } from './auth.js';
import { showToast, debounce, getInitials, formatDate } from './utils.js';
import { getHistory, getStats, addAnalysis, fetchAndSetHistory } from './store.js'; 
let chartInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Langkah 1: Pastikan pengguna sudah login.
  requireAuth('../pages/login.html');
   startUserActivityDetector(); 
   
  // Langkah 2: Tunggu (await) sampai data riwayat selesai diambil dari server.
  await fetchAndSetHistory(); 
  
  // Langkah 3: Setelah data siap, baru panggil fungsi untuk menampilkan semuanya.
  initializeDashboard();
});

/**
 * Menginisialisasi semua komponen di dasbor.
 */
function initializeDashboard() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        updateUserInfo(currentUser);
    }
    
    chartInstance = initSentimentChart();
    loadDashboardData(); // Memuat data awal dari store
    initTextAnalysis();
}

/**
 * Memperbarui UI dengan informasi pengguna yang sedang login.
 */
function updateUserInfo(user) {
    document.getElementById('user-greeting').textContent = `Selamat Datang, ${user.name || 'Pengguna'}!`;
    document.getElementById('user-name').textContent = user.name || 'Pengguna';
    document.getElementById('user-initial').textContent = getInitials(user.name || 'U');
}

/**
 * Menyiapkan event listener untuk area analisis teks.
 */
function initTextAnalysis() {
    const textInput = document.getElementById('text-to-analyze');
    const charCount = document.getElementById('char-count');
    const analysisForm = document.getElementById('analysis-form');

    if (textInput && charCount) {
        textInput.addEventListener('input', debounce(() => {
            charCount.textContent = textInput.value.length;
        }, 200));
    }
    analysisForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleAnalyzeText();
    });
}

/**
 * Inisialisasi diagram lingkaran sentimen (hanya Positif & Negatif).
 */
function initSentimentChart() {
    const ctx = document.getElementById('sentiment-chart');
    if (!ctx) return null;
    
    const style = getComputedStyle(document.documentElement);
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Positif', 'Negatif'],
            datasets: [{
                data: [50, 50],
                backgroundColor: [style.getPropertyValue('--positive').trim(), style.getPropertyValue('--negative').trim()],
                borderColor: style.getPropertyValue('--bg').trim(),
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '75%',
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => ` ${context.label}: ${context.raw.toFixed(1)}%` } } }
        }
    });
}

/**
 * Memuat dan menampilkan semua data awal dari store.
 */
function loadDashboardData() {
    updateStatsUI();
    updateAnalysisHistoryUI();
}

/**
 * Menangani logika saat tombol "Analisis" diklik.
 */
async function handleAnalyzeText() {
    const textInput = document.getElementById('text-to-analyze');
    const text = textInput.value.trim();
    const submitButton = document.querySelector('#analysis-form button[type="submit"]');

    if (!text) {
        showToast('Mohon masukkan teks untuk dianalisis.', 'warning');
        return;
    }
    
    submitButton.disabled = true;
    submitButton.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Menganalisis...`;

    try {
        const headers = getAuthHeaders();
        if (!headers) {
            showToast('Sesi tidak valid, silakan login ulang.', 'error');
            setTimeout(() => window.location.href = '/pages/login.html', 1500);
            return;
        }

        // Panggilan API ke backend Flask yang sudah online
        const response = await fetch('https://be-emotica.up.railway.app/api/analyze', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ text })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Analisis dari backend gagal');
        }
        
        const newAnalysis = { 
            id: `hist_${Date.now()}`, 
            text, 
            sentiment: result.sentiment, 
            createdAt: new Date().toISOString() 
        };
        
        // Memanggil fungsi dari store.js untuk mengubah data terpusat
        addAnalysis(newAnalysis);
        
        // Memperbarui semua bagian UI dengan data terbaru dari store
        updateAnalysisResultsUI(newAnalysis);
        updateAnalysisHistoryUI();           
        updateStatsUI();                     
        
        showToast('Analisis dari model Anda berhasil!', 'success');

    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = `<i class="fas fa-magic mr-2"></i> Analisis Sekarang`;
        textInput.value = ''; 
        document.getElementById('char-count').textContent = '0';
    }
}

/**
 * Memperbarui UI dengan hasil analisis yang baru.
 */
function updateAnalysisResultsUI(data) {
    const resultsSection = document.getElementById('analysis-results');
    const sentimentResult = document.getElementById('sentiment-result');
    const sentimentIconContainer = document.getElementById('sentiment-icon');
    const confidenceBar = document.getElementById('confidence-bar');
    const confidencePercent = document.getElementById('confidence-percent');
    const suggestionContainer = document.getElementById('suggestion-container');

    const scorePercent = Math.round(data.sentiment.score * 100);
    const sentimentType = data.sentiment.type;

    sentimentResult.textContent = `${sentimentType.charAt(0).toUpperCase() + sentimentType.slice(1)}`;
    confidencePercent.textContent = `${scorePercent}%`;
    
    confidenceBar.style.width = `${scorePercent}%`;
    confidenceBar.style.backgroundColor = `var(--${sentimentType})`;

    const icons = { positif: 'fa-smile-beam', negatif: 'fa-frown' };
    sentimentIconContainer.innerHTML = `<i class="fas ${icons[sentimentType]} text-3xl text-[var(--${sentimentType})]"></i>`;

    if (sentimentType === 'negatif') {
        suggestionContainer.textContent = "Saran kalimat akan diimplementasikan nanti.";
    } else {
        suggestionContainer.textContent = 'Teks Anda sudah baik! Tidak ada saran saat ini.';
    }
    resultsSection.classList.remove('hidden');
}

/**
 * Memperbarui UI statistik dan diagram.
 */
function updateStatsUI() {
    const stats = getStats();
    if (!chartInstance || !stats) return;

    const totalAnalysesEl = document.getElementById('total-analyses');
    if(totalAnalysesEl) totalAnalysesEl.textContent = stats.totalAnalyses;
    
    const { positif = 0, negatif = 0 } = stats.sentimentDistribution;
    const total = positif + negatif || 1; 

    const positivePercent = (positif / total * 100);
    const negativePercent = (negatif / total * 100);

    chartInstance.data.datasets[0].data = [positivePercent, negativePercent];
    chartInstance.update();

    document.getElementById('chart-positive').textContent = `${positivePercent.toFixed(0)}%`;
    document.getElementById('chart-negative').textContent = `${negativePercent.toFixed(0)}%`;
}

/**
 * Memperbarui UI daftar riwayat terakhir di dasbor.
 */
function updateAnalysisHistoryUI() {
    const history = getHistory();
    const listElement = document.getElementById('recent-analyses');
    if (!listElement) return;

    const recentHistory = history.slice(0, 3);

    if (recentHistory.length === 0) {
        listElement.innerHTML = `<li class="py-3 text-center text-sm text-[var(--muted)]">Tidak ada riwayat.</li>`;
        return;
    }

    listElement.innerHTML = recentHistory.map(item => `
        <li class="py-3 flex items-center space-x-3">
            <span class="h-8 w-8 rounded-full flex items-center justify-center bg-[var(--${item.sentiment.type})] bg-opacity-20 flex-shrink-0">
                <i class="fas ${item.sentiment.type === 'positif' ? 'fa-smile' : 'fa-frown'} text-[var(--${item.sentiment.type})]"></i>
            </span>
            <div class="flex-1 min-w-0">
                <p class="text-sm text-[var(--text)] truncate">${item.text}</p>
                <p class="text-xs text-[var(--muted)]">${formatDate(new Date(item.createdAt))}</p>
            </div>
        </li>
    `).join('');
}
