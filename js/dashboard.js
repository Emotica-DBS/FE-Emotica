import { requireAuth, getCurrentUser } from './auth.js';
import { showToast, debounce } from './utils.js';

// Fungsi utama yang dijalankan saat halaman dasbor dimuat
function initializeDashboard() {
    requireAuth('../pages/login.html'); // Pastikan pengguna sudah login
    
    const currentUser = getCurrentUser();
    if (currentUser) {
        updateUserInfo(currentUser);
    }
    
    initTextAnalysis();
    const chart = initSentimentChart();
    
    // Muat data awal (menggunakan data dummy)
    loadDashboardData(chart);
}

// Memperbarui UI dengan informasi pengguna
function updateUserInfo(user) {
    const userGreeting = document.getElementById('user-greeting');
    const userName = document.getElementById('user-name');
    const userInitial = document.getElementById('user-initial');

    if (userGreeting) userGreeting.textContent = `Selamat Datang, ${user.name || 'Pengguna'}!`;
    if (userName) userName.textContent = user.name || 'Pengguna';
    if (userInitial) userInitial.textContent = (user.name || 'U').charAt(0).toUpperCase();
}

// Inisialisasi fungsionalitas area analisis teks
function initTextAnalysis() {
    const textInput = document.getElementById('text-to-analyze');
    const charCount = document.getElementById('char-count');
    const analysisForm = document.getElementById('analysis-form');

    if (textInput && charCount) {
        textInput.addEventListener('input', debounce(() => {
            charCount.textContent = textInput.value.length;
        }, 200));
    }

    if (analysisForm) {
        analysisForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleAnalyzeText();
        });
    }
}

// Inisialisasi diagram lingkaran sentimen
function initSentimentChart() {
    const ctx = document.getElementById('sentiment-chart');
    if (!ctx) return null;

    const style = getComputedStyle(document.documentElement);
    const positiveColor = style.getPropertyValue('--positive').trim();
    const neutralColor = style.getPropertyValue('--neutral').trim();
    const negativeColor = style.getPropertyValue('--negative').trim();
    const bgColor = style.getPropertyValue('--bg').trim();

    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Positif', 'Netral', 'Negatif'],
            datasets: [{
                data: [1, 1, 1], // Data awal
                backgroundColor: [positiveColor, neutralColor, negativeColor],
                borderColor: bgColor,
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => ` ${context.label}: ${context.raw.toFixed(1)}%`
                    }
                }
            }
        }
    });
}

// Memuat semua data untuk dasbor (menggunakan data dummy)
async function loadDashboardData(chart) {
    try {
        const dummyStats = {
            sentimentDistribution: { positive: 57, neutral: 25, negative: 18 }
        };
        const dummyHistory = [
            { text: "Sangat puas dengan pelayanannya, cepat dan ramah!", sentiment: { type: 'positive' }, createdAt: new Date() },
            { text: "Baterai perangkat ini cepat sekali habis, sedikit mengecewakan.", sentiment: { type: 'negative' }, createdAt: new Date(Date.now() - 86400000 * 1) },
            { text: "Laporan mingguan sudah saya kirimkan via email.", sentiment: { type: 'neutral' }, createdAt: new Date(Date.now() - 86400000 * 2) },
        ];

        updateStatsUI(dummyStats, chart);
        updateAnalysisHistoryUI(dummyHistory);

    } catch (error) {
        showToast('Gagal memuat data dasbor.', 'error');
    }
}

// Menangani logika saat tombol "Analisis" diklik
async function handleAnalyzeText() {
    const textInput = document.getElementById('text-to-analyze');
    const text = textInput.value.trim();
    const submitButton = document.querySelector('#analysis-form button[type="submit"]');

    if (!text) {
        showToast('Mohon masukkan teks untuk dianalisis.', 'warning');
        return;
    }
    
    // Tampilkan loading state
    if(submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Menganalisis...`;
    }

    // Simulasi panggilan API
    setTimeout(() => {
        const dummyResult = {
            sentiment: { type: Math.random() > 0.66 ? 'positive' : (Math.random() > 0.33 ? 'neutral' : 'negative'), score: Math.random() },
            suggestion: "Mungkin bisa coba sampaikan seperti ini: 'Saya menghargai usahanya, namun ada beberapa hal yang perlu kita diskusikan lebih lanjut untuk perbaikan.'"
        };
        updateAnalysisResultsUI(dummyResult);
        showToast('Analisis selesai!', 'success');
        
        // Kembalikan state tombol
        if(submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = `<i class="fas fa-magic mr-2"></i> Analisis Sekarang`;
        }

    }, 1500);
}

// Memperbarui UI dengan hasil analisis
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

    const icons = {
        positive: 'fa-smile-beam',
        neutral: 'fa-meh',
        negative: 'fa-frown'
    };
    sentimentIconContainer.innerHTML = `<i class="fas ${icons[sentimentType]} text-3xl text-[var(--${sentimentType})]"></i>`;

    if (sentimentType === 'negative' && data.suggestion) {
        suggestionContainer.textContent = data.suggestion;
    } else {
        suggestionContainer.textContent = 'Teks Anda sudah baik! Tidak ada saran saat ini.';
    }

    resultsSection.classList.remove('hidden');
}

// Memperbarui UI statistik
function updateStatsUI(stats, chart) {
    if (!chart || !stats) return;
    
    const { positive, neutral, negative } = stats.sentimentDistribution;
    const total = positive + neutral + negative || 1; 

    const positivePercent = (positive / total * 100);
    const neutralPercent = (neutral / total * 100);
    const negativePercent = (negative / total * 100);

    chart.data.datasets[0].data = [positivePercent, neutralPercent, negativePercent];
    chart.update();

    document.getElementById('chart-positive').textContent = `${positivePercent.toFixed(0)}%`;
    document.getElementById('chart-neutral').textContent = `${neutralPercent.toFixed(0)}%`;
    document.getElementById('chart-negative').textContent = `${negativePercent.toFixed(0)}%`;
}

// Memperbarui UI riwayat analisis terakhir
function updateAnalysisHistoryUI(history) {
    const listElement = document.getElementById('recent-analyses');
    if (!listElement) return;

    if (history.length === 0) {
        listElement.innerHTML = `<li class="py-3 text-center text-sm text-[var(--muted)]">Tidak ada riwayat.</li>`;
        return;
    }

    listElement.innerHTML = history.map(item => `
        <li class="py-3 flex items-center space-x-3">
            <span class="h-8 w-8 rounded-full flex items-center justify-center bg-[var(--${item.sentiment.type})] bg-opacity-20">
                <i class="fas ${item.sentiment.type === 'positive' ? 'fa-smile' : item.sentiment.type === 'negative' ? 'fa-frown' : 'fa-meh'} text-[var(--${item.sentiment.type})]"></i>
            </span>
            <div class="flex-1 min-w-0">
                <p class="text-sm text-[var(--text)] truncate">${item.text}</p>
                <p class="text-xs text-[var(--muted)]">${new Date(item.createdAt).toLocaleDateString('id-ID')}</p>
            </div>
        </li>
    `).join('');
}


// Jalankan inisialisasi saat dokumen siap
document.addEventListener('DOMContentLoaded', initializeDashboard);
