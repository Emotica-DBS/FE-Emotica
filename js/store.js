/**
 * store.js
 * Bertindak sebagai "single source of truth" atau database sementara di frontend.
 * Menggunakan localStorage untuk menyimpan data secara persisten.
 */

const HISTORY_KEY = 'emotica_history';
const STATS_KEY = 'emotica_stats';

// --- DATA INITIALIZATION ---

function getInitialHistory() {
    return [
        { id: 'hist_3', text: "Sangat puas dengan pelayanannya, cepat dan ramah!", sentiment: { type: 'positif', score: 0.95 }, createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
        { id: 'hist_2', text: "Baterai perangkat ini cepat sekali habis.", sentiment: { type: 'negatif', score: 0.88 }, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    ];
}

function getInitialStats() {
    return {
        totalAnalyses: 2,
        sentimentDistribution: { positif: 1, negatif: 1 }
    };
}

function loadInitialData(key, initialFunc) {
    const storedData = localStorage.getItem(key);
    try {
        const parsedData = JSON.parse(storedData);
        if (parsedData) {
            // Jika ada data, pastikan formatnya benar sebelum digunakan
            if (key === STATS_KEY && parsedData.sentimentDistribution) {
                return parsedData;
            }
            if (key === HISTORY_KEY && Array.isArray(parsedData) && parsedData.length > 0) {
                return parsedData;
            }
        }
    } catch (e) { /* Abaikan error parsing, akan dibuat ulang */ }
    
    const initialData = initialFunc();
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
}


let currentHistory = loadInitialData(HISTORY_KEY, getInitialHistory);
let currentStats = loadInitialData(STATS_KEY, getInitialStats);

// --- FUNGSI EKSPOR ---

export function getHistory() {
    return currentHistory.map(item => ({...item, createdAt: new Date(item.createdAt)}));
}

export function getStats() {
    return currentStats;
}

export function addAnalysis(newAnalysis) {
    currentHistory.unshift(newAnalysis); 
    
    currentStats.totalAnalyses++;
    
    if (!currentStats.sentimentDistribution[newAnalysis.sentiment.type]) {
        currentStats.sentimentDistribution[newAnalysis.sentiment.type] = 0;
    }
    currentStats.sentimentDistribution[newAnalysis.sentiment.type]++;
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(currentHistory));
    localStorage.setItem(STATS_KEY, JSON.stringify(currentStats));
}
