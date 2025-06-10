import { requireAuth, getCurrentUser } from './auth.js';
import { showToast, debounce, getInitials, formatDate } from './utils.js';
import { getHistory, getStats, addAnalysis } from './store.js';

let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    requireAuth('login.html'); 
    initializeDashboard();
});

function initializeDashboard() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        updateUserInfo(currentUser);
    }
    chartInstance = initSentimentChart();
    loadDashboardData();
    initTextAnalysis();
}

function updateUserInfo(user) {
    document.getElementById('user-greeting').textContent = `Selamat Datang, ${user.name || 'Pengguna'}!`;
    document.getElementById('user-name').textContent = user.name || 'Pengguna';
    document.getElementById('user-initial').textContent = getInitials(user.name || 'U');
}

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

function initSentimentChart() {
    const ctx = document.getElementById('sentiment-chart');
    if (!ctx) return null;
    
    const style = getComputedStyle(document.documentElement);
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Positif', 'Netral', 'Negatif'],
            datasets: [{
                data: [1, 1, 1],
                backgroundColor: [style.getPropertyValue('--positive').trim(), style.getPropertyValue('--neutral').trim(), style.getPropertyValue('--negative').trim()],
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

function loadDashboardData() {
    updateStatsUI();
    updateAnalysisHistoryUI();
}

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

    setTimeout(() => {
        const dummyResult = {
            sentiment: { type: Math.random() > 0.66 ? 'positive' : (Math.random() > 0.33 ? 'neutral' : 'negative'), score: Math.random() },
            suggestion: "Mungkin bisa coba sampaikan seperti ini: 'Saya menghargai usahanya, namun ada beberapa hal yang perlu kita diskusikan lebih lanjut untuk perbaikan.'"
        };
        
        const newAnalysis = { id: `hist_${Date.now()}`, text, ...dummyResult, createdAt: new Date().toISOString() };
        
        addAnalysis(newAnalysis);
        
        updateAnalysisResultsUI(newAnalysis);
        updateAnalysisHistoryUI();           
        updateStatsUI();                     
        
        showToast('Analisis selesai!', 'success');
        
        submitButton.disabled = false;
        submitButton.innerHTML = `<i class="fas fa-magic mr-2"></i> Analisis Sekarang`;
        textInput.value = ''; 
        document.getElementById('char-count').textContent = '0';
    }, 1500);
}

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

    const icons = { positive: 'fa-smile-beam', neutral: 'fa-meh', negative: 'fa-frown' };
    sentimentIconContainer.innerHTML = `<i class="fas ${icons[sentimentType]} text-3xl text-[var(--${sentimentType})]"></i>`;

    if (sentimentType === 'negative' && data.suggestion) {
        suggestionContainer.textContent = data.suggestion;
    } else {
        suggestionContainer.textContent = 'Teks Anda sudah baik! Tidak ada saran saat ini.';
    }
    resultsSection.classList.remove('hidden');
}

function updateStatsUI() {
    const stats = getStats();
    if (!chartInstance || !stats) return;

    document.getElementById('total-analyses').textContent = stats.totalAnalyses;
    
    const { positive, neutral, negative } = stats.sentimentDistribution;
    const total = positive + neutral + negative || 1; 

    const positivePercent = (positive / total * 100);
    const neutralPercent = (neutral / total * 100);
    const negativePercent = (negative / total * 100);

    chartInstance.data.datasets[0].data = [positivePercent, neutralPercent, negativePercent];
    chartInstance.update();

    document.getElementById('chart-positive').textContent = `${positivePercent.toFixed(0)}%`;
    document.getElementById('chart-neutral').textContent = `${neutralPercent.toFixed(0)}%`;
    document.getElementById('chart-negative').textContent = `${negativePercent.toFixed(0)}%`;
}

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
                <i class="fas ${item.sentiment.type === 'positive' ? 'fa-smile' : item.sentiment.type === 'negative' ? 'fa-frown' : 'fa-meh'} text-[var(--${item.sentiment.type})]"></i>
            </span>
            <div class="flex-1 min-w-0">
                <p class="text-sm text-[var(--text)] truncate">${item.text}</p>
                <p class="text-xs text-[var(--muted)]">${formatDate(item.createdAt)}</p>
            </div>
        </li>
    `).join('');
}
